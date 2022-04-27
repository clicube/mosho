import { CommandGateway } from "../../usecases/interfaces/CommandGateway";
import { Table } from "./interfaces/Table";

export type DbCommandData = {
  id: number;
  command: string;
};

export const commandGateway = (table: Table<DbCommandData>): CommandGateway => {
  return {
    execute: async (commandName) => {
      await table.put({
        id: new Date().getTime(),
        command: commandName,
      });
    },
  };
};
