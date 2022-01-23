import React from "react";
import "../assets/Monitor.css";
import log_icon from "../icons/log_icon.svg";
import health_icon from "../icons/health_icon.svg";
import delay_icon from "../icons/delay_icon.svg";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";
import PingLog from "./PingLog";
import DelayMonitor from "./DelayMonitor";
import HealthMonitor from "./HealthMonitor";

const MONITOR_STATE = {
  LOG: 0,
  HEALTH: 1,
  DELAY: 2,
};
Object.freeze(MONITOR_STATE);

export default class Monitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      monitor_state: MONITOR_STATE.LOG,
    };
  }

  render() {
    let current_display = null;
    switch (this.state.monitor_state) {
      case MONITOR_STATE.DELAY:
        current_display = <DelayMonitor {...this.props} />;
        break;
      case MONITOR_STATE.LOG:
        current_display = <PingLog {...this.props} />;
        break;
      case MONITOR_STATE.HEALTH:
        current_display = <HealthMonitor {...this.props} />;
        break;
      default:
        console.error(
          "Encountered invalid MONITOR_STATE",
          this.state.monitor_state
        );
    }

    let monitor_tab_button_style = null;
    const theme = this.context;
    if (theme === THEME.TI) {
      monitor_tab_button_style = {
        backgroundColor: ColorScheme.get_color("gray", theme),
      };
    } else {
      const bg0 = ColorScheme.get_color("bg0", theme);
      monitor_tab_button_style = {
        backgroundColor: bg0,
      };
    }

    return (
      <React.Fragment>
        <div className="monitor_tab_button_array">
          <button
            style={monitor_tab_button_style}
            className="monitor_tab_button"
            onClick={() => {
              this.setState({ monitor_state: MONITOR_STATE.LOG });
            }}
          >
            <img src={log_icon} alt="log" />
          </button>
          <button
            style={monitor_tab_button_style}
            className="monitor_tab_button"
            onClick={() => {
              this.setState({ monitor_state: MONITOR_STATE.HEALTH });
            }}
          >
            <img src={health_icon} alt="health" />
          </button>
          <button
            style={monitor_tab_button_style}
            className="monitor_tab_button"
            onClick={() => {
              this.setState({ monitor_state: MONITOR_STATE.DELAY });
            }}
          >
            <img src={delay_icon} alt="delay" />
          </button>
        </div>
        {current_display}
      </React.Fragment>
    );
  }
}
Monitor.contextType = ThemeContext;
