import React, { useContext } from "react";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";

export default function StatusIndicator(props) {
  const theme = useContext(ThemeContext);
  const green = ColorScheme.get_color("green", theme);
  const red = ColorScheme.get_color("red", theme);

  const status_color = props.is_good_status ? green : red;
  let style = {
    backgroundColor: status_color,
  };
  if (theme === THEME.TI) {
    style = {
      width: 28,
      height: 28,
      boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
      ...style,
    };
  } else {
    const border_color = ColorScheme.get_color("bg1", theme);
    style = {
      width: 22,
      height: 22,
      border: `3px solid ${border_color}`,
      borderRadius: 16,
      ...style,
    };
  }

  return (
    <div style={style}></div>
    //   <svg
    //     width="28"
    //     height="28"
    //     viewBox="0 0 28 28"
    //     fill="none"
    //     xmlns="http://www.w3.org/2000/svg"
    //   >
    //     <circle
    //       cx="14"
    //       cy="14"
    //       r="12.5"
    //       fill={status_color}
    //       stroke={border_color}
    //       strokeWidth="3"
    //     />
    //   </svg>
  );
}
