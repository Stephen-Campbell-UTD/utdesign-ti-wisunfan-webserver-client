import React, { useContext } from "react";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";
import { motion } from "framer-motion";
import "../assets/Tooltip.css";
import Tooltip from "./Tooltip";

export default function MagnitudeIndicator(props) {
  const theme = useContext(ThemeContext);

  const height = 21;

  const background_style = {
    height,
    position: "relative",
    width: "80%",
    marginLeft: "auto",
    marginRight: "auto",
    overflow: "hidden",
  };

  const thresholds = {
    0.33: ColorScheme.get_color("green", theme),
    0.66: ColorScheme.get_color("yellow", theme),
    0.9: ColorScheme.get_color("red", theme),
  };

  //determine foreground color with threshold
  const value = Math.max(Math.min(1, props.value), 0);
  let foreground_color;
  for (let threshold_val in thresholds) {
    foreground_color = thresholds[threshold_val];
    if (threshold_val > value) {
      break;
    }
  }
  const foreground_style = {
    backgroundColor: foreground_color,
    height,
    width: `${value * 100}%`,
  };
  if (theme === THEME.TI) {
    background_style["backgroundColor"] = ColorScheme.get_color("bg0", theme);
    background_style["boxShadow"] = "0px 0px 4px rgba(0, 0, 0, 0.3)";
  } else {
    background_style["backgroundColor"] = ColorScheme.get_color("bg1", theme);
    background_style["borderRadius"] = 9;
    foreground_style["borderRadius"] = 9;
  }

  for (let key in props.style) {
    background_style[key] = props.style[key];
    foreground_style[key] = props.style[key];
  }
  // const width = (value * 0.9 + 0.15) * 100;
  const width = value * 100;
  return (
    <Tooltip
      style={{ width: "80%", left: "10%", right: 0 }}
      content={props.tooltip || "N/A"}
    >
      <div style={background_style}>
        <motion.div
          animate={{ width }}
          transition={{ duration: 0.5 }}
          initial={false}
          style={foreground_style}
        />
      </div>
    </Tooltip>
  );
}
