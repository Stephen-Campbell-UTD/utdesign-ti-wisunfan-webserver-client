import React from "react";
import "./App.css";
import app_fonts from "./AppFonts.js";
import { THEME, ColorScheme, ThemeContext } from "./ColorScheme";
import Pane from "./components/Pane";
import Tile, { TileHeader } from "./components/Tile";
import PingConfig from "./components/PingConfig";
import AtAGlance from "./components/AtAGlance";
import Monitor from "./components/Monitor";
import IPAddressTable from "./components/IPAddressTable";
import Topology from "./components/Topology";
import produce from "immer";
import ThemeToggle from "./components/ThemeToggle";
import SettingsButton from "./components/SettingsButton";
import { compareObjects, mergeObjectsInPlace } from "./utils";
import { PingJobsButton } from "./components/PingJobsButton";

function nickname_generator(seed) {
  const nicknames = [
    "Alfa",
    "Bravo",
    "Charlie",
    "Delta",
    "Echo",
    "Foxtrot",
    "Golf",
    "Hotel",
    "India",
    "Juliett",
    "Kilo",
    "Lima",
    "Mike",
    "November",
    "Oscar",
    "Papa",
    "Quebec",
    "Romeo",
    "Sierra",
    "Tango",
    "Uniform",
    "Victor",
    "Whiskey",
    "X-ray",
    "Yankee",
    "Zulu",
  ];
  // const index = Math.floor(Math.random() * nicknames.length);
  const index = seed % nicknames.length;
  return nicknames[index];
}

