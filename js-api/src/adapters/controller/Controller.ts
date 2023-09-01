export type Request = {
  body: unknown;
};

export type Response = {
  statusCode?: number;
  body: unknown;
};

export type RequestHandler = (req: Request) => Promise<Response>;
