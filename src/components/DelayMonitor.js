import React from "react";
import Tile from "./Tile";
import * as d3 from "d3";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";

function timestamp_string_to_date(timestamp) {
  //example timestamp string "10/31/2021, 10:49:35 AM 221ms"
  const date_regex_matches = timestamp.match(/(.*) (\d{1,3})ms/);
  //index 0 is the entire timestamp string
  //index 1 is date time w/o ms
  // index 2 is ms
  if (date_regex_matches.length < 3) {
    console.error("Could not convert timesatm string: ", timestamp);
  }
  const date_without_ms = date_regex_matches[1];
  const ms = parseInt(date_regex_matches[2]);
  const converted_date = new Date(date_without_ms);
  converted_date.setMilliseconds(ms);
  return converted_date;
}

function ip_series(pingbursts, dest_ip, label, color) {
  let data = [];
  for (let pingburst of pingbursts) {
    const valid_pingburst =
      pingburst.records.length !== 0 &&
      pingburst.records[0].dest_ip === dest_ip;
    if (!valid_pingburst) {
      continue;
    }
    for (let record of pingburst.records) {
      data.push({
        start: timestamp_string_to_date(record.start),
        duration: record.duration,
      });
    }
  }
  data = d3.sort(data, (datum) => datum.start);
  return { data, color, id: dest_ip, label };
}
class NetworkDelayChart extends React.Component {
  static contextType = ThemeContext;

  state = {
    series_paths: [],
  };
  aspect_ratio = 19 / 15;
  viewportHeight = 401;
  viewportWidth = this.aspect_ratio * this.viewportHeight;
  margin = {
    top: 50,
    bottom: 50,
    right: 80,
    left: 80,
  };
  x_axis_ref = React.createRef();
  y_axis_ref = React.createRef();
  x_gridlines_ref = React.createRef();
  y_gridlines_ref = React.createRef();
  x_scale = d3
    .scaleTime()
    .range([this.margin.left, this.viewportWidth - this.margin.right]);
  y_scale = d3
    .scaleLinear()
    .range([this.viewportHeight - this.margin.bottom, this.margin.top]);
  x_axis = d3.axisBottom().scale(this.x_scale).ticks(d3.timeMinute.every(1));
  x_gridlines = d3
    .axisBottom()
    .scale(this.x_scale)
    .ticks(d3.timeMinute.every(1))
    .tickSize(-this.viewportHeight + this.margin.top + this.margin.bottom, 0)
    .tickFormat("");
  y_axis = d3.axisLeft().scale(this.y_scale);
  y_gridlines = d3
    .axisLeft()
    .scale(this.y_scale)
    // .ticks(20)
    .tickSize(-this.viewportWidth + this.margin.right + this.margin.left, 0)
    .tickFormat("");
  lineGenerator = d3
    .line()
    .x((datum) => this.x_scale(datum.start))
    .y((datum) => this.y_scale(datum.duration))
    .defined((datum) => datum.duration !== -1);

  // .tickSizeOuter(0);
  //   const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);
  componentDidUpdate() {
    d3.select(this.x_axis_ref.current).call(this.x_axis);
    d3.select(this.y_axis_ref.current).call(this.y_axis);
    d3.select(this.x_gridlines_ref.current).call(this.x_gridlines);
    d3.select(this.y_gridlines_ref.current).call(this.y_gridlines);
  }
  componentDidMount() {
    d3.select(this.x_gridlines_ref.current).call(this.x_gridlines);
    d3.select(this.y_gridlines_ref.current).call(this.y_gridlines);
    d3.select(this.x_axis_ref.current).call(this.x_axis);
    d3.select(this.y_axis_ref.current).call(this.y_axis);
  }

