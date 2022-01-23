import { motion } from "framer-motion";
import { useContext, useState } from "react";
import reactDom from "react-dom";
import { get_ip_address_info_by_ip } from "../App";
import "../assets/PingJobMonitor.css";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";
import FlexTable from "./FlexTable";

async function abortPingJob(id) {
  const endpoint = `pingbursts/${id}/abort`;
  const url = new URL(endpoint, document.ping_api_location);
  const res = await fetch(url);
  const res_json = await res.json();
  console.log(res_json);
}

function pingJobToElementsMapper(index, pingJobs, { columnWidths }) {
  const job = pingJobs[index];

  const elements = [
    job.nickname,
    job.id,
    job.num_packets_remaining,
    <CloseButton is_light={false} closeHandler={() => abortPingJob(job.id)} />,
  ];
  return elements;
}

function CloseIcon(props) {
  const theme = useContext(ThemeContext);
  let color = null;
  const is_light = props.is_light;
  if (theme === THEME.TI) {
    color = is_light
      ? ColorScheme.get_color("white", theme)
      : ColorScheme.get_color("gray", theme);
  } else {
    color = is_light
      ? ColorScheme.get_color("white", theme)
      : ColorScheme.get_color("white", theme);
  }

  return (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 6L6 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6L18 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseButton(props) {
  const [isHovering, setHovering] = useState(false);
  return (
    <motion.div
      whileTap={{ scale: 1.2 }}
      onClick={() => {
        props.closeHandler();
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <CloseIcon is_light={props.is_light} is_active={isHovering} />
    </motion.div>
  );
}

export function PingJobMonitor(props) {
  const theme = useContext(ThemeContext);

  const table_rows = props.pingbursts
    .filter((pingburst) => {
      const has_completed =
        Number(pingburst.num_packets_requested) === pingburst.records.length;
      const has_aborted = pingburst.was_aborted;
      return !has_aborted && !has_completed;
    })
    .map((pingburst) => {
      let nickname = null;
      if (pingburst.records.length > 0) {
        try {
          const ip_address_info = get_ip_address_info_by_ip(
            props.ip_address_info_array,
            pingburst.records[0].dest_ip
          );
          nickname = ip_address_info.nickname;
        } catch (e) {
          nickname = "N/A";
        }
      } else {
        nickname = "N/A";
      }
      const num_packets_remaining =
        pingburst.num_packets_requested === "∞"
          ? "∞"
          : String(pingburst.num_packets_requested - pingburst.records.length);
      return { nickname, id: pingburst.id, num_packets_remaining, theme };
    });

  function abortAllPingJobs(ping_jobs) {
    for (const job of ping_jobs) {
      abortPingJob(job.id);
    }
  }

  const table_format = [
    {
      headerValue: "Nickname",
      style: {
        flexGrow: "1",
      },
    },
    {
      headerValue: "Burst ID",
      style: {
        flexGrow: "1",
      },
    },
    {
      headerValue: "Remaining",
      style: {
        flexGrow: "1",
      },
    },
    {
      headerValue: (
        <CloseButton
          is_light={true}
          closeHandler={() => abortAllPingJobs(table_rows)}
        />
      ),
      style: {
        flexBasis: "100px",
        flexGrow: "0",
      },
    },
  ];
  const tableProps = {
    itemCount: table_rows.length,
    rowKeyGenerator: (index, rows) => rows[index].id,
    itemData: table_rows,
    dataToElementsMapper: pingJobToElementsMapper,
    table_format,
    rowHeight: 50,
    numVisibleRows: 10,
  };

  return reactDom.createPortal(
    <motion.div
      className="ping_job_monitor_container"
      // initial={{ opacity: 0 }}
      // animate={{ opacity: 1 }}
      // exit={{ opacity: 0 }}
      // transition={{ duration: 0.1 }}
    >
      <FlexTable {...tableProps} />;
    </motion.div>,
    document.body
  );
}
