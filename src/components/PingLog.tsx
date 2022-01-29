import React, {ReactElement} from 'react';
import MagnitudeIndicator from './MagnitudeIndicator';
import downloadIcon from '../icons/downloadIcon.svg';
import {getIPAddressInfoByIP} from '../App';
import FlexTable, {FlexTableProps} from './FlexTable';
import {sort} from 'd3-array';
import {ComponentThemeImplementations, timestampStringToDate} from '../utils';
import {APIService} from '../APIService';
import {ColorThresholds, FlexTableFormat, IPAddressInfo, Pingburst, PingRecord} from '../types';
import {Color, ColorScheme, THEME} from '../ColorScheme';
const durationMaxBaseline = 600;

type PingLogRow = PingRecord & {burstID: number; startDate: Date};
interface PingLogTable {
  ipAddressInfoArray: IPAddressInfo[];
  records: PingLogRow[];
  tableFormat: FlexTableFormat;
}

interface PingLogProps {
  ipAddressInfoArray: IPAddressInfo[];
  pingbursts: Pingburst[];
}

interface PingRowTheme {
  durationColorThresholds: ColorThresholds;
}
const pingRowThemeImplementations = new ComponentThemeImplementations<PingRowTheme>();
const tiPingRowThemeImplementations = {
  durationColorThresholds: new ColorThresholds(
    [0.33, 0.66, 0.9],
    ['green', 'yellow', 'orange', 'red'].map((color: Color) =>
      ColorScheme.getColor(color, THEME.TI)
    )
  ),
};
pingRowThemeImplementations.set(THEME.TI, tiPingRowThemeImplementations);
const gruvboxPingRowThemeImplementations = {
  durationColorThresholds: new ColorThresholds(
    [0.33, 0.66, 0.9],
    ['green', 'yellow', 'orange', 'red'].map((color: Color) =>
      ColorScheme.getColor(color, THEME.GRUVBOX)
    )
  ),
};
pingRowThemeImplementations.set(THEME.GRUVBOX, gruvboxPingRowThemeImplementations);

function pingDataToElementsMapper(
  index: number,
  data: PingLogTable,
  {theme}: {theme: THEME}
): (ReactElement | string)[] {
  const pingInfo = data.records[index];
  let startMatches = pingInfo.start.match(/(\d{1,2}:\d{1,2}:\d{1,2}.*M)/);
  let start;
  if (startMatches === null) {
    start = 'N/A';
  } else {
    start = startMatches[1];
  }
  let nickname;
  try {
    const ipInfo = getIPAddressInfoByIP(data.ipAddressInfoArray, pingInfo.destIP);
    nickname = ipInfo.nickname;
  } catch {
    nickname = 'N/A';
  }
  const {durationColorThresholds} = pingRowThemeImplementations.get(theme);
  const pingCols = [
    '', //toggle filler
    pingInfo.burstID.toString(10),
    nickname,
    start,
    <MagnitudeIndicator
      colorThresholds={durationColorThresholds}
      value={pingInfo.duration / durationMaxBaseline}
      tooltip={`${pingInfo.duration.toFixed(2)}ms`}
    />,
  ];
  return pingCols;
}

export default function PingLog(props: PingLogProps) {
  const csvDownloadButton = (
    // <a href={}>
    <img
      style={{
        cursor: 'pointer',
      }}
      alt="download"
      onClick={() => window.open(APIService.pingResultsRoute)}
      src={downloadIcon}
    ></img>
    // </a>
  );
  const tableFormat: FlexTableFormat = [
    {
      headerValue: csvDownloadButton,
      style: {
        flexBasis: '45px',
        flexGrow: '0',
      },
    },
    {
      headerValue: 'Burst ID',
      style: {
        flexGrow: '1',
      },
    },
    {
      headerValue: 'Destination',
      style: {
        flexGrow: '1',
      },
    },
    {
      headerValue: 'Start',
      style: {
        flexGrow: '1',
      },
    },

    {
      headerValue: 'Duration [ms]',
      style: {
        flexGrow: '1',
      },
    },
  ];

  const tableData: PingLogTable = {
    ipAddressInfoArray: props.ipAddressInfoArray,
    records: [],
    tableFormat,
  };

  props.pingbursts.forEach(burst => {
    burst.records.forEach(record => {
      tableData.records.push({
        ...record,
        burstID: burst.id,
        startDate: timestampStringToDate(record.start),
      });
    });
  });
  // the startDate is minus in order to sort form latest -> oldest
  sort(tableData.records, datum => -datum.startDate);

  const tableProps: FlexTableProps<PingLogTable, PingLogRow> = {
    rowKeyGenerator: (index: number, pingLogRow: PingLogRow) => {
      return `${pingLogRow.start} ${pingLogRow.burstID}`;
    },
    tableData,
    dataToElementsMapper: pingDataToElementsMapper,
    tableFormat,
  };
  // const PingLogTableComponent = FlexTable<PingLogTable,PingLogRow>
  return React.createElement(
    // (props) => FlexTable<PingLogTable, PingLogRow>(props),
    props => FlexTable<PingLogTable, PingLogRow>(props),
    tableProps
  );
  // return <FlexTable {...tableProps}></FlexTable>;
}
