import { EnvData } from "../../domain/EnvData";

export interface EnvDataRepository {
  getLatest(): Promise<EnvData | undefined>;
  save(envData: EnvData): Promise<void>;
}
