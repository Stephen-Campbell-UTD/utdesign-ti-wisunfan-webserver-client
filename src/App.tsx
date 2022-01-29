import React from 'react';
import './App.css';
import {THEME, ColorScheme, ThemeContext} from './ColorScheme';
import produce from 'immer';
import ThemeToggle from './components/ThemeToggle';
import SettingsButton from './components/SettingsButton';
import {compareObjects, mergeObjectsInPlace, nicknameGenerator} from './utils';
import {PingJobsButton} from './components/PingJobsButton';
import TabSelector from './components/TabSelector';
import MonitorTab from './components/MonitorTab';
import ConfigTab from './components/ConfigTab';
import {AppContext} from './Contexts';
import {CytoscapeTopology, IPAddressInfo, Pingburst} from './types';
import {APIService} from './APIService';
import ConnectBorderRouterMessage from './components/ConnectBorderRouterMessage';
import InvalidHostMessage from './components/InvalidHostMessage';

export function getIPAddressInfoByIP(ipAddressInfoArray: IPAddressInfo[], ip: string) {
  for (const ipAddressInfo of ipAddressInfoArray) {
    if (ipAddressInfo.ipAddress === ip) {
      return ipAddressInfo;
    }
  }
  throw Error('IP Not Found');
}

export interface NCPProperties {
  'NCP:ProtocolVersion': string;
  'NCP:Version': string;
  'NCP:InterfaceType': string;
  'NCP:HardwareAddress': string;
  'NCP:CCAThreshold': string;
  'NCP:TXPower': string;
  'NCP:Region': string;
  'NCP:ModeID': string;
  unicastchlist: string;
  broadcastchlist: string;
  asyncchlist: string;
  chspacing: string;
  ch0centerfreq: string;
  'Network:Panid': string;
  bcdwellinterval: string;
  ucdwellinterval: string;
  bcinterval: string;
  ucchfunction: string;
  bcchfunction: string;
  macfilterlist: string[];
  macfiltermode: string;
  'Interface:Up': boolean;
  'Stack:Up': boolean;
  'Network:NodeType': string;
  'Network:Name': string;
  dodagroutedest: string;
  dodagroute: string;
  connecteddevices: string[];
  numconnected: string;
  'IPv6:AllAddresses': string;
}

const DEFAULT_NCP_PROPERTY_VALUES = {
  'NCP:ProtocolVersion': '',
  'NCP:Version': '',
  'NCP:InterfaceType': '',
  'NCP:HardwareAddress': '',
  'NCP:CCAThreshold': '',
  'NCP:TXPower': '',
  'NCP:Region': '',
  'NCP:ModeID': '',
  unicastchlist: '',
  broadcastchlist: '',
  asyncchlist: '',
  chspacing: '',
  ch0centerfreq: '',
  'Network:Panid': '',
  bcdwellinterval: '',
  ucdwellinterval: '',
  bcinterval: '',
  ucchfunction: '',
  bcchfunction: '',
  macfilterlist: [],
  macfiltermode: '',
  'Interface:Up': false,
  'Stack:Up': false,
  'Network:NodeType': '',
  'Network:Name': '',
  dodagroutedest: '',
  dodagroute: '',
  connecteddevices: [],
  numconnected: '',
  'IPv6:AllAddresses': '',
};

enum TAB_VIEW {
  MONITOR = 'Monitor',
  CONFIG = 'Config',
  CONNECT = 'Connect',
  INVALID_HOST = 'Invalid Host',
}

interface AppState {
  readonly topology: CytoscapeTopology;
  readonly ipAddressInfoArray: IPAddressInfo[];
  readonly pingbursts: Pingburst[];
  readonly connected: boolean;
  readonly ncpProperties: NCPProperties;
  readonly tabView: TAB_VIEW;
  readonly theme: THEME;
}
interface AppProps {}

export default class App extends React.Component<AppProps, AppState> {
  /** NCP Properties that are compared to when properties for setProps.  */
  cachedNCPProperties: NCPProperties | null = null;
  state = {
    topology: {nodes: [], edges: []},
    ipAddressInfoArray: [],
    pingbursts: [],
    connected: false,
    ncpProperties: DEFAULT_NCP_PROPERTY_VALUES,
    tabView: TAB_VIEW.INVALID_HOST,
    theme: THEME.TI,
  };
  constructor(props: AppProps) {
    super(props);

    let body = document.getElementsByTagName('body')[0];
    body.style.backgroundColor = ColorScheme.getColor('bg0', this.state.theme);

    //update pingbursts func
    this.updateAppState().catch(e => console.error(e));
    setInterval(this.updateAppState, 1000);
  }

