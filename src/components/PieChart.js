import { useContext } from "react";
import { Pie } from "react-chartjs-2";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";
import { HEALTH_CATEGORY } from "./HealthMonitor";

export default function PieChart(props) {
  const results_map = props.results_map;
  const results_array = [...results_map.values()];
  const category_map = new Map();

  const color_map = props.category_color_map;

  function constructCategory(health_category) {
    const filtered_results = results_array.filter(
      (result) => result.health_category === health_category
    );
    category_map.set(health_category, filtered_results);
  }
  constructCategory(HEALTH_CATEGORY.URGENT);
  constructCategory(HEALTH_CATEGORY.POOR);
  constructCategory(HEALTH_CATEGORY.FAIR);
  constructCategory(HEALTH_CATEGORY.GOOD);

  const theme = useContext(ThemeContext);
  let text_color = null;
  if (theme === THEME.TI) {
    text_color = ColorScheme.get_color("gray", theme);
  } else {
    text_color = ColorScheme.get_color("white", theme);
  }

  return (
    <div>
      <Pie
        data={{
          labels: [...category_map.keys()],
          datasets: [
            {
              data: [...category_map.values()].map((x) => x.length),
              backgroundColor: [...category_map.keys()].map(
                (category) => color_map[category].background
              ),
              borderColor: [...category_map.keys()].map(
                (category) => color_map[category].border
              ),
              borderWidth: 2,
            },
          ],
        }}
        height={400}
        // width="100%"
        options={{
          plugins: {
            title: {
              display: true,
              text: "Average Success Rate of Network Nodes",
              color: text_color,
              align: "center",
              font: {
                size: 24,
                weight: "600",
                family: "Raleway",
              },
            },
            legend: {
              labels: {
                fontSize: 25,
                color: text_color,
              },
            },
          },
          maintainAspectRatio: false,
        }}
      />
    </div>
  );
}
