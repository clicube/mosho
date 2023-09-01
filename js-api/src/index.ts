import { DbCommandData } from "./adapters/gateway/commandGateway";
import { DbEnvData } from "./adapters/gateway/envDataRepository";
import { dynamoDbTable } from "./infrastructure/dynamoDbTable";
import { firestoreTable } from "./infrastructure/firestoreTable";
import * as lambda from "./infrastructure/lambda";

const envTable = dynamoDbTable<DbEnvData>("mosho-prd-ddb-envs");
const commandTable = firestoreTable<DbCommandData>("commands");
export const handler = lambda.handler(envTable, commandTable);
