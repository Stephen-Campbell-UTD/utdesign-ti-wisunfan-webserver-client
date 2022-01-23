import React, { useContext } from "react";
import { Bar } from "react-chartjs-2";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";

export default function BarChart(props) {
  const results_map = props.results_map;
  const results_array = [...results_map.values()];

  const color_map = props.category_color_map;
  const data = results_array.map((result) => result.average_success);
  const backgroundColor = results_array.map((result) => {
    return color_map[result.health_category].background;
  });
  const borderColor = results_array.map(
    (result) => color_map[result.health_category].border
  );

  const theme = useContext(ThemeContext);
  let text_color = null;
  let grid_color = null;
  if (theme === THEME.TI) {
    text_color = ColorScheme.get_color("gray", theme);
    grid_color = ColorScheme.get_color_with_opacity("gray_light", 0.6, theme);
  } else {
    text_color = ColorScheme.get_color("white", theme);
    grid_color = ColorScheme.get_color_with_opacity("gray", 0.6, theme);
  }

  return (
    <div>
      <Bar
        data={{
          labels: [...results_map.keys()],
          datasets: [
            {
              // label: "average success rate",
              data,
              backgroundColor,
              borderColor,
              borderWidth: 2,
            },
          ],
        }}
        height={400} //
        // width={200}
        color={text_color}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Average Success Rate per Network Node",
              color: text_color,
              align: "center",
              font: {
                size: 24,
                weight: "600",
                family: "Raleway",
              },
            },

            legend: {
              display: false,
            },
          },
          maintainAspectRatio: false,
          scales: {
            y: {
              max: 100,
              beginAtZero: true,
              ticks: {
                color: text_color,
              },
              grid: {
                color: grid_color,
              },
              title: {
                display: true,
                text: "Percent Success",
                color: text_color,
                align: "center",
                font: {
                  size: 18,
                  weight: "400",
                  family: "Raleway",
                },
              },
            },
            x: {
              ticks: {
                color: text_color,
                font: {
                  weight: "600",
                  family: "Raleway",
                },
              },
              grid: {
                color: grid_color,
              },
            },
          },
        }}
      />
    </div>
  );
}
