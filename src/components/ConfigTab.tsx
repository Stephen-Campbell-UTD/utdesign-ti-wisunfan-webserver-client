import '../App.css';
import '../assets/ConfigTab.css';
import Tile from './Tile';
import Pane from './Pane';
import {ThemedInput} from './ThemedInput';
import ThemedLabel from './ThemedLabel';
import StatusIndicator from './StatusIndicator';
import {useContext, useState} from 'react';
import {AppContext} from '../Contexts';
import produce from 'immer';
import ThemedButton, {THEMED_BUTTON_TYPE} from './ThemedButton';
import {ThemedSelect} from './ThemedSelect';
import {NCPNumberProperties, NCPProperties, NCPStringProperties} from '../App';

/**
 *
 * ti-widget-tab
 * ti-widget-container
 * ti-widget-tilecontainer
 * ti-widget-droplist
 *
 */

// const mainProps = [
//   // network_protocolversion:{ id:"NCP:ProtocolVersion",displayName, alwaysDisabled : true, component: InputText}
//   "NCP:Version",
//   "NCP:InterfaceType",
//   "NCP:HardwareAddress",
//   "NCP:CCAThreshold",
//   "NCP:TXPower",
//   "NCP:Region",
//   "NCP:ModeID",
//   "unicastchlist",
//   "broadcastchlist",
//   "asyncchlist",
//   "chspacing",
//   "ch0centerfreq",
//   "Network:Panid",
//   "bcdwellinterval",
//   "ucdwellinterval",
//   "bcinterval",
//   "ucchfunction",
//   "bcchfunction",
//   "macfiltermode",
//   "Network:NodeType",
//   "Network:Name",
// ];
// const idStartPropMap = {
//   interfaceup_1: "Interface:Up",
//   stackup_1: "Stack:Up",
// };
// const idOtherPropMap = {
//   get_numconnecteddevices_1: "numconnected",
//   get_connecteddevices_1: "connecteddevices",
//   get_dodagroute_1: "dodagroute",
//   get_ipv6alladdresses_1: "IPv6:AllAddresses",
//   get_macfilterlist_1: "macfilterlist",
// };
// const disabledStackUp = new Set<keyof NCPProperties>([
//   "NCP:CCAThreshold",
//   "NCP:TXPower",
//   "Network:Panid",
//   "bcdwellinterval",
//   "ucdwellinterval",
//   "bcinterval",
//   "ucchfunction",
//   "bcchfunction",
// ]);

interface ConfigPropertyTextInputProps {
  /**Display Name of Property */
  name: string;
  /**Identifier of Property. Should match server propValues */
  id: NCPStringProperties;
  /**Value of Property */
  value: string;
  isDisabled?: boolean;
}

function ConfigPropertyTextInput(props: ConfigPropertyTextInputProps) {
  // const isDisabled = props["Stack:Up"] && disabledStackUp.has(props.id);
  const App = useContext(AppContext);
  if (App === null) {
    throw Error('App null and rendering ConfigTextInput');
  }
  const changeHandler = (newText: string) => {
    App.setState(prevState => {
      return produce(prevState, draftState => {
        draftState.ncpProperties[props.id] = newText;
      });
    });
  };
  return (
    <div className="config_label">
      <ThemedLabel style={{fontSize: 14}}>{props.name}</ThemedLabel>
      <ThemedInput
        style={{width: '45%', fontSize: 14}}
        isDisabled={props.isDisabled}
        value={props.value}
        onChange={changeHandler}
      />
    </div>
  );
}

interface ConfigPropertyNumberInputProps {
  /**Display Name of Property */
  name: string;
  /**Identifier of Property. Should match server propValues */
  id: NCPNumberProperties;
  /**Value of Property */
  value: number;
  isDisabled?: boolean;
}
function ConfigPropertyNumberInput(props: ConfigPropertyNumberInputProps) {
  // const isDisabled = props["Stack:Up"] && disabledStackUp.has(props.id);
  const App = useContext(AppContext);
  if (App === null) {
    throw Error('App null and rendering ConfigTextInput');
  }
  const changeHandler = (newText: string) => {
    App.setState(prevState => {
      return produce(prevState, draftState => {
        draftState.ncpProperties[props.id] = parseInt(newText, 10);
      });
    });
  };
  return (
    <div className="config_label">
      <ThemedLabel style={{fontSize: 14}}>{props.name}</ThemedLabel>
      <ThemedInput
        style={{width: '45%', fontSize: 14}}
        isDisabled={props.isDisabled}
        value={props.value.toString(10)}
        onChange={changeHandler}
      />
    </div>
  );
}

