import '../assets/NCPStateIndicator.css';
interface NCPStateIndicatorProps {
  ncpState: string | null;
}
export function NCPStateIndicator({ncpState}: NCPStateIndicatorProps) {
  const textStyle: React.CSSProperties = {
    transformOrigin: 'center',
    transform: 'scale(2)',
  };
  let invalid = false;
  let offline = false;
  let assocated = false;
  let isLoading = false;
  ncpState = ncpState ? ncpState.toUpperCase() : null;
  switch (ncpState) {
    case null:
      isLoading = true;
      break;
    case 'OFFLINE':
      offline = true;
      break;
    case 'ASSOCIATED':
      assocated = true;
      break;
    default:
      invalid = true;
  }

  return null;
}
// <svg
//   style={{
//     width: '100%',
//     height: 'auto',
//     fontSize: 40,
//   }}
//   width="1000"
//   height="250"
//   viewBox="0 0 1000 250"
//   fill="none"
//   xmlns="http://www.w3.org/2000/svg"
// >
//   <g id="NCPState" className={isLoading ? 'Loading' : ''}>
//     <text
//       id="Offline"
//       fill="black"
//       xmlSpace="preserve"
//       style={{whiteSpace: 'pre', ...textStyle}}
//       // fontFamily="Raleway"
//       // fontSize={fontSize}
//       // fontWeight="600"
//       letterSpacing="0em"
//     >
//       <tspan x="463" y="35.472">
//         Offline
//       </tspan>
//     </text>
//     <text
//       id="Invalid State"
//       fill="black"
//       xmlSpace="preserve"
//       style={{whiteSpace: 'pre', ...textStyle}}
//       // font-family="Raleway"
//       // font-size={fontSize}
//       // font-weight="600"
//       letterSpacing="0em"
//     >
//       <tspan x="77" y="31.472">
//         Invalid State
//       </tspan>
//     </text>
//     <text
//       id="Associated"
//       fill="black"
//       xmlSpace="preserve"
//       style={{whiteSpace: 'pre', ...textStyle}}
//       // font-family="Raleway"
//       // font-size={fontSize}
//       // font-weight="600"
//       letterSpacing="0em"
//     >
//       <tspan x="789" y="35.472">
//         Associated
//       </tspan>
//     </text>
//     <circle id="InvalidBG" className="BG" cx="148" cy="125" r="75" fill="#C4C4C4" />
//     <circle
//       id="InvalidFG"
//       style={{opacity: invalid ? 1 : 0}}
//       cx="148"
//       cy="125"
//       r="75"
//       fill="#D4853D"
//     />
//     <rect
//       id="ConnectorLeft"
//       className="BG"
//       x="223"
//       y="119"
//       width="202"
//       height="13"
//       fill="#C4C4C4"
//     />
//     <rect
//       id="ConnectorRight"
//       className="BG"
//       x="575"
//       y="119"
//       width="202"
//       height="13"
//       fill="#C4C4C4"
//     />
//     <circle id="OfflineBG" className="BG" cx="500" cy="125" r="75" fill="#C4C4C4" />
//     <circle
//       id="OfflineFG"
//       style={{opacity: offline ? 1 : 0}}
//       cx="500"
//       cy="125"
//       r="75"
//       fill="#EA3D3D"
//     />
//     <circle id="AssociatedBG" className="BG" cx="852" cy="125" r="75" fill="#C4C4C4" />
//     <circle
//       id="AssociatedFG"
//       style={{opacity: assocated ? 1 : 0}}
//       cx="852"
//       cy="125"
//       r="75"
//       fill="#43B530"
//     />
//   </g>
// </svg>
