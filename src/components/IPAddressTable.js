import CheckBox from "./CheckBox";
import StatusIndicator from "./StatusIndicator";
import FlexTable from "./FlexTable";
import "../assets/IPAddressTable.css";
import Tooltip from "./Tooltip";

// const example_ip_address_info_array = [
//   {
//     ip_address: "aaaa",
//     nickname: "alpha",
//     is_connected: false,
//     is_selected: false,
//   },
//   {
//     ip_address: "bbbb",
//     nickname: "beta",
//     is_connected: true,
//     is_selected: true,
//   },
//   {
//     ip_address: "cccc",
//     nickname: "gamma",
//     is_connected: false,
//     is_selected: true,
//   },
// ];

// function getIPAddressInfoByIPs(ip_addresses) {
//   return ip_addresses.map((ip_address) =>
//     example_ip_address_info_array.find((ele) => ele.ip_address === ip_address)
//   );
// }

function ipDataToElementsMapper(index, ip_table_rows, { columnWidths }) {
  const ip_row = ip_table_rows[index];
  const ip_address_max_width = columnWidths[1];
  const ip_address_style = {
    marginLeft: "auto",
    marginRight: "auto",
  };
  if (ip_address_max_width !== -1) {
    ip_address_style.width = ip_address_max_width - 30;
  }
  return [
    <CheckBox
      click_handler={(newVal) =>
        ip_row.ip_selection_handler(ip_row.ip_address, newVal)
      }
      is_checked={ip_row.is_selected}
    />,
    <Tooltip
      content={ip_row.ip_address}
      style={{
        paddingLeft: 10,
        paddingRight: 10,
        height: 30,
        // left: 0,
        // right: 0,
      }}
    >
      <div className="ip-address-table-ip-address" style={ip_address_style}>
        {ip_row.ip_address}
      </div>
    </Tooltip>,
    ip_row.nickname,
    <StatusIndicator is_good_status={ip_row.is_connected} />,
  ];
}

export default function IPAddressTable(props) {
  let all_ips_selected = true;
  for (const ip_info of props.ip_address_info_array) {
    if (!ip_info.is_selected) {
      all_ips_selected = false;
      break;
    }
  }

  const toggle_selection_all_ips = (val) => {
    for (const ip_info of props.ip_address_info_array) {
      props.ip_selection_handler(ip_info.ip_address, val);
    }
  };

  const table_format = [
    {
      headerValue: (
        <CheckBox
          is_checked={all_ips_selected}
          click_handler={toggle_selection_all_ips}
        />
      ),
      style: {
        flexBasis: "40px",
        flexGrow: "0",
      },
    },
    {
      headerValue: "IP",
      style: {
        flexGrow: "1",
      },
    },
    {
      headerValue: "Nickname",
      style: {
        flexGrow: "1",
      },
    },
    {
      headerValue: "Status",
      style: {
        flexBasis: "100px",
        flexGrow: "0",
      },
    },
  ];

  const table_rows = props.ip_address_info_array.map((ip_address_info) => {
    return {
      id: ip_address_info.ip_address,
      ip_selection_handler: props.ip_selection_handler,
      ...ip_address_info,
    };
  });

  const tableProps = {
    itemCount: table_rows.length,
    rowKeyGenerator: (index, rows) => rows[index].id,
    itemData: table_rows,
    dataToElementsMapper: ipDataToElementsMapper,
    table_format,
    rowHeight: 50,
    numVisibleRows: 8,
  };

  return <FlexTable {...tableProps} />;
}
