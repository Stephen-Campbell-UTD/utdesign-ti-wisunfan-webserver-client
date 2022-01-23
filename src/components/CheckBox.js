import React, { useContext } from "react";
import "../assets/CheckBox.css";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";

export default function CheckBox(props) {
  const theme = useContext(ThemeContext);
  let bg_style = null;
  let fg_style = null;
  if (theme === THEME.TI) {
    bg_style = {
      backgroundColor: ColorScheme.get_color("bg0", theme),
      boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25) ",
    };
    fg_style = {
      backgroundColor: ColorScheme.get_color("gray", theme),
    };
  } else {
    const borderRadius = 5;
    bg_style = {
      backgroundColor: ColorScheme.get_color("bg1", theme),
      borderRadius,
    };
    fg_style = {
      backgroundColor: ColorScheme.get_color("fg0", theme),
    };
  }

  return (
    <div
      style={bg_style}
      className={`${props.className} checkbox_bg`}
      onClick={(event) => {
        props.click_handler(!props.is_checked);
      }}
    >
      {props.is_checked && <div style={fg_style} className="checkbox_fg"></div>}
    </div>
  );
}
