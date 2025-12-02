import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

const CalendarIcon = ({ width = 24, height = 24, color = '#000' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M16 2v4M8 2v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M7 11h10M7 15h10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export default CalendarIcon;