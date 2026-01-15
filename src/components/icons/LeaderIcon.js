import React from 'react';
import Svg, { Path } from 'react-native-svg';

const LeaderIcon = ({ width = 24, height = 24, color = '#000' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 6c2.76 0 5 2.24 5 5v5h-2v-5c0-1.66-1.34-3-3-3s-3 1.34-3 3v5H7v-5c0-2.76 2.24-5 5-5z"
      fill={color}
    />
  </Svg>
);

export default LeaderIcon;