// https://dev.ti.com/tirex/explore/content/simplelink_cc13x2_26x2_sdk_5_20_00_52/docs/ti_wisunfan/html/wisun-guide/NWP_interface.html
interface MacFilterModeConfigProps {
  value: number;
}
function MacFilterModeConfig(props: MacFilterModeConfigProps) {
  const App = useContext(AppContext);
  if (App === null) {
    throw Error('App null and rendering ConfigTextInput');
  }
  const onChange = ({value}: {value: string}) => {
    App.setState(prevState => {
      return produce(prevState, draftState => {
        draftState.ncpProperties['macfiltermode'] = parseInt(value, 10);
      });
    });
  };
  const options = [
    {
      label: 'Disabled',
      value: 0,
    },
    {
      label: 'Whitelist',
      value: 1,
    },
    {
      label: 'Blacklist',
      value: 2,
    },
  ];

  const selectedOption = options.find(option => option.value === props.value);
  return (
    <div className="config_label">
      <ThemedLabel style={{fontSize: 14}}>Mac Filter Mode</ThemedLabel>
      <ThemedSelect
        width="45%"
        fontSize={14}
        onChange={onChange}
        options={options}
        value={selectedOption}
      ></ThemedSelect>
    </div>
  );
}

interface ConfigPropertiesProps {
  ncpProperties: NCPProperties;
}

function ConfigProperties(props: ConfigPropertiesProps) {
  const {['Stack:Up' as 'Stack:Up']: stackUp} = props.ncpProperties;
  const App = useContext(AppContext);
  if (App === null) {
    throw Error('App null and rendering ConfigTextInput');
  }
  return (
    <div className="config_properties_container">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        <ThemedButton
          themedButtonType={THEMED_BUTTON_TYPE.PRIMARY}
          onClick={App.updateNCPProperties}
        >
          Get
        </ThemedButton>
        <ThemedButton
          themedButtonType={THEMED_BUTTON_TYPE.SECONDARY}
          onClick={App.setNCPProperties}
        >
          Set
        </ThemedButton>
      </div>
      <ConfigPropertyTextInput
        name="NCP:Version"
        id="NCP:Version"
        value={props.ncpProperties['NCP:Version']}
        isDisabled={true}
      />

      <ConfigPropertyNumberInput
        name="NCP:InterfaceType"
        id="NCP:InterfaceType"
        value={props.ncpProperties['NCP:InterfaceType']}
        isDisabled={true}
      />
      <ConfigPropertyTextInput
        name="Hardware Address"
        id="NCP:HardwareAddress"
        value={props.ncpProperties['NCP:HardwareAddress']}
        isDisabled={true}
      />
      <ConfigPropertyNumberInput
        name="NCP:CCAThreshold"
        id="NCP:CCAThreshold"
        value={props.ncpProperties['NCP:CCAThreshold']}
        isDisabled={stackUp}
      />
      <ConfigPropertyNumberInput
        name="NCP:TXPower"
        id="NCP:TXPower"
        value={props.ncpProperties['NCP:TXPower']}
        isDisabled={stackUp}
      />
      <ConfigPropertyTextInput
        name="NCP:Region"
        id="NCP:Region"
        value={props.ncpProperties['NCP:Region']}
        isDisabled={true}
      />
      <ConfigPropertyNumberInput
        name="NCP:ModeID"
        id="NCP:ModeID"
        value={props.ncpProperties['NCP:ModeID']}
        isDisabled={true}
      />
      <ConfigPropertyTextInput
        name="unicastchlist"
        id="unicastchlist"
        value={props.ncpProperties['unicastchlist']}
      />
      <ConfigPropertyTextInput
        name="broadcastchlist"
        id="broadcastchlist"
        value={props.ncpProperties['broadcastchlist']}
      />
      <ConfigPropertyTextInput
        name="asyncchlist"
        id="asyncchlist"
        value={props.ncpProperties['asyncchlist']}
      />
      <ConfigPropertyTextInput
        name="chspacing"
        id="chspacing"
        value={props.ncpProperties['chspacing']}
        isDisabled={true}
      />
      <ConfigPropertyTextInput
        name="ch0centerfreq"
        id="ch0centerfreq"
        value={props.ncpProperties['ch0centerfreq']}
        isDisabled={true}
      />
      <ConfigPropertyTextInput
        name="Network:Panid"
        id="Network:Panid"
        value={props.ncpProperties['Network:Panid']}
        isDisabled={stackUp}
      />
      <ConfigPropertyNumberInput
        name="bcdwellinterval"
        id="bcdwellinterval"
        value={props.ncpProperties['bcdwellinterval']}
        isDisabled={stackUp}
      />
      <ConfigPropertyNumberInput
        name="ucdwellinterval"
        id="ucdwellinterval"
        value={props.ncpProperties['ucdwellinterval']}
        isDisabled={stackUp}
      />
      <ConfigPropertyNumberInput
        name="bcinterval"
        id="bcinterval"
        value={props.ncpProperties['bcinterval']}
        isDisabled={stackUp}
      />
      <ConfigPropertyNumberInput
        name="ucchfunction"
        id="ucchfunction"
        value={props.ncpProperties['ucchfunction']}
        isDisabled={stackUp}
      />
      <ConfigPropertyNumberInput
        name="bcchfunction"
        id="bcchfunction"
        value={props.ncpProperties['bcchfunction']}
        isDisabled={stackUp}
      />
      <MacFilterModeConfig value={props.ncpProperties['macfiltermode']} />
      <ConfigPropertyTextInput
        name="BR NodeType"
        id="Network:NodeType"
        value={props.ncpProperties['Network:NodeType']}
        isDisabled={true}
      />
      <ConfigPropertyTextInput
        name="Network Name"
        id="Network:Name"
        value={props.ncpProperties['Network:Name']}
      />
    </div>
  );
}

