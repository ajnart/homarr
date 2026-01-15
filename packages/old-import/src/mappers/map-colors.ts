const oldColors = [
  "dark",
  "gray",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "green",
  "lime",
  "yellow",
  "orange",
  "teal",
] as const;
type OldColor = (typeof oldColors)[number];

export const mapColor = (color: string | undefined, fallback: string) => {
  if (!color) {
    return fallback;
  }

  if (!oldColors.some((mantineColor) => color === mantineColor)) {
    return fallback;
  }

  const mantineColor = color as OldColor;

  return mappedColors[mantineColor];
};

const mappedColors: Record<(typeof oldColors)[number], string> = {
  blue: "#228be6",
  cyan: "#15aabf",
  dark: "#2e2e2e",
  grape: "#be4bdb",
  gray: "#868e96",
  green: "#40c057",
  indigo: "#4c6ef5",
  lime: "#82c91e",
  orange: "#fd7e14",
  pink: "#e64980",
  red: "#fa5252",
  teal: "#12b886",
  violet: "#7950f2",
  yellow: "#fab005",
};
