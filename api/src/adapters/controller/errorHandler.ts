import { Response } from "./Controller";

export const errorHandler = (error: Error, statusCode = 500): Response => {
  return {
    statusCode,
    body: {
      error: error.name,
      message: error.message,
      ...(error.stack ? { stack: error.stack.split("\n") } : {}),
    },
  };
};
