import { EnvData } from "../domain/EnvData";
import { EnvDataRepository } from "./interfaces/EnvDataRepository";

export const getLatestEnvData = (
  location: string,
  repo: EnvDataRepository
): Promise<EnvData | undefined> => {
  return repo.getLatest();
};
