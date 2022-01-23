import Tile from "./Tile";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
import { get_ip_address_info_by_ip } from "../App";
import { useContext } from "react";
import { ColorScheme, ThemeContext } from "../ColorScheme";
import ErrorRateLineChart from "./ErrorRateLineChart";

// the values of the enum will be labels of graphs
export const HEALTH_CATEGORY = {
  URGENT: "0%-30%",
  POOR: "30%-60%",
  FAIR: "60%-90%",
  GOOD: "90%-100%",
};
Object.freeze(HEALTH_CATEGORY);

function success_rate_to_category(success_rate) {
  if (success_rate <= 30) {
    return HEALTH_CATEGORY.URGENT;
  } else if (success_rate <= 60) {
    return HEALTH_CATEGORY.POOR;
  } else if (success_rate <= 90) {
    return HEALTH_CATEGORY.FAIR;
  } else {
    return HEALTH_CATEGORY.GOOD;
  }
}

export default function HealthMonitor(props) {
  function average(array) {
    return array.reduce((acc, cur) => acc + cur, 0) / array.length;
  }

  const useNicknameOverIP = true;
  let pingbursts = props.pingbursts;
  //has the ip's ->  average success rate, health category, number of samples used for the average
  let results_map = new Map();
  pingbursts = pingbursts.filter((pingburst) => pingburst.records.length > 0);
  pingbursts.forEach((pingburst) => {
    let pingburst_average_success =
      average(
        pingburst["records"].map((records) => (records["was_success"] ? 1 : 0))
      ) * 100; //get the average of the current ping id
    const ip = pingburst["records"][0]["dest_ip"];
    const ip_info = get_ip_address_info_by_ip(props.ip_address_info_array, ip);
    if (!ip_info.is_selected) {
      return;
    }
    const nickname = ip_info.nickname;
    const label = useNicknameOverIP ? nickname : ip;
    let ip_health_info = null;
    if (results_map.has(label)) {
      const health_info = results_map.get(label);
      const pingburst_num_samples = pingburst.records.length;
      const num_samples = health_info.num_samples + pingburst_num_samples;
      //the new average, has to take into account previous amount of samples the average
      const average_success =
        (health_info.average_success * health_info.num_samples +
          pingburst_average_success * pingburst_num_samples) /
        num_samples;
      ip_health_info = {
        average_success,
        num_samples,
        health_category: success_rate_to_category(average_success),
      };
    } else {
      ip_health_info = {
        average_success: pingburst_average_success,
        num_samples: pingburst.records.length,
        health_category: success_rate_to_category(pingburst_average_success),
      };
    }

    results_map.set(label, ip_health_info);
  });

  const theme = useContext(ThemeContext);
  const category_color_name_map = {
    [HEALTH_CATEGORY.URGENT]: "red",
    [HEALTH_CATEGORY.POOR]: "orange",
    [HEALTH_CATEGORY.FAIR]: "yellow",
    [HEALTH_CATEGORY.GOOD]: "green",
  };
  const category_color_map = {};
  Object.keys(category_color_name_map).forEach((category) => {
    const color_name = category_color_name_map[category];
    category_color_map[category] = {
      background: ColorScheme.get_color_with_opacity(color_name, 0.6, theme),
      border: ColorScheme.get_color(color_name, theme),
    };
  });

  return (
    <Tile omit_header={true}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 20,
          marginLeft: "auto",
          marginRight: "auto",
          width: "80%",
          marginBottom: 40,
          gap: 50,
        }}
      >
        <ErrorRateLineChart {...props} />
        <BarChart
          results_map={results_map}
          category_color_map={category_color_map}
        />
        <PieChart
          results_map={results_map}
          category_color_map={category_color_map}
        />
      </div>
    </Tile>
  );
}
