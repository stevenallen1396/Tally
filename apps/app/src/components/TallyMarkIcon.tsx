import type { ColorValue } from "react-native";
import Svg, { Line } from "react-native-svg";

type TallyMarkIconProps = {
  size?: number;
  color?: ColorValue;
};

// Kept in sync with BirdhouseIcon's stroke weight.
const STROKE_WIDTH = 38;
const STROKE_X = [132, 215, 297, 380];

export function TallyMarkIcon({ size = 24, color = "#000000" }: TallyMarkIconProps) {
  const c = color as string;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      stroke={c}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {STROKE_X.map((x) => (
        <Line key={x} x1={x} y1={55} x2={x} y2={462} />
      ))}
      <Line x1={49} y1={447} x2={463} y2={70} />
    </Svg>
  );
}
