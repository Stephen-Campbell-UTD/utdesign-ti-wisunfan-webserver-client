import React, { useEffect, useRef, useState } from "react";
import reactDom from "react-dom";
import "../assets/Tooltip.css";

function TooltipPortal(props) {
  const { top, left } = props.loc;
  const style = {
    transformOrigin: "center top",
    transform: `translate(calc(-50% + ${left}px),${top}px)`,
    height: 25,
    paddingLeft: 10,
    paddingRight: 10,
    position: "absolute",
    top: "0",
    left: "0",
  };

  return reactDom.createPortal(
    <div style={style} className="tooltip-text">
      {props.content || "N/A"}
    </div>,
    document.body
  );
}

export default function Tooltip(props) {
  const localRef = useRef(null);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!shown) {
      return;
    }
    const boundingRect = localRef.current.getBoundingClientRect();
    const currentLeft = boundingRect.left;
    const currentTop = boundingRect.top + window.scrollY;
    if (top !== currentTop) {
      setTop(currentTop);
    }
    if (left !== currentLeft) {
      setLeft(currentLeft);
    }
  });
  return (
    <div
      className="tooltip-container"
      style={{ width: "100%", display: "relative" }}
      onMouseEnter={() => setShown(true)}
      onMouseLeave={() => setShown(false)}
    >
      {props.children}
      <div ref={localRef} className="tooltip-bottom-center"></div>
      {shown && (
        <TooltipPortal
          loc={{ top, left }}
          content={props.content}
        ></TooltipPortal>
      )}
    </div>
  );
}
