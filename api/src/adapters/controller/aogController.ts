import {
  SmartHomeHandler,
  SmartHomeV1DisconnectRequest,
  SmartHomeV1DisconnectResponse,
  SmartHomeV1ExecuteRequest,
  SmartHomeV1ExecuteResponse,
  SmartHomeV1QueryRequest,
  SmartHomeV1QueryResponse,
  SmartHomeV1SyncRequest,
  SmartHomeV1SyncResponse,
} from "actions-on-google";
import { Command } from "../../domain/Command";
import { executeCommand } from "../../usecases/executeCommand";
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

const devices = [
  {
    id: "1",
    type: "action.devices.types.LIGHT",
    traits: [
      "action.devices.traits.OnOff",
      "action.devices.traits.Brightness",
      "action.devices.traits.ColorSetting",
    ],
    name: {
      name: "リビングの照明",
      defaultNames: ["リビングの照明"],
      nicknames: ["リビングの照明"],
    },
    willReportState: false,
    roomHint: "リビング",
    attributes: {
      commandOnlyOnOff: true,
      colorTemperatureRange: {
        temperatureMinK: 2000,
        temperatureMaxK: 5000,
      },
      commandOnlyColorSetting: false,
    },
  },
];

const createCommand = (
  body: SmartHomeV1ExecuteRequest
): Command | undefined => {
  console.log(body);
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

export const aogController = (gateway: CommandGateway): AogController => ({
  onSync: (body) => {
    return {
      requestId: body.requestId,
      payload: {
        agentUserId: "dummy",
        devices: devices,
      },
    };
  },
  onQuery: (body) => {
    return {
      requestId: body.requestId,
      payload: {
        devices: {
          1: {
            online: true,
          },
        },
      },
    };
  },
  onExecute: async (body) => {
    const command = createCommand(body);
    if (command === undefined) {
      return {
        requestId: body.requestId,
        payload: {
          commands: [
            {
              ids: ["1"],
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
            ids: ["1"],
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
    return {};
  },
});
