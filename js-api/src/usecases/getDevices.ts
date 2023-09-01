import { Device } from "../domain/Device";

export const getDevices = () => {
  const devices: Device[] = [
    {
      id: 1,
      type: "light",
      name: "リビングのライト",
      location: "リビング",
    },
  ];
  return devices;
};
