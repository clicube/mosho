import { DbEnvData } from "./adapters/gateway/envDataRepository";
import { dynamoDbTable } from "./infrastructure/dynamoDbTable";
import * as lambda from "./infrastructure/lambda";

const table = dynamoDbTable<DbEnvData>("mosho-prd-ddb-envs");
export const handler = lambda.handler(table);
