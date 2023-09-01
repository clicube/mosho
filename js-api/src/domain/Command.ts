export type ColorCommand = {
  type: "color";
  name: string;
  temperature: number;
};

export type BrightnessCommand = {
  type: "brightness";
  brightness: number;
};

export type OnOffCommand = {
  type: "onoff";
  on: boolean;
};

export type Command = ColorCommand | BrightnessCommand | OnOffCommand;
