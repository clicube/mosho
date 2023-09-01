import { Response } from "./Controller";

export const errorHandler = (error: Error, statusCode = 500): Response => {
  const response = {
    statusCode,
    body: {
      error: error.name,
      message: error.message,
      ...(error.stack ? { stack: error.stack.split("\n") } : {}),
    },
  };
  console.log(response);
  return response;
};
