export interface CommandGateway {
  execute: (commandName: string) => Promise<void>;
}
