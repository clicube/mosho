import { Command } from "../../domain/Command";
import { executeCommand } from "../../usecases/executeCommand";
import { CommandGateway } from "../../usecases/interfaces/CommandGateway";
import { Request, RequestHandler, Response } from "./Controller";
import { errorHandler } from "./errorHandler";

type PostData = {
  command: string;
  passcode: string;
};

const isValidPasscode = (passcode: string): boolean => {
  const validPasscode = process.env["PASSCORD"];
  if (validPasscode === undefined) {
    return true;
  }
  return passcode === validPasscode;
};

const parseBody = (body: unknown): PostData => {
  if (body === undefined) {
    throw new Error("body is empty");
  }
  const data = body as Partial<PostData>;
  if (typeof data.command !== "string" || typeof data.passcode !== "string") {
    throw new Error("Invalid data");
  }
  return data as PostData;
};

const postData = async (
  data: Request,
  gw: CommandGateway
): Promise<Response> => {
  let body: PostData;
  try {
    body = parseBody(data.body);
  } catch (e) {
    return errorHandler(e as Error, 400);
  }
  if (!isValidPasscode(body.passcode)) {
    return errorHandler(new Error("Invalid passcode"), 401);
  }
  try {
    await gw.execute(body.command);
  } catch (e) {
    return errorHandler(e as Error, 500);
  }

  return { body: { result: "ok" } };
};

export const commandsRestController = (
  cmdGw: CommandGateway
): Record<string, RequestHandler> => {
  return {
    postData: (req) => postData(req, cmdGw),
  };
};
