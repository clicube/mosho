import { EnvData } from "../domain/EnvData";
import { EnvDataRepository } from "./interfaces/EnvDataRepository";

export const saveEnvData = (
  envData: EnvData,
  repo: EnvDataRepository
): Promise<void> => {
  return repo.save(envData);
};
