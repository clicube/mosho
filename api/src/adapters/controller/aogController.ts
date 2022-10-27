import {
  SmartHomeHandler,
  SmartHomeV1DisconnectRequest,
  SmartHomeV1DisconnectResponse,
  SmartHomeV1ExecuteRequest,
  SmartHomeV1ExecuteResponse,
  SmartHomeV1QueryRequest,
  SmartHomeV1QueryResponse,
  SmartHomeV1SyncDevices,
  SmartHomeV1SyncRequest,
  SmartHomeV1SyncResponse,
} from "actions-on-google";
import { Command } from "../../domain/Command";
import { Device } from "../../domain/Device";
import { executeCommand } from "../../usecases/executeCommand";
import { getDevices } from "../../usecases/getDevices";
import { CommandGateway } from "../../usecases/interfaces/CommandGateway";

interface AogController {
  onSync: SmartHomeHandler<SmartHomeV1SyncRequest, SmartHomeV1SyncResponse>;
  onQuery: SmartHomeHandler<SmartHomeV1QueryRequest, SmartHomeV1QueryResponse>;
  onExecute: SmartHomeHandler<
    SmartHomeV1ExecuteRequest,
    SmartHomeV1ExecuteResponse
  >;
  onDisconnect: SmartHomeHandler<
    SmartHomeV1DisconnectRequest,
    SmartHomeV1DisconnectResponse
  >;
}

const createCommand = (
  body: SmartHomeV1ExecuteRequest
): Command | undefined => {
  const execution = body.inputs[0].payload.commands[0].execution[0];
  switch (execution.command) {
    case "action.devices.commands.OnOff":
      return {
        type: "onoff",
        on: (execution.params?.on as boolean | undefined) ?? false,
      };
    case "action.devices.commands.BrightnessAbsolute":
      return {
        type: "brightness",
        brightness: (execution.params?.brightness as number | undefined) ?? 0,
      };
    case "action.devices.commands.ColorAbsolute":
      return {
        type: "color",
        name:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (execution.params?.color?.name as string | undefined) ?? "unknown",
        temperature:
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (execution.params?.color?.temperature as number | undefined) ?? 3000,
      };
  }
  return undefined;
};

const deviceToAogDevice = (device: Device): SmartHomeV1SyncDevices => ({
  id: device.id.toString(),
  type: "action.devices.types.LIGHT",
  name: {
    name: device.name,
    defaultNames: [device.name],
    nicknames: [device.name],
  },
  traits: [
    "action.devices.traits.OnOff",
    "action.devices.traits.Brightness",
    "action.devices.traits.ColorSetting",
  ],
  willReportState: false,
  roomHint: device.location,
  attributes: {
    commandOnlyOnOff: true,
    colorTemperatureRange: {
      temperatureMinK: 2000,
      temperatureMaxK: 5000,
    },
    commandOnlyColorSetting: false,
  },
});

export const aogController = (gateway: CommandGateway): AogController => ({
  onSync: (body) => {
    console.log("onSync", body);
    return {
      requestId: body.requestId,
      payload: {
        agentUserId: "dummy",
        devices: getDevices().map(deviceToAogDevice),
      },
    };
  },
  onQuery: (body) => {
    console.log("onQuery", body);
    return {
      requestId: body.requestId,
      payload: {
        devices: getDevices().reduce(
          (map, d) => (map[d.id] = { online: true }),
          {} as Record<number, { online: boolean }>
        ),
      },
    };
  },
  onExecute: async (body) => {
    console.log("onExecute", body);
    const command = createCommand(body);
    if (command === undefined) {
      return {
        requestId: body.requestId,
        payload: {
          commands: [
            {
              ids: body.inputs[0].payload.commands[0].devices.map((d) => d.id),
              status: "ERROR",
              states: {
                online: true,
              },
            },
          ],
        },
      };
    }
    await executeCommand(command, gateway);
    return {
      requestId: body.requestId,
      payload: {
        commands: [
          {
            ids: body.inputs[0].payload.commands[0].devices.map((d) => d.id),
            status: "SUCCESS",
            states: {
              online: true,
            },
          },
        ],
      },
    };
  },
  onDisconnect: () => {
    console.log("onDisconnect");
    return {};
  },
});
