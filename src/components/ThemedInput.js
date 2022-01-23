import { useContext } from "react";
import "../assets/ThemedInput.css";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";

export function ThemedInput(props) {
  const theme = useContext(ThemeContext);
  let input_style = null;
  if (theme === THEME.TI) {
    const background = ColorScheme.get_color("bg0", theme);
    let gray = ColorScheme.get_color("gray", theme);
    input_style = {
      borderTop: `1px solid ${ColorScheme.get_color("red", THEME.TI)}`,
      boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25) ",
      backgroundColor: background,
      borderRadius: 0,
      color: gray,
      fontWeight: 600,
    };
  } else {
    const background = ColorScheme.get_color("bg1", theme);
    input_style = {
      backgroundColor: background,
      color: ColorScheme.get_color("white", theme),
    };
  }
  return (
    <input
      className={"themed_input ".concat(props.className || "")}
      type="text"
      style={{ ...props.style, ...input_style }}
      spellCheck="false"
      value={String(props.value)}
      onChange={props.onChange}
    />
  );
}