  updateAppState = async () => {
    //updates state.connected
    await this.updateConnected();
    if (this.state.connected) {
      this.updatePingbursts();
      this.updateTopologyAndIPAddressInfoArray();
    }
  };

  updateTopologyAndIPAddressInfoArray = async () => {
    let newTopology: CytoscapeTopology;
    try {
      newTopology = await APIService.getTopology();
    } catch (e) {
      console.error(e);
      return;
    }
    const areEqual = compareObjects(newTopology, this.state.topology);
    if (areEqual) {
      return;
    }
    this.setState(state => {
      return produce(state, draft => {
        //find diff of ip_addresses
        function calcDiffIPs(
          oldTopology: CytoscapeTopology,
          newTopology: CytoscapeTopology
        ): {ipsToAdd: Set<string>; ipsToRemove: Set<string>} {
          function difference<SetMemberType>(
            setA: Set<SetMemberType>,
            setB: Set<SetMemberType>
          ): Set<SetMemberType> {
            let _difference = new Set(setA);
            for (let elem of Array.from(setB)) {
              _difference.delete(elem);
            }
            return _difference;
          }
          const oldIPs = oldTopology.nodes.reduce(
            (ipSet, node) => ipSet.add(node.data.id),
            new Set<string>()
          );
          const newIPs = newTopology.nodes.reduce(
            (ipSet, node) => ipSet.add(node.data.id),
            new Set<string>()
          );

          let ipsToAdd = difference<string>(newIPs, oldIPs);
          let ipsToRemove = difference<string>(oldIPs, newIPs);
          return {
            ipsToAdd,
            ipsToRemove,
          };
        }

        const {ipsToAdd, ipsToRemove} = calcDiffIPs(draft.topology, newTopology);
        let ipsToAddArray = Array.from(ipsToAdd);
        //Add new entries to ipAddressInfoArray

        const ipAddressInfoToAdd = ipsToAddArray.map((ipAddress: string, index: number) => {
          const nickname = nicknameGenerator(index);
          return {
            isSelected: false,
            ipAddress,
            nickname,
            isConnected: true,
          };
        });

        draft.ipAddressInfoArray.push(...ipAddressInfoToAdd);
        draft.ipAddressInfoArray = draft.ipAddressInfoArray.filter(
          ipInfo => !ipsToRemove.has(ipInfo.ipAddress)
        );

        draft.topology = newTopology;
      });
    });
  };

  receivedNetworkError(e: unknown) {
    this.setState({connected: false, tabView: TAB_VIEW.INVALID_HOST});
  }

  updatePingbursts = async () => {
    let newPingbursts: Pingburst[];
    try {
      newPingbursts = await APIService.getPingbursts();
    } catch (e) {
      this.receivedNetworkError(e);
      return;
    }
    const areEqual = compareObjects(newPingbursts, this.state.pingbursts);
    if (areEqual) {
      return;
    }
    this.setState(prevState => {
      const newState = produce(prevState, draft => {
        mergeObjectsInPlace(draft.pingbursts, newPingbursts);
      });
      return newState;
    });
  };

  updateNCPProperties = async () => {
    let newNCPProperties: NCPProperties;
    try {
      newNCPProperties = await APIService.getProps();
      this.cachedNCPProperties = newNCPProperties;
    } catch (e) {
      this.receivedNetworkError(e);
      return;
    }
    this.setState({ncpProperties: newNCPProperties});
  };

  setNCPProperties = async () => {
    try {
      if (this.cachedNCPProperties === null) {
        return;
      }
      let property: keyof NCPProperties;
      for (property in this.state.ncpProperties) {
        let value = this.state.ncpProperties[property];
        if (this.cachedNCPProperties[property] !== value) {
          APIService.setProp(property, value);
        }
      }
    } catch (e) {
      this.receivedNetworkError(e);
      return;
    }
  };

