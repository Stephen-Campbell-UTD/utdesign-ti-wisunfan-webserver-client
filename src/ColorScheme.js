import gruvbox_color_theme from "./gruvbox.js";
import ti_color_theme from "./ti_colors.js";
import { createContext } from "react";

const THEME = {
  TI: "ti",
  GRUVBOX: "gruvbox",
};
Object.freeze(THEME);

const ThemeContext = createContext(THEME.GRUVBOX);

const ColorScheme = {
  color_maps: {
    gruvbox: gruvbox_color_theme,
    ti: ti_color_theme,
  },

  get_color: function (name, theme = THEME.GRUVBOX) {
    return this.color_maps[theme][name];
  },
  get_color_with_opacity: function (color, opacity, theme = THEME.GRUVBOX) {
    //opacity [0,1]
    let hexcolor = this.get_color(color, theme);
    const r = parseInt(hexcolor.substring(1, 3), 16);
    const g = parseInt(hexcolor.substring(3, 5), 16);
    const b = parseInt(hexcolor.substring(5), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  },
};

export { ColorScheme, THEME, ThemeContext };
