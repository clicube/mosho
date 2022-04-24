import { EnvData } from "../../domain/EnvData";
import { EnvDataRepository } from "../../usecases/interfaces/EnvDataRepository";

export type QueryOptions = {
  conditionKey: string;
  conditionValue: string | number;
  orderBy?: string;
  order?: "asc" | "desc";
  limit?: number;
};

export interface Table<T> {
  query(options: QueryOptions): Promise<T[]>;
  put(value: T): Promise<void>;
}

export type DbEnvData = {
  location: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  brightness: number;
  ttl: number;
};

const convertDbDataToEntity = (data: DbEnvData): EnvData => {
  return {
    location: data.location,
    timestamp: new Date(data.timestamp * 1000),
    temperature: data.temperature,
    humidity: data.humidity,
    brightness: data.brightness,
  };
};

export const envDataRepository: (
  table: Table<DbEnvData>
) => EnvDataRepository = (table) => ({
  getLatest: async () => {
    const records = await table.query({
      conditionKey: "location",
      conditionValue: "home.living_room",
      orderBy: "time",
      order: "desc",
      limit: 1,
    });
    if (records?.length > 0) {
      const record = records[0];
      return convertDbDataToEntity(record);
    }
    return undefined;
  },
  save: async (data) => {
    await table.put({
      timestamp: data.timestamp.getTime() / 1000,
      location: data.location,
      temperature: data.temperature,
      humidity: data.humidity,
      brightness: data.brightness,
      ttl: Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24,
    });
  },
});
