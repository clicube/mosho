import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from "aws-lambda/trigger/api-gateway-proxy";
import { envsRestController } from "../adapters/controller/envsRestController";
import { errorHandler } from "../adapters/controller/errorHandler";
import {
  DbEnvData,
  envDataRepository,
} from "../adapters/gateway/envDataRepository";
import { smarthome } from "actions-on-google";
import { aogController } from "../adapters/controller/aogController";
import { Table } from "../adapters/gateway/interfaces/Table";
import {
  commandGateway,
  DbCommandData,
} from "../adapters/gateway/commandGateway";

const parseBody = (event: APIGatewayProxyEventV2): unknown | undefined => {
  if (event.body === undefined) {
    return undefined;
  }
  return JSON.parse(event.body) as unknown;
};

const createResponse = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// eslint-disable-next-line @typescript-eslint/require-await
export const handler: (
  envTable: Table<DbEnvData>,
  commandTable: Table<DbCommandData>
) => APIGatewayProxyHandlerV2 = (envTable, commandTable) => {
  const cmdGw = commandGateway(commandTable);
  const aog = aogController(cmdGw);

  const smarthomeHandler = smarthome();
  smarthomeHandler.onSync(aog.onSync);
  smarthomeHandler.onQuery(aog.onQuery);
  smarthomeHandler.onExecute(aog.onExecute);
  smarthomeHandler.onDisconnect(aog.onDisconnect);

  const envsRepo = envDataRepository(envTable);
  const envsController = envsRestController(envsRepo);

  const routes = [
    {
      method: "GET",
      path: "/envs/latest",
      handler: envsController.getLatestData,
    },
    { method: "POST", path: "/envs", handler: envsController.postData },
  ];

  return async (event, context, ...args) => {
    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;

    if (path === "/aog") {
      try {
        return await (smarthomeHandler(event, context, ...args) as Promise<
          APIGatewayProxyResultV2<never>
        >);
      } catch (e) {
        const res = errorHandler(e as Error);
        return createResponse(res.statusCode ?? 500, res.body);
      }
    }

    const route = routes.find((r) => r.method === method && r.path === path);
    if (route === undefined) {
      return createResponse(404, { message: "Not Found" });
    }
    const body = parseBody(event);
    const res = await route
      .handler({ body })
      .catch((e) => errorHandler(e as Error));
    return createResponse(res.statusCode ?? 200, res.body);
  };
};