interface NCPStatusProps {
  interfaceUp: boolean;
  stackUp: boolean;
}

function NCPStatus(props: NCPStatusProps) {
  return (
    <div className="ncpStatusContainer">
      <div className="ncpStatusRow">
        <ThemedLabel style={{fontSize: 24}}>Interface Up</ThemedLabel>
        <StatusIndicator isGoodStatus={props.interfaceUp}></StatusIndicator>
      </div>
      <div className="ncpStatusRow">
        <ThemedLabel style={{fontSize: 24}}>Stack Up</ThemedLabel>
        <StatusIndicator isGoodStatus={props.stackUp}></StatusIndicator>
      </div>
      <div className="ncpStatusRow">
        <ThemedButton themedButtonType={THEMED_BUTTON_TYPE.PRIMARY}>Start</ThemedButton>
        <ThemedButton themedButtonType={THEMED_BUTTON_TYPE.SECONDARY}>Reset</ThemedButton>
      </div>
    </div>
  );
}

interface ThemedUnorderedListProps {
  items?: string[];
}

function ThemedUnorderedList(props: ThemedUnorderedListProps) {
  let stringItems = props.items ? props.items : ([] as string[]);
  const items = stringItems.map((item, index) => {
    return (
      <div>
        <ThemedLabel key={`${item}${index}`}>{item}</ThemedLabel>
      </div>
    );
  });
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 20,
        rowGap: 10,
      }}
    >
      {items}
    </div>
  );
}

interface NetworkPropertiesProps {
  connecteddevices: string[];
  macfilterlist: string[];
}

enum NETWORK_PROPERTIES {
  CONNECTED_DEVICES = 'connecteddevices',
  MAC_FILTER_LIST = 'macfilterlist',
}

function NetworkProperties(props: NetworkPropertiesProps) {
  const [activeProperty, setActiveProperty] = useState(NETWORK_PROPERTIES.CONNECTED_DEVICES);
  const options = [
    // { label: "Dodag Route", value: "dodagroute" },
    {label: 'Connected Devices', value: 'connecteddevices'},
    // { label: "IPv6 Addresses", value: "IPv6:AllAddresses" },
    {label: 'MAC Filter List', value: 'macfilterlist'},
  ];
  let displayElement = null;
  switch (activeProperty) {
    case NETWORK_PROPERTIES.CONNECTED_DEVICES:
      displayElement = <ThemedUnorderedList items={props.connecteddevices} />;
      break;
    case NETWORK_PROPERTIES.MAC_FILTER_LIST:
      displayElement = <ThemedUnorderedList items={props.macfilterlist} />;
      break;
    default:
  }
  const selectedOption = options.find(option => option.value === activeProperty);
  return (
    <div className="networkPropertiesContainer">
      <ThemedSelect
        width="100%"
        onChange={({value}) => setActiveProperty(value)}
        value={selectedOption}
        options={options}
      />
      {displayElement}
    </div>
  );
}

interface ConfigTabProps {
  ncpProperties: NCPProperties;
}

export default function ConfigTab(props: ConfigTabProps) {
  return (
    <div className="pane_container" style={{columnGap: '1.435vw'}}>
      <Pane>
        <div className="tile_container_full tile_container_common">
          <Tile title="Network Properties">
            <NetworkProperties
              connecteddevices={props.ncpProperties.connecteddevices}
              macfilterlist={props.ncpProperties.macfilterlist}
            />
          </Tile>
        </div>
      </Pane>
      <Pane>
        <div className="tile_container_full tile_container_common">
          <Tile title="Config Properties">
            <ConfigProperties ncpProperties={props.ncpProperties} />
          </Tile>
        </div>
      </Pane>
      <Pane>
        <div className="tile_container_full tile_container_common">
          <Tile style={{minHeight: 200}} title="NCP Status">
            <NCPStatus
              stackUp={props.ncpProperties['Stack:Up']}
              interfaceUp={props.ncpProperties['Interface:Up']}
            ></NCPStatus>
          </Tile>
        </div>
      </Pane>
    </div>
  );
}
