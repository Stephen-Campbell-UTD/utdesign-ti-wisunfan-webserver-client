import React from "react";
import { ColorScheme, THEME, ThemeContext } from "../ColorScheme";
import cytoscape from "cytoscape";
import CytoscapeComponent from "react-cytoscapejs";
import dagre from "cytoscape-dagre";
import produce from "immer";
// import "../assets/Pane.css";
cytoscape.use(dagre);

export default class Topology extends React.Component {
  constructor(props) {
    super(props);
    this.layout = { name: "dagre" };

    const ti_gray = ColorScheme.get_color("gray", THEME.TI);
    const ti_blue = ColorScheme.get_color("blue", THEME.TI);
    const ti_red = ColorScheme.get_color("red", THEME.TI);
    this.previous_theme = this.context;
    this.ti_stylesheet = [
      {
        selector: "node",
        style: {
          "background-color": ti_red,
        },
      },
      {
        selector: "edge",
        style: {
          width: 3,
          "line-color": ti_gray,
          "target-arrow-color": ti_gray,
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
        },
      },
      {
        selector: "node:selected",
        style: {
          "background-color": ti_blue,
        },
      },
    ];
    const fg0 = ColorScheme.get_color("fg0");
    const gruvbox_blue = ColorScheme.get_color("blue", THEME.GRUVBOX);
    const gruvbox_orange = ColorScheme.get_color("orange", THEME.GRUVBOX); //currently no ti orange color so use gruvbox for both
    this.gruvbox_stylesheet = [
      {
        selector: "node",
        style: {
          "background-color": gruvbox_orange,
        },
      },
      {
        selector: "edge",
        style: {
          width: 3,
          "line-color": fg0,
          "target-arrow-color": fg0,
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
        },
      },
      {
        selector: "node:selected",
        style: {
          "background-color": gruvbox_blue,
        },
      },
    ];
  }
  componentDidMount() {
    this.cy.on("select", "node", (e) => {
      const node = e.target;
      this.props.ip_selection_handler(node.id(), true);
    });
    this.cy.on("unselect", "node", (e) => {
      const node = e.target;
      this.props.ip_selection_handler(node.id(), false);
    });
    this.cy.on("add", "node", (_evt) => {
      this.cy.layout(this.layout).run();
    });
  }

  componentDidUpdate() {
    if (this.context !== this.previous_theme) {
      this.cy.style(
        this.context === THEME.TI ? this.ti_stylesheet : this.gruvbox_stylesheet
      );
      this.previous_theme = this.context;
    }
  }

  render() {
    const ip_info_array = this.props.ip_address_info_array;
    const unnormalized_elements = produce(this.props.elements, (elements) => {
      const nodes = elements.nodes;
      for (const node of nodes) {
        const ip_info = ip_info_array.find(
          (ip_info) => ip_info.ip_address === node.data.id
        );
        node.selected = ip_info.is_selected;
      }
    });

    return (
      <CytoscapeComponent
        elements={CytoscapeComponent.normalizeElements(unnormalized_elements)}
        cy={(cy) => {
          this.cy = cy;
        }}
        style={{ width: "100%" }}
        layout={this.layout}
        stylesheet={
          this.context === THEME.TI
            ? this.ti_stylesheet
            : this.gruvbox_stylesheet
        }
        wheelSensitivity={0.1}
      />
    );
    // return <div style={{ width: "100%" }} id="cy"></div>;
  }
}
Topology.contextType = ThemeContext;
