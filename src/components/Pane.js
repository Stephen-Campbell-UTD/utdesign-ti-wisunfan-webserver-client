import { useContext } from "react";
import { ColorScheme, ThemeContext, THEME } from "../ColorScheme";
import "../assets/Pane.css";

export default function Pane(props) {
  const theme = useContext(ThemeContext);
  const style = {
    backgroundColor:
      theme === THEME.TI ? "rgba(0,0,0,0)" : ColorScheme.get_color("bg1"),
  };
  return (
    <div className="pane" style={style}>
      {props.children}
    </div>
  );
}
