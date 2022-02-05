import React from 'react';
import './App.css';
import {THEME, ColorScheme, ThemeContext} from './ColorScheme';
import produce from 'immer';
import ThemeToggle from './components/ThemeToggle';
import SettingsButton from './components/SettingsButton';
import {KeysMatching, nicknameGenerator} from './utils';
import {PingJobsButton} from './components/PingJobsButton';
import TabSelector from './components/TabSelector';
import MonitorTab from './components/MonitorTab';
import ConfigTab from './components/ConfigTab';
import {AppContext} from './Contexts';
import {BorderRouterIPEntry, IPAddressInfo, Pingburst, Topology} from './types';
import {APIService} from './APIService';
import ConnectBorderRouterMessage from './components/ConnectBorderRouterMessage';
import InvalidHostMessage from './components/InvalidHostMessage';
import {io} from 'socket.io-client';
import {applyPatch, deepClone} from 'fast-json-patch';
import {WritableDraft} from 'immer/dist/types/types-external';

export function getIPAddressInfoByIP(ipAddressInfoArray: IPAddressInfo[], ip: string) {
  for (const ipAddressInfo of ipAddressInfoArray) {
    if (ipAddressInfo.ipAddress === ip) {
      return ipAddressInfo;
    }
  }
  throw Error('IP Not Found');
}

export interface NCPProperties {
  'NCP:State': string | null;
  'NCP:ProtocolVersion': string | null;
  'NCP:Version': string | null;
  'NCP:InterfaceType': number | null;
  'NCP:HardwareAddress': string | null;
  'NCP:CCAThreshold': number | null;
  'NCP:TXPower': number | null;
  'NCP:Region': string | null;
  'NCP:ModeID': number | null;
  unicastchlist: string | null;
  broadcastchlist: string | null;
  asyncchlist: string | null;
  chspacing: string | null;
  ch0centerfreq: string | null;
  'Network:Panid': string | null;
  bcdwellinterval: number | null;
  ucdwellinterval: number | null;
  bcinterval: number | null;
  ucchfunction: number | null;
  bcchfunction: number | null;
  macfilterlist: string[] | null;
  macfiltermode: number | null;
  'Interface:Up': boolean | null;
  'Stack:Up': boolean | null;
  'Network:NodeType': string | null;
  'Network:Name': string | null;
  'IPv6:AllAddresses': BorderRouterIPEntry[] | null;
}
export type NCPStringProperties = KeysMatching<NCPProperties, string | null>;
export type NCPNumberProperties = KeysMatching<NCPProperties, number | null>;

const DEFAULT_NCP_PROPERTY_VALUES = () => {
  return {
    'NCP:State': null,
    'NCP:ProtocolVersion': null,
    'NCP:Version': null,
    'NCP:InterfaceType': null,
    'NCP:HardwareAddress': null,
    'NCP:CCAThreshold': null,
    'NCP:TXPower': null,
    'NCP:Region': null,
    'NCP:ModeID': null,
    unicastchlist: null,
    broadcastchlist: null,
    asyncchlist: null,
    chspacing: null,
    ch0centerfreq: null,
    'Network:Panid': null,
    bcdwellinterval: null,
    ucdwellinterval: null,
    bcinterval: null,
    ucchfunction: null,
    bcchfunction: null,
    macfilterlist: null,
    macfiltermode: null,
    'Interface:Up': null,
    'Stack:Up': null,
    'Network:NodeType': null,
    'Network:Name': null,
    'IPv6:AllAddresses': [],
  };
};

enum TAB_VIEW {
  MONITOR = 'Monitor',
  CONFIG = 'Config',
  CONNECT = 'Connect',
  INVALID_HOST = 'Invalid Host',
}

interface AppState {
  readonly topology: Topology;
  readonly ipAddressInfoArray: IPAddressInfo[];
  readonly pingbursts: Pingburst[];
  readonly connected: boolean;
  readonly ncpProperties: NCPProperties;
  //ncp properties that are currently being edited/not in fetched state
  readonly dirtyNCPProperties: Partial<NCPProperties>;
  readonly tabView: TAB_VIEW;
  readonly theme: THEME;
}

const DEFAULT_TOPOLOGY = () => {
  return {
    numConnected: 0,
    connectedDevices: [],
    routes: [],
    graph: {nodes: [], edges: []},
  };
};
interface AppProps {}

export default class App extends React.Component<AppProps, AppState> {
  /** NCP Properties that are compared to when properties for setProps.  */
  cachedNCPProperties: NCPProperties | null = null;
  state = {
    topology: DEFAULT_TOPOLOGY(),
    ipAddressInfoArray: [],
    pingbursts: [],
    connected: false,
    ncpProperties: DEFAULT_NCP_PROPERTY_VALUES(),
    dirtyNCPProperties: {} as Partial<NCPProperties>,
    tabView: TAB_VIEW.INVALID_HOST,
    theme: THEME.TI,
  };
  constructor(props: AppProps) {
    super(props);

    let body = document.getElementsByTagName('body')[0];
    body.style.backgroundColor = ColorScheme.getColor('bg0', this.state.theme);
  }

  receivedNetworkError(e: unknown) {
    this.setState({
      topology: DEFAULT_TOPOLOGY(),
      ipAddressInfoArray: [],
      pingbursts: [],
      connected: false,
      ncpProperties: DEFAULT_NCP_PROPERTY_VALUES(),
      dirtyNCPProperties: {} as Partial<NCPProperties>,
      tabView: TAB_VIEW.INVALID_HOST,
    });
  }

