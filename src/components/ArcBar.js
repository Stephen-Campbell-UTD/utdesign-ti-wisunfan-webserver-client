import React, { useContext } from "react";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";
import "../assets/ArcBar.css";

export default function ArcBar(props) {
  const theme = useContext(ThemeContext);
  let label_color = null;
  let sub_label_color = null;
  let lineCapType = null;
  let backgroundColor = null;
  let isShadow = null;
  const red = ColorScheme.get_color("red", theme);
  const yellow = ColorScheme.get_color("yellow", theme);
  const green = ColorScheme.get_color("green", theme);
  if (theme === THEME.TI) {
    isShadow = true;
    backgroundColor = ColorScheme.get_color("bg0", THEME.TI);
    sub_label_color = ColorScheme.get_color("gray_light", THEME.TI);
    label_color = ColorScheme.get_color("gray", THEME.TI);
    lineCapType = "square";
  } else {
    backgroundColor = ColorScheme.get_color("bg1", THEME.GRUVBOX);
    sub_label_color = ColorScheme.get_color("gray", THEME.GRUVBOX);
    label_color = ColorScheme.get_color("white", THEME.GRUVBOX);
    lineCapType = "round";
  }
  const bigger_better_thresholds = {
    0.3: red,
    0.6: yellow,
    0.9: green,
  };
  const bigger_worse_thresholds = {
    0.3: green,
    0.6: yellow,
    0.9: red,
  };
  let thresholds = props.is_bigger_better
    ? bigger_better_thresholds
    : bigger_worse_thresholds;
  let progress_color = props.is_bigger_better ? green : red;
  for (let threshold in thresholds) {
    if (threshold > props.percentFull) {
      progress_color = thresholds[threshold];
      break;
    }
  }
  let total_arc_length = 210.487;
  let percent = props.percentFull;
  const stroke_dash = {
    strokeDasharray: total_arc_length,
    strokeDashoffset: -1 * total_arc_length * (1 - percent),
  };
  return (
    <div className="arc_bar_container">
      <svg
        className="arc_bar"
        width="144"
        height="77"
        viewBox="0 0 144 77"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter={isShadow ? `url(#arc_bar_shadow)` : null}>
          <path
            style={{ stroke: backgroundColor }}
            d="M139 72
        C139 54.2305 131.941 37.1888 119.376 24.6238
        C106.811 12.0589 89.7695 5 72 5
        C54.2305 5 37.1888 12.0589 24.6239 24.6238
        C12.0589 37.1888 5 54.2305 5 72"
            strokeWidth="10"
            strokeLinecap={lineCapType}
          />
          <path
            style={{ stroke: progress_color, ...stroke_dash }}
            d="M139 72
        C139 54.2305 131.941 37.1888 119.376 24.6238
        C106.811 12.0589 89.7695 5 72 5
        C54.2305 5 37.1888 12.0589 24.6239 24.6238
        C12.0589 37.1888 5 54.2305 5 72"
            strokeWidth="10"
            strokeLinecap={lineCapType}
          />
        </g>
        <defs>
          <filter
            id="arc_bar_shadow"
            x="0.889893"
            y="0"
            width="166.92"
            height="94.5"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_176:280"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_176:280"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
      <h3 style={{ color: label_color }} className="arc_bar_label_top">
        {props.valueText}
      </h3>
      <h4 style={{ color: label_color }} className="arc_bar_label_bottom">
        {props.valueDescription}
      </h4>
      <p
        style={{ color: sub_label_color }}
        className="arc_bar_tick arc_bar_tick_left"
      >
        {props.minLabel}
      </p>
      <p
        style={{ color: sub_label_color }}
        className="arc_bar_tick arc_bar_tick_right"
      >
        {props.maxLabel}
      </p>
    </div>
  );
}
