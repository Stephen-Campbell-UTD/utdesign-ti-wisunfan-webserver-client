import React, { useContext } from "react";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";
import "../assets/Tile.css";

export function TileHeader(props) {
  const theme = useContext(ThemeContext);
  let title_style = null;
  if (theme === THEME.TI) {
    title_style = {
      color: ColorScheme.get_color("gray", theme),
      fontWeight: 600,
    };
  }
  return (
    <h2 style={title_style} className="tile_header">
      {props.title}
    </h2>
  );
}

export default function Tile(props) {
  const theme = useContext(ThemeContext);
  let surface_style = null;
  if (theme === THEME.TI) {
    surface_style = {
      backgroundColor: ColorScheme.get_color("bg2", theme),
      borderTop: `3px solid ${ColorScheme.get_color("red", theme)}`,
      boxShadow: "0px 1px 14px rgba(0, 0, 0, 0.3)",
      borderRadius: 0,
    };
  } else {
    surface_style = {
      backgroundColor: ColorScheme.get_color("bg2", theme),
      borderRadius: 10,
    };
  }
  return (
    <React.Fragment>
      {!props.omit_header && <TileHeader title={props.title} />}
      <div style={surface_style} className="tile">
        {props.children}
      </div>
    </React.Fragment>
  );
}
