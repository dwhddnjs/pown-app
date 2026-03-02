const tintColorLight = "#2f95dc";
const tintColorDark = "#fff";

const Colors = {
  light: {
    text: "#27272a",
    subText: "#aaaaaa",
    background: "#EFEEF3",
    tint: "#00BAAB",
    pressed: "#15e5d3",
    tabIconDefault: "#EFEEF3",
    tabIconSelected: "#009488",
    tabBar: "#ffffff",
    itemColor: "#ffffff",
    success: "#3A76E2",
    fail: "#F13C33",
    empty: "#EFEEF3",
    hard: "#ffffff",
  },
  dark: {
    text: "#fff",
    subText: "#666666",
    background: "#1a1a1a",
    tint: "#00ccbb",
    pressed: "#12b5a7",
    tabIconDefault: "#555555",
    tabIconSelected: "#00ccbb",
    tabBar: "#1e1e1e",
    itemColor: "#27272a",
    success: "#3A76E2",
    fail: "#F13C33",
    empty: "#1e1e1e",
    hard: "#000000",
  },
} as const;

export type ThemeColorType =
  | (typeof Colors)["light"]
  | (typeof Colors)["dark"]
export default Colors
