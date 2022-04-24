import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
} from "aws-lambda/trigger/api-gateway-proxy";
import { envsRestController } from "../adapters/controller/envsRestController";
import { errorHandler } from "../adapters/controller/errorHandler";
import {
  DbEnvData,
  envDataRepository,
  Table,
} from "../adapters/gateway/envDataRepository";

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
export const handler: (table: Table<DbEnvData>) => APIGatewayProxyHandlerV2 = (
  table
) => {
  const envsRepo = envDataRepository(table);
  const envsController = envsRestController(envsRepo);

  const routes = [
    {
      method: "GET",
      path: "/envs/latest",
      handler: envsController.getLatestData,
    },
    { method: "POST", path: "/envs", handler: envsController.postData },
  ];

  return async (event, _context) => {
    const method = event.requestContext.http.method;
    const path = event.requestContext.http.path;
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
