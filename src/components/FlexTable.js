import React, { useContext, useEffect, useRef, useState } from "react";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";
import { FixedSizeList, areEqual } from "react-window";
import {
  scrollbarVisible as getScrollbarVisible,
  scrollbar_width,
} from "../utils.js";
import produce from "immer";
import "../assets/FlexTable.css";

const divider_height = 2;

class HeaderDatum extends React.Component {
  constructor(props) {
    super(props);
    this.refContainer = React.createRef();
    this.width = null;
    this.ro = null;
  }
  componentDidMount() {
    this.ro = new ResizeObserver((entries) => {
      console.assert(entries.length === 1);
      const newWidth = entries[0].target.clientWidth;
      if (newWidth !== this.width) {
        this.props.widthCallback(newWidth);
        this.width = newWidth;
      }
    });
    this.ro.observe(this.refContainer.current);
  }
  componentWillUnmount() {
    return () => this.ro.disconnect();
  }

  render() {
    return (
      <div
        className="flex_table_datum"
        ref={this.refContainer}
        style={this.props.style}
      >
        {this.props.headerValue}
      </div>
    );
  }
}

export default function FlexTable(props) {
  const [columnWidths, setColumnWidths] = useState(
    props.table_format.map(() => -1)
  );
  // Theming
  const theme = useContext(ThemeContext);
  let body_bg_color = ColorScheme.get_color("bg2", theme);
  let header_fg_color = null;
  let header_bg_color = null;
  let body_fg_color = null;
  let borderRadius = null;
  let table_box_shadow = null;
  let row_rule_color = null;
  if (theme === THEME.TI) {
    header_bg_color = ColorScheme.get_color("red", theme);
    header_fg_color = ColorScheme.get_color("white", theme);
    body_fg_color = ColorScheme.get_color("gray", theme);
    borderRadius = 0;
    table_box_shadow = "0px 1px 14px rgba(0, 0, 0, 0.3)";
    row_rule_color = ColorScheme.get_color("gray_light", theme);
  } else {
    header_bg_color = ColorScheme.get_color("bg3", theme);
    header_fg_color = ColorScheme.get_color("white", theme);
    body_fg_color = ColorScheme.get_color("white", theme);
    row_rule_color = ColorScheme.get_color("bg1", theme);
    borderRadius = 9;
  }
  const main_table_style = {
    color: body_fg_color,
    backgroundColor: body_bg_color,
    boxShadow: table_box_shadow,
    borderRadius: `0 0 ${borderRadius} ${borderRadius}`,
  };

  function width_callback_generator(index) {
    return (width) => {
      setColumnWidths(
        produce(columnWidths, (draft) => {
          draft[index] = width;
        })
      );
    };
  }

  const table_headers = props.table_format.map((col_format, index) => {
    return (
      <HeaderDatum
        widthCallback={width_callback_generator(index)}
        key={col_format.headerValue}
        {...col_format}
      />
    );
  });

  const data_to_elements_mapper = props.dataToElementsMapper;
  const total_columns = props.table_format.length;
  const itemData = props.itemData;

  const RowRenderer = (row_props) => {
    const elements = data_to_elements_mapper(row_props.index, itemData, {
      columnWidths,
    });
    console.assert(elements.length === total_columns);
    const wrapped_elems = elements.map((ele, index) => {
      let datum_style = props.table_format[index].style;
      return (
        <div className="flex_table_datum" style={datum_style} key={index}>
          {ele}
        </div>
      );
    });
    const body_row_style = {
      borderBottom: `${divider_height}px solid ${row_rule_color}`,
    };
    return (
      <div
        style={{ ...row_props.style, ...body_row_style }}
        className="flex_table_row"
      >
        {wrapped_elems}
      </div>
    );
  };

  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  const outerRef = useRef(null);
  useEffect(() => {
    const newScrollbarVisible = getScrollbarVisible(outerRef.current);
    if (newScrollbarVisible !== scrollbarVisible) {
      setScrollbarVisible(newScrollbarVisible);
    }
  });

  return (
    <div>
      <div
        style={{
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
          paddingRight: scrollbarVisible ? scrollbar_width : 0,
          color: header_fg_color,
          backgroundColor: header_bg_color,
          height: props.rowHeight,
        }}
        className="flex_table_row"
      >
        {table_headers}
      </div>
      <FixedSizeList
        outerRef={outerRef}
        className={"flex_table ".concat(theme)}
        style={main_table_style}
        height={props.rowHeight * props.numVisibleRows}
        itemCount={props.itemCount}
        itemSize={props.rowHeight}
        width="100%"
        itemKey={(index) => props.rowKeyGenerator(index, props.itemData)}
        overscanCount={5}
      >
        {RowRenderer}
      </FixedSizeList>
    </div>
  );
}