  updateConnected = async () => {
    try {
      let connected = await APIService.getConnected();
      if (!connected && this.state.connected) {
        //br became disconnected
        this.setState({connected, tabView: TAB_VIEW.CONNECT});
      } else if (connected && !this.state.connected) {
        //br became connected
        if (
          this.state.tabView === TAB_VIEW.CONNECT ||
          this.state.tabView === TAB_VIEW.INVALID_HOST
        ) {
          this.setState({connected, tabView: TAB_VIEW.CONFIG});
        } else {
          this.setState({connected});
        }
        this.updateNCPProperties();
      } else if (!connected && this.state.tabView === TAB_VIEW.INVALID_HOST) {
        //we can reach the server but we aren't connected
        this.setState({connected, tabView: TAB_VIEW.CONNECT});
      }
    } catch (e) {
      this.receivedNetworkError(e);
      return;
    }
  };

  ipSelectionHandler = (ip: string, isSelected: boolean) => {
    this.setState(state =>
      produce(state, draft => {
        const ipAddressInfo = draft.ipAddressInfoArray.find(info => info.ipAddress === ip);
        if (ipAddressInfo === undefined) {
          return;
        }
        ipAddressInfo.isSelected = isSelected;
      })
    );
  };

  setColorSchemeToCSSVars() {
    const cmap = ColorScheme.colorMaps[this.state.theme];
    for (let color in cmap) {
      document.body.style.setProperty(`--${color}`, (cmap as any)[color]);
    }
  }

  setScrollbarToCurrentTheme() {
    let body = document.body;
    if (this.state.theme === THEME.TI) {
      body.style.setProperty('--scrollbar_bg', 'rgba(0,0,0,0.1)');
      body.style.setProperty('--thumb_bg', 'rgba(0,0,0,0.4)');
      body.style.setProperty('--thumb_bg_hover', 'rgba(0,0,0,0.6)');
    } else {
      body.style.setProperty('--scrollbar_bg', ColorScheme.getColor('bg0'));
      body.style.setProperty('--thumb_bg', ColorScheme.getColor('bg1'));
      body.style.setProperty('--thumb_bg_hover', ColorScheme.getColor('bg2'));
    }
  }

  setTab(tab: TAB_VIEW) {
    this.setState({tabView: tab});
  }

  render() {
    let body = document.getElementsByTagName('body')[0];
    body.style.backgroundColor = ColorScheme.getColor('bg0', this.state.theme);
    this.setScrollbarToCurrentTheme();
    this.setColorSchemeToCSSVars();
    const dashTitleContainerStyle = {
      backgroundColor:
        this.state.theme === 'ti' ? ColorScheme.getColor('red', THEME.TI) : 'rgba(0,0,0,0)',
    };

    const ipSelectionHandler = this.ipSelectionHandler;
    let currentTab = null;
    switch (this.state.tabView) {
      case TAB_VIEW.CONFIG:
        currentTab = <ConfigTab ncpProperties={this.state.ncpProperties} />;
        break;
      case TAB_VIEW.CONNECT:
        currentTab = <ConnectBorderRouterMessage />;
        break;
      case TAB_VIEW.INVALID_HOST:
        currentTab = <InvalidHostMessage />;
        break;
      case TAB_VIEW.MONITOR:
      default:
        currentTab = (
          <MonitorTab
            {...{
              ipSelectionHandler,
              ...this.state,
            }}
          />
        );
        break;
    }
    return (
      <ThemeContext.Provider value={this.state.theme}>
        <AppContext.Provider value={this}>
          <div className="top_vstack">
            <div className="dash_title_container" style={dashTitleContainerStyle}>
              <h1 className="dash_title">Your Wi-SUN Network</h1>
              <div
                style={{
                  marginRight: '5.9427vw',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                {this.state.connected && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      columnGap: '20px',
                      marginRight: 40,
                    }}
                  >
                    <TabSelector
                      name={TAB_VIEW.MONITOR}
                      isSelected={this.state.tabView === TAB_VIEW.MONITOR}
                      selectTab={() => {
                        this.setTab(TAB_VIEW.MONITOR);
                      }}
                    />
                    <TabSelector
                      name={TAB_VIEW.CONFIG}
                      isSelected={this.state.tabView === TAB_VIEW.CONFIG}
                      selectTab={() => {
                        this.setTab(TAB_VIEW.CONFIG);
                      }}
                    />
                  </div>
                )}
                <ThemeToggle handleNewTheme={(theme: THEME) => this.setState({theme})} />
                <PingJobsButton {...this.state} />
                <SettingsButton {...this.state} />
              </div>
            </div>
            {currentTab}
          </div>
        </AppContext.Provider>
      </ThemeContext.Provider>
    );
  }
}
