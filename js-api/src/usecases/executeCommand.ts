import { Command } from "../domain/Command";
import { CommandGateway } from "./interfaces/CommandGateway";

export const executeCommand = async (
  command: Command,
  gateway: CommandGateway
): Promise<void> => {
  let moshoCmd: string;
  switch (command.type) {
    case "onoff":
      moshoCmd = command.on ? "light-on-danran" : "light-off";
      break;
    case "brightness": {
      const brightness = command.brightness;
      if (brightness > 90) {
        moshoCmd = "light-on-full";
      } else if (brightness > 50) {
        moshoCmd = "light-on-danran";
      } else if (brightness > 20) {
        moshoCmd = "light-on-kutsurogi";
      }
      // FIXME: 常夜灯点灯中は受信感度が下がるために無効化
      // else if (brightness > 0) {
      //   moshoCmd = "light-on-memory-night";
      // }
      else {
        moshoCmd = "light-off";
      }
      break;
    }
    case "color":
      if (command.temperature > 3000) {
        moshoCmd = "light-on-full";
      } else {
        moshoCmd = "light-on-scene";
      }
  }
  await gateway.execute(moshoCmd);
};