  componentDidMount() {
    // socket.on('connect', () => {
    // });
    const socket = io('http://localhost:8000');
    socket.on('connect_error', () => {
      console.error('Socket Connect Error');
    });
    socket.on('disconnect', reason => {
      this.receivedNetworkError('Socket Disconnected');
    });

    const deriveState = (prevState: AppState, draftState: WritableDraft<AppState>) => {
      draftState.tabView = this.deriveTabView(prevState, draftState);
      this.deriveModifiedIPAddressInfoArray(
        prevState.topology.connectedDevices,
        draftState.topology.connectedDevices,
        draftState
      );
    };

    socket.on('initialState', (data: Partial<AppState>) => {
      console.log('new data', data);
      this.setState(prevState => {
        return produce(prevState, draftState => {
          Object.assign(draftState, data);
          deriveState(prevState, draftState);
        });
      });
    });

    socket.on('stateChange', patchArray => {
      console.log('state patch:', deepClone(patchArray));
      this.setState(prevState => {
        return produce(prevState, draftState => {
          applyPatch(draftState, patchArray);
          deriveState(prevState, draftState);
        });
      });
    });
  }

  setNCPProperties = async () => {
    let property: keyof NCPProperties;
    const keysToDelete: (keyof NCPProperties)[] = [];
    for (property in this.state.dirtyNCPProperties) {
      let value = this.state.ncpProperties[property];
      try {
        const {wasSuccess} = await APIService.setProp(property, value);
        if (wasSuccess) {
          keysToDelete.push(property);
        }
      } catch (e) {
        this.receivedNetworkError(e);
        return;
      }
    }
    this.setState(prevState => {
      return produce(prevState, draftState => {
        for (const key of keysToDelete) {
          delete draftState.ncpProperties[key];
        }
      });
    });
  };

  deriveTabView = (prevState: Partial<AppState>, currentState: Partial<AppState>) => {
    let {connected: currentlyConnected} = currentState;
    let {connected: previouslyConnected, tabView: previousTabView} = prevState;
    if (previousTabView === undefined) {
      console.error('tab view not set');
      return TAB_VIEW.INVALID_HOST;
    }
    if (!currentlyConnected && previouslyConnected) {
      //br became disconnected
      return TAB_VIEW.CONNECT;
    } else if (currentlyConnected && !previouslyConnected) {
      //br became connected
      if (previousTabView === TAB_VIEW.CONNECT || previousTabView === TAB_VIEW.INVALID_HOST) {
        return TAB_VIEW.CONFIG;
      } else {
        return previousTabView;
      }
    } else if (!currentlyConnected && previousTabView === TAB_VIEW.INVALID_HOST) {
      //we can reach the server but we aren't connected
      return TAB_VIEW.CONNECT;
    } else {
      if (previousTabView === undefined) {
        console.error('tab view not set');
        return TAB_VIEW.INVALID_HOST;
      }
      return previousTabView;
    }
  };

  deriveModifiedIPAddressInfoArray = (
    previouslyConnectedDevices: string[],
    currentlyConnectedDevices: string[],
    draftState: WritableDraft<AppState>
  ) => {
    function difference<SetMemberType>(
      iterA: Iterable<SetMemberType>,
      iterB: Iterable<SetMemberType>
    ): Set<SetMemberType> {
      let _difference = new Set(iterA);
      for (let elem of Array.from(iterB)) {
        _difference.delete(elem);
      }
      return _difference;
    }
    const ipsToRemove = difference(previouslyConnectedDevices, currentlyConnectedDevices);
    const ipsToAdd = difference(currentlyConnectedDevices, previouslyConnectedDevices);
    let ipsToAddArray = Array.from(ipsToAdd);
    //Add new entries to ipAddressInfoArray

    const ipAddressInfoToAdd = ipsToAddArray.map((ipAddress: string) => {
      const nickname = nicknameGenerator(ipAddress);
      return {
        isSelected: false,
        ipAddress,
        nickname,
        isConnected: true,
      };
    });

    draftState.ipAddressInfoArray.push(...ipAddressInfoToAdd);
    draftState.ipAddressInfoArray = draftState.ipAddressInfoArray.filter(
      ipInfo => !ipsToRemove.has(ipInfo.ipAddress)
    );
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
  clearDirtyNCPProperties = () => {
    this.setState({dirtyNCPProperties: {}});
  };

  render() {
    let body = document.getElementsByTagName('body')[0];
    body.style.backgroundColor = ColorScheme.getColor('bg0', this.state.theme);
    this.setScrollbarToCurrentTheme();
    this.setColorSchemeToCSSVars();
    const dashTitleContainerStyle = {
      backgroundColor:
        this.state.theme === 'ti' ? ColorScheme.getColor('red', THEME.TI) : 'rgba(0,0,0,0)',
    };

    let currentTab = null;
    switch (this.state.tabView) {
      case TAB_VIEW.CONFIG:
        currentTab = (
          <ConfigTab
            topology={this.state.topology}
            ncpProperties={this.state.ncpProperties}
            dirtyNCPProperties={this.state.dirtyNCPProperties}
          />
        );
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
            ipSelectionHandler={this.ipSelectionHandler}
            ipAddressInfoArray={this.state.ipAddressInfoArray}
            graph={this.state.topology.graph}
            pingbursts={this.state.pingbursts}
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
