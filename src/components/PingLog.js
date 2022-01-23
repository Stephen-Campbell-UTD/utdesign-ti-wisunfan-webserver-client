import React from "react";
import MagnitudeIndicator from "./MagnitudeIndicator";
import download_icon from "../icons/download_icon.svg";
import { get_ip_address_info_by_ip } from "../App";
import FlexTable from "./FlexTable";
import { sort } from "d3-array";
import { timestamp_string_to_date } from "../utils";
const duration_max_baseline = 600;

function pingDataToElementsMapper(index, data) {
  const ping_info = data.records[index];
  const start_matches = ping_info.start.match(/(\d{1,2}:\d{1,2}:\d{1,2}.*M)/);
  const start = start_matches[1];
  const ip_info = get_ip_address_info_by_ip(
    data.ip_address_info_array,
    ping_info.dest_ip
  );
  const ping_cols = [
    "", //toggle filler
    ping_info.burst_id,
    ip_info ? ip_info.nickname : "N/A",
    start,
    <MagnitudeIndicator
      value={ping_info.duration / duration_max_baseline}
      tooltip={`${ping_info.duration.toFixed(2)}ms`}
    />,
  ];
  return ping_cols;
}

export default function PingLog(props) {
  let download_url = "#";
  try {
    download_url = new URL("Ping_Results.csv", document.ping_api_location);
  } catch (e) {
    console.log(e);
  }
  const csv_download_button = (
    // <a href={}>
    <img
      style={{
        cursor: "pointer",
      }}
      alt="download"
      onClick={() => window.open(download_url)}
      src={download_icon}
    ></img>
    // </a>
  );
  const table_format = [
    {
      headerValue: csv_download_button,
      style: {
        flexBasis: "45px",
        flexGrow: "0",
      },
    },
    {
      headerValue: "Burst ID",
      style: {
        flexGrow: "1",
      },
    },
    {
      headerValue: "Destination",
      style: {
        flexGrow: "1",
      },
    },
    {
      headerValue: "Start",
      style: {
        flexGrow: "1",
      },
    },

    {
      headerValue: "Duration [ms]",
      style: {
        flexGrow: "1",
      },
    },
  ];

  const row_data = {
    ip_address_info_array: props.ip_address_info_array,
    records: [],
    table_format,
  };

  props.pingbursts.forEach((burst) => {
    burst.records.forEach((record) => {
      row_data.records.push({
        ...record,
        burst_id: burst.id,
        startDate: timestamp_string_to_date(record.start),
      });
    });
  });
  // the startDate is minus in order to sort form latest -> oldest
  row_data.records = sort(row_data.records, (datum) => -datum.startDate);

  const tableProps = {
    itemCount: row_data.records.length,
    rowKeyGenerator: (index, row_data) => {
      const ping_info = row_data.records[index];
      return `${ping_info.start} ${ping_info.burst_id}`;
    },
    itemData: row_data,
    dataToElementsMapper: pingDataToElementsMapper,
    table_format,
    rowHeight: 50,
    numVisibleRows: 8,
  };

  return <FlexTable {...tableProps}></FlexTable>;
}
