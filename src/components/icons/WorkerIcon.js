import React from 'react';
import Svg, { Path } from 'react-native-svg';

const WorkerIcon = ({ width = 24, height = 24, color = '#000' }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2a3 3 0 00-3 3v3H7a2 2 0 00-2 2v1h14v-1a2 2 0 00-2-2h-2V5a3 3 0 00-3-3zm-6 13v6h14v-6H6zm6 2a2 2 0 110-4 2 2 0 010 4z"
      fill={color}
    />
  </Svg>
);

export default WorkerIcon;