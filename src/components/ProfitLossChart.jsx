import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { curveCardinal } from '@visx/curve';
import { ParentSize } from '@visx/responsive';

const ProfitLossChart = ({ data, width = 200, height = 100, isDarkMode }) => {

  // Margins
  const margin = {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
  };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Accessors
  const getDate = d => new Date(d.date);
  const getValue = d => d.profitLoss;

  // Scales
  const xScale = useMemo(() => {
    if (!data || data.length === 0) return null;
    const extent = [
      Math.min(...data.map(d => getDate(d))),
      Math.max(...data.map(d => getDate(d)))
    ];
    return scaleTime({
      range: [0, innerWidth],
      domain: extent,
    });
  }, [data, innerWidth]);

  const yScale = useMemo(() => {
    if (!data || data.length === 0) return null;
    const extent = [
      Math.min(...data.map(d => getValue(d))),
      Math.max(...data.map(d => getValue(d)))
    ];
    return scaleLinear({
      range: [innerHeight, 0],
      domain: extent,
    });
  }, [data, innerHeight]);

  // Determine if the line should be green or red based on the last value
  const lastValue = data[data.length - 1]?.profitLoss || 0;
  const lineColor = lastValue >= 0 ? '#22c55e' : '#ef4444';

  if (!data || data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No data</div>;
  }

  if (!xScale || !yScale) {
    return <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Invalid scales</div>;
  }

  // Helper to get color for a segment
  const getSegmentColor = (y1, y2) => {
    if (y1 >= 0 && y2 >= 0) return '#009689'; // green
    if (y1 < 0 && y2 < 0) return '#8d1f17'; // red
    // If crossing zero, color up to zero in one color, then the rest in the other
    return null;
  };

  // Build line segments
  const segments = [];
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const x1 = xScale(getDate(prev));
    const y1 = yScale(getValue(prev));
    const x2 = xScale(getDate(curr));
    const y2 = yScale(getValue(curr));
    const color = getSegmentColor(prev.profitLoss, curr.profitLoss);
    if (color) {
      segments.push({ x1, y1, x2, y2, color });
    } else {
      // Split at zero crossing
      const zeroX = x1 + (x2 - x1) * (0 - prev.profitLoss) / (curr.profitLoss - prev.profitLoss);
      const zeroY = yScale(0);
      segments.push({ x1, y1, x2: zeroX, y2: zeroY, color: prev.profitLoss >= 0 ? '#009689' : '#8d1f17' });
      segments.push({ x1: zeroX, y1: zeroY, x2, y2, color: curr.profitLoss >= 0 ? '#009689' : '#8d1f17' });
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} className="">
      <svg 
        width={width} 
        height={height} 
        style={{ overflow: 'visible' }}
        className="bg-opacity-5"
      >
        <Group left={margin.left} top={margin.top}>
          {segments.map((seg, idx) => (
            <Line
              key={idx}
              from={{ x: seg.x1, y: seg.y1 }}
              to={{ x: seg.x2, y: seg.y2 }}
              stroke={seg.color}
              strokeWidth={1.5}
            />
          ))}
        </Group>
      </svg>
    </div>
  );
};

// Wrap with ParentSize to make it responsive
const ResponsiveProfitLossChart = props => {
  return (
    <div className="w-full h-full">
      <ParentSize>
        {({ width, height }) => {
          return <ProfitLossChart width={width} height={height} {...props} />;
        }}
      </ParentSize>
    </div>
  );
};

export default ResponsiveProfitLossChart; 