  render() {
    const theme = this.context;

    let text_color = null;
    let grid_color = null;
    if (theme === THEME.TI) {
      text_color = ColorScheme.get_color("gray", theme);
      grid_color = ColorScheme.get_color_with_opacity("gray_light", 0.6, theme);
    } else {
      text_color = ColorScheme.get_color("white", theme);
      grid_color = ColorScheme.get_color_with_opacity("gray", 0.6, theme);
    }
    let available_line_colors = ["blue", "green", "yellow", "orange"].map(
      (color_name) => ColorScheme.get_color(color_name, theme)
    );

    const { pingbursts, ip_address_info_array } = this.props;
    const series_array = ip_address_info_array
      .filter((info) => info.is_selected)
      .map((info, index) => {
        return ip_series(
          pingbursts,
          info.ip_address,
          info.nickname,
          available_line_colors[index % available_line_colors.length]
        );
      });

    const start = new Date();
    start.setMinutes(start.getMinutes() - 5);
    const finish = new Date();

    //cull_times
    for (const series of series_array) {
      series.data = series.data.filter(
        (datum) => start < datum.start && datum.start < finish
      );
    }
    //make domain
    this.x_scale.domain([start, finish]);

    const all_y_maxes = series_array.map((series) =>
      d3.max(series.data, (datum) => datum.duration)
    );
    const max = d3.max(all_y_maxes);
    this.y_scale.domain([0, max]);

    const series_paths = series_array.map((series) => {
      return {
        ...series,
        d_string: this.lineGenerator(series.data),
      };
    });

    const lines = series_paths.map((path) => (
      <path
        fill="none"
        key={path.id}
        stroke={path.color}
        strokeWidth="2"
        d={path.d_string}
      ></path>
    ));

    const legend_elements = series_paths.map((path, index) => {
      const side = 14;
      const spacing = side * 1.5;
      return (
        <g transform={`translate(5,${spacing * index})`}>
          <rect fill={path.color} width={`${side}`} height={`${side}`}></rect>
          <text
            fill={text_color}
            style={{ fontSize: 12 }}
            textAnchor="start"
            dx="20"
            dy="12"
          >
            {path.label}
          </text>
        </g>
      );
    });

    return (
      <svg
        style={{ width: "100%", color: text_color, overflow: "visible" }}
        viewBox={`0 0 ${this.viewportWidth} ${this.viewportHeight}`}
        preserveAspectRatio={"xMidYMid"}
      >
        {lines}
        <g
          ref={this.x_axis_ref}
          transform={`translate(0, ${
            this.viewportHeight - this.margin.bottom
          })`}
        />
        <g
          ref={this.x_gridlines_ref}
          style={{ color: grid_color }}
          transform={`translate(0, ${
            this.viewportHeight - this.margin.bottom
          })`}
        />
        <g
          ref={this.y_gridlines_ref}
          transform={`translate(${this.margin.left}, 0)`}
          style={{ color: grid_color }}
        />
        <g
          ref={this.y_axis_ref}
          transform={`translate(${this.margin.left}, 0)`}
        />
        <g
          transform={`translate(${this.margin.left / 3}, ${
            (this.viewportHeight - this.margin.top - this.margin.bottom) / 2 +
            this.margin.top
          })`}
        >
          <g transform="rotate(-90)" textAnchor="middle">
            <text fill={text_color}>Duration [ms]</text>
          </g>
        </g>

        <g
          textAnchor="middle"
          transform={`translate(${
            (this.viewportWidth - this.margin.left - this.margin.right) / 2 +
            this.margin.left
          },${this.viewportHeight})`}
        >
          <text fill={text_color}>Start Time</text>
        </g>
        <g
          textAnchor="middle"
          transform={`translate(${
            (this.viewportWidth - this.margin.left - this.margin.right) / 2 +
            this.margin.left
          },${this.margin.top / 2})`}
        >
          <text
            transform="scale(1.5,1.5)"
            fill={text_color}
            style={{ fontWeight: 600 }}
          >
            Node Delay vs. Time
          </text>
        </g>
        <g
          transform={`translate(${this.viewportWidth - this.margin.right},${
            this.margin.top
          })`}
        >
          {legend_elements}
        </g>
      </svg>
    );
  }
}

export default class DelayMonitor extends React.Component {
  render() {
    return (
      <Tile omit_header={true}>
        <div
          style={{
            width: "90%",
            marginTop: 20,
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: 60,
          }}
        >
          <NetworkDelayChart {...this.props} />
        </div>
      </Tile>
    );
  }
}
