import React, { useRef, useState } from "react";
import Slider from "./Slider";
import "../assets/PingConfig.css";
import PingSubmit from "./PingSubmit";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";
import CheckBox from "./CheckBox";
import { ThemedInput } from "./ThemedInput";
import { useContext } from "react";

function NumberOfPackets(props) {
  const theme = useContext(ThemeContext);
  const [isInfinite, setIsInfinite] = useState(false);
  const lastKnownFiniteNumPackets = useRef(props.num_packets);
  let fontSize = isInfinite ? 20 : 14;

  const updateIsInfinite = (newVal) => {
    setIsInfinite(newVal);
    props.value_change_handler(
      props.name,
      newVal ? "∞" : String(lastKnownFiniteNumPackets.current)
    );
  };

  const onChangeHandler = ({ target }) => {
    if (isInfinite) {
      return;
    }
    const newVal = target.value;
    lastKnownFiniteNumPackets.current = newVal;
    props.value_change_handler(props.name, newVal);
  };
  return (
    <div className="num_packets_container">
      <div>
        <CheckBox
          className={"is_infinite_checkbox ".concat(theme)}
          is_checked={isInfinite}
          click_handler={updateIsInfinite}
        />
      </div>
      <ThemedInput
        value={props.num_packets}
        style={{ marginLeft: 10, width: "16%", fontSize }}
        onChange={onChangeHandler}
      />
    </div>
  );
}

export default class PingConfiguration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      packet_size: 53,
      timeout: 500,
      interval: 1000,
      num_packets: 10,
    };
  }

  send_pingburst = (destination_ip) => {
    const pc_ids = ["packet_size", "num_packets", "timeout", "interval"];
    const pingburst_request = {};
    for (const id of pc_ids) {
      pingburst_request[id] = this.state[id];
    }
    pingburst_request["dest_ip"] = destination_ip;
    const request_opts = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
    };
    request_opts["body"] = JSON.stringify(pingburst_request);
    fetch(
      new URL("pingbursts", document.ping_api_location),
      request_opts
    ).catch((err) => console.log(err));
    // console.log("Sent Pingburst!", pingburst_request);
  };

  click_handler = () => {
    const destination_ips = [];
    for (let ip_info of this.props.ip_address_info_array)
      if (ip_info.is_selected) {
        destination_ips.push(ip_info.ip_address);
      }
    destination_ips.forEach((ip) => {
      this.send_pingburst(ip);
    });
  };

  parameter_change_handler = (name, value) => {
    this.setState((state) => {
      if (name === "interval" && value < state.timeout) {
        return {
          interval: value,
          timeout: value,
        };
      }
      if (name === "timeout" && value > state.interval) {
        return {
          interval: value,
          timeout: value,
        };
      }
      return { [name]: value };
    });
  };

  render() {
    const theme = this.context;
    let labelStyle = null;
    if (theme === THEME.TI) {
      labelStyle = {
        color: ColorScheme.get_color("gray", theme),
        fontWeight: 600,
      };
    } else {
      labelStyle = {};
    }

    return (
      <div className="ping_form_container">
        <label style={labelStyle} className="ping_form_label">
          Packet Size [B]
        </label>
        <Slider
          min={0}
          step={25}
          max={1000}
          name="packet_size"
          value={this.state.packet_size}
          value_change_handler={this.parameter_change_handler}
        />
        <label style={labelStyle} className="ping_form_label">
          Timeout [ms]
        </label>
        <Slider
          min={0}
          step={500}
          max={9999}
          name="timeout"
          value={this.state.timeout}
          value_change_handler={this.parameter_change_handler}
        />
        <label style={labelStyle} className="ping_form_label">
          Interval [ms]
        </label>
        <Slider
          min={0}
          step={500}
          max={9999}
          name="interval"
          value={this.state.interval}
          value_change_handler={this.parameter_change_handler}
        />
        <label style={labelStyle} className="ping_form_label">
          Number of Packets
        </label>
        <NumberOfPackets
          name="num_packets"
          value_change_handler={this.parameter_change_handler}
          num_packets={this.state.num_packets}
        />
        <PingSubmit click_handler={this.click_handler} />
      </div>
    );
  }
}

PingConfiguration.contextType = ThemeContext;
