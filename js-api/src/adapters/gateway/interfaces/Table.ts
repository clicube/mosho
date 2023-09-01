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
