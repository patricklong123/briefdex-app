import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';

interface IconProps {
  size?: number;
  color?: string;
}

export const FlameIcon = ({ size = 22, color = colors.gold }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2c1 3 4 4 4 8a4 4 0 11-8 0c0-1 .5-2 1-3-3 1-5 4-5 8a8 8 0 1016 0c0-6-4-9-8-13z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckIcon = ({ size = 22, color = colors.gold }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ClockIcon = ({ size = 22, color = colors.gold }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BellIcon = ({ size = 20, color = colors.gold }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 004 0"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CardIcon = ({ size = 20, color = colors.gold }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM3 10h18"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GearIcon = ({ size = 20, color = colors.gold }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path
      d="M19 12c0-.5 0-1-.1-1.4l2-1.5-2-3.5-2.3.9c-.7-.6-1.5-1-2.3-1.3L13.8 3h-3.6l-.5 2.2c-.8.3-1.6.7-2.3 1.3l-2.3-.9-2 3.5 2 1.5C5 11 5 11.5 5 12s0 1 .1 1.4l-2 1.5 2 3.5 2.3-.9c.7.6 1.5 1 2.3 1.3l.5 2.2h3.6l.5-2.2c.8-.3 1.6-.7 2.3-1.3l2.3.9 2-3.5-2-1.5c.1-.4.1-.9.1-1.4z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRightIcon = ({ size = 16, color = colors.textFaint }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChevronLeftIcon = ({ size = 18, color = colors.white }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 6l-6 6 6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const LogoutIcon = ({ size = 18, color = colors.red }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4M10 17l5-5-5-5M15 12H3"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
