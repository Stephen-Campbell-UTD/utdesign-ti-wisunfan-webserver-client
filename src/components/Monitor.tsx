import React, {useContext, useState} from 'react';
import '../assets/Monitor.css';
import logIcon from '../icons/logIcon.svg';
import healthIcon from '../icons/healthIcon.svg';
import delayIcon from '../icons/delayIcon.svg';
import {ColorScheme, THEME, ThemeContext} from '../ColorScheme';
import PingLog from './PingLog';
import DelayMonitor from './DelayMonitor';
import HealthMonitor from './HealthMonitor';
import {IPAddressInfo, Pingburst} from '../types';
import {ComponentThemeImplementations} from '../utils';

enum MONITOR_STATE {
  LOG,
  HEALTH,
  DELAY,
}

interface MonitorProps {
  pingbursts: Pingburst[];
  ipAddressInfoArray: IPAddressInfo[];
}

interface MonitorHeaderTheme {
  monitorTabButtonStyle: React.CSSProperties;
}
const monitorHeaderTheme = new ComponentThemeImplementations<MonitorHeaderTheme>();
const tiMonitorHeaderTheme = {
  monitorTabButtonStyle: {
    backgroundColor: ColorScheme.getColor('gray', THEME.TI),
  },
};
monitorHeaderTheme.set(THEME.TI, tiMonitorHeaderTheme);
const gruvboxMonitorHeaderTheme = {
  monitorTabButtonStyle: {
    backgroundColor: ColorScheme.getColor('bg0', THEME.GRUVBOX),
  },
};
monitorHeaderTheme.set(THEME.GRUVBOX, gruvboxMonitorHeaderTheme);

export default function Monitor(props: MonitorProps) {
  const [monitorState, setMonitorState] = useState<MONITOR_STATE>(MONITOR_STATE.LOG);
  let currentDisplay = null;
  switch (monitorState) {
    case MONITOR_STATE.DELAY:
      currentDisplay = <DelayMonitor {...props} />;
      break;
    case MONITOR_STATE.LOG:
      currentDisplay = <PingLog {...props} />;
      break;
    case MONITOR_STATE.HEALTH:
      currentDisplay = <HealthMonitor {...props} />;
      break;
    default:
      console.error('Encountered invalid MONITOR_STATE', monitorState);
  }

  const theme = useContext(ThemeContext);
  const {monitorTabButtonStyle} = monitorHeaderTheme.get(theme);

  return (
    <React.Fragment>
      <div className="monitor_tab_button_array">
        <button
          style={monitorTabButtonStyle}
          className="monitor_tab_button"
          onClick={() => {
            setMonitorState(MONITOR_STATE.LOG);
          }}
        >
          <img src={logIcon} alt="log" />
        </button>
        <button
          style={monitorTabButtonStyle}
          className="monitor_tab_button"
          onClick={() => {
            setMonitorState(MONITOR_STATE.HEALTH);
          }}
        >
          <img src={healthIcon} alt="health" />
        </button>
        <button
          style={monitorTabButtonStyle}
          className="monitor_tab_button"
          onClick={() => {
            setMonitorState(MONITOR_STATE.DELAY);
          }}
        >
          <img src={delayIcon} alt="delay" />
        </button>
      </div>
      {currentDisplay}
    </React.Fragment>
  );
}
