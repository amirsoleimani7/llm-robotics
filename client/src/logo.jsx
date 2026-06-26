import * as React from "react";

const SVGComponent = (props,color) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 120"
    width="100%"
    height="100%"
    {...props}
  >
    <defs>
      <mask id="dot-cutout">
        <rect width={120} height={120} fill="white" />
        <circle cx={38} cy={65} r={6} fill="black" />
        <circle cx={60} cy={65} r={6} fill="black" />
        <circle cx={82} cy={65} r={6} fill="black" />
      </mask>
    </defs>
    <g fill="#0096FF" mask="url(#dot-cutout)">
      <circle cx={60} cy={20} r={8} />
      <rect x={56} y={28} width={8} height={12} />
      <rect x={15} y={40} width={90} height={50} rx={12} ry={12} />
      <path d="M 45 89 L 60 110 L 75 89 Z" />
    </g>
  </svg>
);

export default SVGComponent;
