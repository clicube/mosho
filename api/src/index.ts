import { APIGatewayProxyHandlerV2 } from "aws-lambda/trigger/api-gateway-proxy";

// eslint-disable-next-line @typescript-eslint/require-await
const handler: APIGatewayProxyHandlerV2 = async (_event, _context) => {
  return {
    cookies: [],
    isBase64Encoded: false,
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "hello world!" }),
  };
};

export { handler };

// exports = { handler };
