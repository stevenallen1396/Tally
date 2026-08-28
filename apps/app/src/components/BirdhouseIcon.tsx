import type { ColorValue } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

type BirdhouseIconProps = {
  size?: number;
  color?: ColorValue;
};

// Ionicons' own line weight is a 32-unit stroke on a 512 grid (verified
// against the settings-outline glyph in Ionicons.ttf); bumped slightly
// heavier than that exact match since it read as too light next to the
// settings icon in practice.
const STROKE_WIDTH = 38;

export function BirdhouseIcon({ size = 24, color = "#000000" }: BirdhouseIconProps) {
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
      <Circle cx={256} cy={73} r={31} />
      <Polyline points="62,276 256,122 450,276" />
      <Line x1={102} y1={276} x2={102} y2={470} />
      <Line x1={410} y1={276} x2={410} y2={470} />
      <Line x1={62} y1={470} x2={450} y2={470} />
      <Circle cx={256} cy={344} r={31} />
      <Line x1={214} y1={419} x2={298} y2={419} />
    </Svg>
  );
}
