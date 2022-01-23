import React from "react";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";
import "../assets/Slider.css";
import ReactRangeSlider from "./ReactRangeSlider";
import { ThemedInput } from "./ThemedInput";

export default class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.slider_container_ref = React.createRef();
  }

  componentDidMount() {}

  textChangeHandler = (event) => {
    let val = event.target.value;
    const is_valid_number = /^-{0,1}\d+$/.test(val);
    if (!is_valid_number) {
      return;
    }
    val = Math.max(this.props.min, val);
    val = Math.min(this.props.max, val);
    this.changeHandler(val);
  };

  changeHandler = (value) => {
    this.props.value_change_handler(this.props.name, value);
  };

  render() {
    const theme = this.context;
    const progress_color = ColorScheme.get_color("blue", theme);
    const slider_height = 12;
    let background = null;
    let handle_radius = null;
    let main_border_radius = null;
    let handle_style = {
      cursor: "pointer",
      position: "absolute",
      top: "50%",
      transform: "translate3d(-50%, -50%, 0)",
    };
    if (theme === THEME.TI) {
      background = ColorScheme.get_color("bg0", theme);
      handle_radius = 0;
      main_border_radius = 0;
      handle_style = {
        width: slider_height * 2,
        height: (slider_height * 3) / 2,
        backgroundColor: progress_color,
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        ...handle_style,
      };
    } else {
      background = ColorScheme.get_color("bg1", theme);
      handle_radius = (slider_height * 5) / 6;
      main_border_radius = 9;
      handle_style = {
        borderRadius: handle_radius,
        width: handle_radius * 2,
        height: handle_radius * 2,
        backgroundColor: progress_color,
        border: `1px solid ${background}`,
        boxShadow: "none",
        ...handle_style,
      };
    }
    const step = this.props.step || 1;

    const fill_style = {
      display: "block",
      height: slider_height,
      backgroundColor: progress_color,
      borderRadius: main_border_radius,
      position: "absolute",
    };
    const rail_style = {
      borderRadius: main_border_radius,
      height: slider_height,
      position: "relative",
      backgroundColor: background,
      width: "60%",
    };

    return (
      <div ref={this.slider_container_ref} className="slider_container">
        <ReactRangeSlider
          handle_style={handle_style}
          tooltip={false}
          fill_style={fill_style}
          rail_style={rail_style}
          min={this.props.min}
          max={this.props.max}
          step={step}
          value={this.props.value}
          onChange={this.changeHandler}
        />
        <ThemedInput
          className="slider_input"
          value={this.props.value}
          onChange={this.textChangeHandler}
        />
      </div>
    );
  }
}
Slider.contextType = ThemeContext;
