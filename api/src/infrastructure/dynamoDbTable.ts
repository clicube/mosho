import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { QueryOptions, Table } from "../adapters/gateway/envDataRepository";

const createExpressionOptions = (options: QueryOptions) => {
  // const attrValue =
  //   typeof options.conditionValue === "string"
  //     ? { S: options.conditionValue }
  //     : { N: options.conditionValue.toString() };
  return {
    KeyConditionExpression: "#k = :v",
    ExpressionAttributeNames: {
      "#k": options.conditionKey,
    },
    ExpressionAttributeValues: {
      ":v": options.conditionValue,
    },
  };
};

export const dynamoDbTable = <T>(tableName: string): Table<T> => {
  const client = new DynamoDBClient({ region: "ap-northeast-1" });
  const docClient = DynamoDBDocumentClient.from(client);

  return {
    query: async (options) => {
      console.log(createExpressionOptions(options));
      const res = await docClient.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: "#k = :v",
          ExpressionAttributeNames: { "#k": options.conditionKey },
          ExpressionAttributeValues: { ":v": options.conditionValue },
          ...(options.order !== undefined
            ? { ScanIndexForward: options.order === "asc" }
            : {}),
          ...(options.limit !== undefined ? { Limit: options.limit } : {}),
        })
      );
      return (res?.Items ?? []) as unknown as T[];
    },

    put: async (value) => {
      await docClient.send(
        new PutCommand({
          TableName: tableName,
          Item: value,
        })
      );
    },
  };
};
