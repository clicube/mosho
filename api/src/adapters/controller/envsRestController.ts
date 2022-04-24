import { EnvData } from "../../domain/EnvData";
import { getLatestEnvData } from "../../usecases/getLatestEnvData";
import { EnvDataRepository } from "../../usecases/interfaces/EnvDataRepository";
import { saveEnvData } from "../../usecases/saveEnvData";
import { Request, RequestHandler, Response } from "./Controller";
import { errorHandler } from "./errorHandler";

type PostData = {
  timestamp: unknown;
  temperature: unknown;
  humidity: unknown;
  brightness: unknown;
};

class ParseError extends Error {}

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const parseNumber = (value: unknown): number | undefined =>
  isNumber(value) ? value : undefined;

const parseDate = (value: unknown): Date | undefined =>
  isNumber(value) ? new Date(value * 1000) : undefined;

const convertPostDataToEntity = (
  data: unknown,
  location: string
): EnvData | ParseError => {
  if (data === undefined) {
    return new ParseError("data is empty");
  }
  const postData = data as Partial<PostData>;

  const timestamp = parseDate(postData.timestamp);
  const temperature = parseNumber(postData.temperature);
  const humidity = parseNumber(postData.humidity);
  const brightness = parseNumber(postData.brightness);

  if (
    [timestamp, temperature, humidity, brightness].every((e) => e !== undefined)
  ) {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    return {
      timestamp: timestamp!,
      temperature: temperature!,
      humidity: humidity!,
      brightness: brightness!,
      location,
    };
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
  }
  return new ParseError(`Invalid data: ${JSON.stringify(postData)}`);
};

const postData = async (
  data: Request,
  repo: EnvDataRepository
): Promise<Response> => {
  const envData = convertPostDataToEntity(data.body, "home.living_room");
  if (envData instanceof ParseError) {
    return errorHandler(envData, 400);
  }
  await saveEnvData(envData, repo);
  return { body: { result: "ok" } };
};

const getLatestData = async (repo: EnvDataRepository): Promise<Response> => {
  const data = await getLatestEnvData("home.living_room", repo);
  if (data === undefined) {
    return errorHandler(new Error("No Data"));
  }
  return {
    body: {
      timestamp: Math.floor(data.timestamp.getTime() / 1000),
      temperature: data.temperature,
      humidity: data.humidity,
      brightness: data.brightness,
    },
  };
};

export const envsRestController = (
  envDataRepository: EnvDataRepository
): Record<string, RequestHandler> => {
  return {
    postData: (req) => postData(req, envDataRepository),
    getLatestData: (_) => getLatestData(envDataRepository),
  };
};
