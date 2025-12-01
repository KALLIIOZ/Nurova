import React from 'react';
import Svg, { Path } from 'react-native-svg';

const PsychologistRoleIcon = ({ width = 24, height = 24, color = '#000' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 2.87 1.94 5.28 4.63 6.05L10 20l3.37-4.95C17.06 14.28 19 11.87 19 9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.45-.64 2.75-1.66 3.61L12 17.5 8.66 12.61C7.64 11.75 7 10.45 7 9c0-2.76 2.24-5 5-5z"
      fill={color}
    />
  </Svg>
);

export default PsychologistRoleIcon;