export function get_ip_address_info_by_ip(ip_address_info_array, ip) {
  for (const ip_address_info of ip_address_info_array) {
    if (ip_address_info.ip_address === ip) {
      return ip_address_info;
    }
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topology: { nodes: [], edges: [] },
      ip_address_info_array: [],
      pingbursts: [],
      ping_api_location: "http://localhost:8000",
      theme: THEME.TI,
    };

    let body = document.getElementsByTagName("body")[0];
    body.style.backgroundColor = ColorScheme.get_color("bg0", this.state.theme);
    body.style.boxSizing = "border-box";
    body.style.margin = "0";

    for (const key in app_fonts) {
      body.style[key] = app_fonts[key];
    }

    document.ping_api_location = this.state.ping_api_location;

    //update pingbursts func
    setInterval(async () => {
      this.update_pingbursts();
      this.update_topology_and_ip_address_info_array();
    }, 1000);
  }

  async fetch_api_endpoint(endpoint) {
    try {
      let res = await fetch(new URL(endpoint, document.ping_api_location));
      if (!res.ok) {
        throw Error("[PING MODULE FETCH] : Received not ok response");
      }
      return await res.json();
    } catch (error) {
      console.debug(error);
      return {};
    }
  }

  async update_topology_and_ip_address_info_array() {
    let new_topology = await this.fetch_api_endpoint("topology");
    const areEqual = compareObjects(new_topology, this.state.topology);
    if (areEqual) {
      return;
    }
    this.setState((state) => {
      return produce(state, (draft) => {
        //find diff of ip_addresses
        function calc_diff_ips(old_topology, new_topology) {
          function difference(setA, setB) {
            let _difference = new Set(setA);
            for (let elem of setB) {
              _difference.delete(elem);
            }
            return _difference;
          }
          const old_ips = old_topology.nodes.reduce(
            (ip_set, node) => ip_set.add(node.data.id),
            new Set()
          );
          const new_ips = new_topology.nodes.reduce(
            (ip_set, node) => ip_set.add(node.data.id),
            new Set()
          );

          let ips_to_add = difference(new_ips, old_ips);
          let ips_to_remove = difference(old_ips, new_ips);
          return {
            ips_to_add,
            ips_to_remove,
          };
        }

        const { ips_to_add, ips_to_remove } = calc_diff_ips(
          draft.topology,
          new_topology
        );
        let ips_to_add_array = [...ips_to_add];
        //Add new entries to ip_address_info_array
        const ip_address_info_to_add = ips_to_add_array.map(
          (ip_address, index) => {
            const nickname = nickname_generator(index);
            return {
              is_selected: false,
              ip_address,
              nickname,
              is_connected: true,
            };
          }
        );

        draft.ip_address_info_array.push(...ip_address_info_to_add);
        draft.ip_address_info_array = draft.ip_address_info_array.filter(
          (ip_info) => !ips_to_remove.has(ip_info.ip_address)
        );

        draft.topology = new_topology;
      });
    });
  }

  async update_pingbursts() {
    let new_pingbursts = await this.fetch_api_endpoint("pingbursts");
    const areEqual = compareObjects(new_pingbursts, this.state.pingbursts);
    if (areEqual) {
      return;
    }
    this.setState((prevState) => {
      const newState = produce(prevState, (draft) => {
        mergeObjectsInPlace(draft.pingbursts, new_pingbursts);
      });
      return newState;
    });
  }

  ip_selection_handler = (ip, is_selected) => {
    this.setState((state) =>
      produce(state, (draft) => {
        const ip_address_info = draft.ip_address_info_array.find(
          (info) => info.ip_address === ip
        );
        ip_address_info.is_selected = is_selected;
      })
    );
  };

  change_ping_api_location_handler = (ping_api_location) => {
    document.ping_api_location = ping_api_location;
    this.setState({ ping_api_location });
  };

  setColorSchemeToCSSVars() {
    const cmap = ColorScheme.color_maps[this.state.theme];
    for (let color in cmap) {
      document.body.style.setProperty(`--${color}`, cmap[color]);
    }
  }

  setScrollbarToCurrentTheme() {
    let body = document.body;
    if (this.state.theme === THEME.TI) {
      body.style.setProperty("--scrollbar_bg", "rgba(0,0,0,0.1)");
      body.style.setProperty("--thumb_bg", "rgba(0,0,0,0.4)");
      body.style.setProperty("--thumb_bg_hover", "rgba(0,0,0,0.6)");
    } else {
      body.style.setProperty("--scrollbar_bg", ColorScheme.get_color("bg0"));
      body.style.setProperty("--thumb_bg", ColorScheme.get_color("bg1"));
      body.style.setProperty("--thumb_bg_hover", ColorScheme.get_color("bg2"));
    }
  }

  render() {
    let body = document.getElementsByTagName("body")[0];
    body.style.backgroundColor = ColorScheme.get_color("bg0", this.state.theme);
    this.setScrollbarToCurrentTheme();
    this.setColorSchemeToCSSVars();
    const dash_title_container_style = {
      backgroundColor:
        this.state.theme === "ti"
          ? ColorScheme.get_color("red", THEME.TI)
          : "rgba(0,0,0,0)",
    };
    return (
      <ThemeContext.Provider value={this.state.theme}>
        <div className="top_vstack">
          <div
            className="dash_title_container"
            style={dash_title_container_style}
          >
            <h1 className="dash_title">Your Wi-SUN Network</h1>
            <div
              style={{
                marginRight: "5.9427vw",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <ThemeToggle
                handle_new_theme={(theme) => this.setState({ theme })}
              />
              <PingJobsButton {...this.state} />
              <SettingsButton
                change_handler={this.change_ping_api_location_handler}
                {...this.state}
              />
            </div>
          </div>
          <div className="pane_container">
            <Pane>
              <div className="tile_container_full tile_container_common">
                <Tile title="Topology">
                  <Topology
                    ip_selection_handler={this.ip_selection_handler}
                    ip_address_info_array={this.state.ip_address_info_array}
                    elements={this.state.topology}
                  />
                </Tile>
              </div>
              <div className="tile_container_full tile_container_common">
                <TileHeader title="IP Addresses" />
                <IPAddressTable
                  ip_selection_handler={this.ip_selection_handler}
                  ip_address_info_array={this.state.ip_address_info_array}
                />
              </div>
            </Pane>
            <Pane>
              <div className="tile_container_hstack tile_container_common">
                <div className="tile_container_half">
                  <Tile title="Ping Config">
                    <PingConfig
                      ip_address_info_array={this.state.ip_address_info_array}
                    />
                  </Tile>
                </div>
                <div className="tile_container_half">
                  <Tile title="At A Glance">
                    <AtAGlance {...this.state} />
                  </Tile>
                </div>
              </div>
              <div className="tile_container_full tile_container_common">
                <Monitor {...this.state} />
              </div>
            </Pane>
          </div>
        </div>
      </ThemeContext.Provider>
    );
  }
}
