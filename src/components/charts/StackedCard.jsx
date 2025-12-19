import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ParentSize } from '@visx/responsive';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import logoDark from "../../images/unologo.svg";
import logoLight from "../../images/unologo-dark.svg";



// Tooltip component for dark/light mode
const CustomTooltip = ({ active, payload, label, isDarkMode }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey}: <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Stacked Area Chart Component
const StackedAreaChart = ({ 
  width, 
  height, 
  data,
  isDarkMode,
  timeFrame,
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]
}) => {
  // Format the stacked chart data based on timeframe
  const stackedData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate sample data if none provided
      const sampleCount = timeFrame === '1h' ? 12 : 
                         timeFrame === '1d' ? 24 : 
                         timeFrame === '1w' ? 7 : 
                         timeFrame === '1m' ? 30 : 7;
      
      return Array.from({ length: sampleCount }, (_, i) => ({
        name: `${timeFrame === '1h' ? `${i+1}:00` : 
               timeFrame === '1d' ? `${i}:00` : 
               timeFrame === '1w' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7] :
               timeFrame === '1m' ? `Day ${i+1}` : `Day ${i+1}`}`,
        uv: Math.floor(Math.random() * 1000) + 200,
        pv: Math.floor(Math.random() * 800) + 100,
        amt: Math.floor(Math.random() * 600) + 50,
        volume: Math.floor(Math.random() * 1200) + 300,
        trades: Math.floor(Math.random() * 400) + 100,
      }));
    }

    return data.map((item, index) => ({
      name: item.name || 
            `${timeFrame === '1h' ? `H${index+1}` : 
             timeFrame === '1d' ? `${index}:00` : 
             timeFrame === '1w' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index % 7] :
             `Day ${index+1}`}`,
      uv: item.uv || 0,
      pv: item.pv || 0,
      amt: item.amt || 0,
      volume: item.volume || 0,
      trades: item.trades || 0,
      timestamp: item.timestamp || new Date().getTime() - (data.length - index) * 86400000
    }));
  }, [data, timeFrame]);

  // Chart configuration based on dark/light mode
  const chartConfig = useMemo(() => ({
    gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    axisColor: isDarkMode ? '#C5C5C5' : '#666666',
    tooltipBg: isDarkMode ? '#333333' : '#FFFFFF',
    tooltipText: isDarkMode ? '#FFFFFF' : '#000000',
    borderColor: isDarkMode ? '#444444' : '#E5E5E5',
  }), [isDarkMode]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AreaChart
        width={width}
        height={height}
        data={stackedData}
        margin={{
          top: 20,
          right: 10,
          left: 10,
          bottom: 30,
        }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={chartConfig.gridColor}
          vertical={false}
        />
        <XAxis 
          dataKey="name" 
          tick={{ fill: chartConfig.axisColor, fontSize: 12 }}
          axisLine={{ stroke: chartConfig.borderColor }}
          tickLine={{ stroke: chartConfig.borderColor }}
        />
        <YAxis 
          tick={{ fill: chartConfig.axisColor, fontSize: 12 }}
          axisLine={{ stroke: chartConfig.borderColor }}
          tickLine={{ stroke: chartConfig.borderColor }}
          tickFormatter={(value) => {
            if (value >= 1000) return `$${(value/1000).toFixed(1)}k`;
            return `$${value}`;
          }}
        />
        <Tooltip 
          content={<CustomTooltip isDarkMode={isDarkMode} />}
        />
        <Area
          type="monotone"
          dataKey="uv"
          stackId="1"
          stroke={colors[0]}
          fill={colors[0]}
          fillOpacity={0.8}
          name="Volume 1"
        />
        <Area
          type="monotone"
          dataKey="pv"
          stackId="1"
          stroke={colors[1]}
          fill={colors[1]}
          fillOpacity={0.8}
          name="Volume 2"
        />
        <Area
          type="monotone"
          dataKey="amt"
          stackId="1"
          stroke={colors[2]}
          fill={colors[2]}
          fillOpacity={0.8}
          name="Volume 3"
        />
        <Area
          type="monotone"
          dataKey="volume"
          stackId="1"
          stroke={colors[3]}
          fill={colors[3]}
          fillOpacity={0.8}
          name="Total Volume"
        />
      </AreaChart>
    </div>
  );
};

// Debounced ParentSize wrapper for smoother transitions
const DebouncedParentSize = ({ children, debounceMs = 50 }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const timeoutRef = useRef(null);

  const updateDimensions = (width, height) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDimensions({ width, height });
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ParentSize>
      {({ width, height }) => {
        updateDimensions(width || 800, height || 300);
        return children({
          width: dimensions.width || width || 800,
          height: dimensions.height || height || 300
        });
      }}
    </ParentSize>
  );
};

// Custom Legend Component
const StackedChartLegend = ({ data, colors, isDarkMode }) => {
  const legends = [
    { key: 'uv', label: 'Volume 1', color: colors[0] },
    { key: 'pv', label: 'Volume 2', color: colors[1] },
    { key: 'amt', label: 'Volume 3', color: colors[2] },
    { key: 'volume', label: 'Total Volume', color: colors[3] },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {legends.map((legend) => (
        <div key={legend.key} className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: legend.color }}
          />
          <span className={`text-sm ${isDarkMode ? 'text-[#C5C5C5]' : 'text-gray-600'}`}>
            {legend.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// Main StackedChart Component with ActivityChart flow
const StackedChart = ({ 
  data,
  timeFrame = '1w',
  timelineOptions,
  handleTimelineChange,
  title = "Volume Analysis",
  subtitle = "Stacked area chart showing multiple volume metrics",
  showHeader = true,
  showTimeline = true,
  colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"]
}) => {
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';
  const [hoveredData, setHoveredData] = useState(null);

  // Calculate total volume for display
  const totalVolume = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, item) => sum + (item.volume || 0), 0);
  }, [data]);

  // Calculate average volume
  const averageVolume = useMemo(() => {
    if (!data || data.length === 0) return 0;
    return Math.round(totalVolume / data.length);
  }, [data, totalVolume]);

  // Format volume for display
  const formatVolume = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  return (
    <div className="  h-[400px] w-full transition-all duration-300 ease-in-out  ">
      {/* Header Section */}
      {showHeader && (
        <div className="px-3 pt-1 min-h-[67px]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-y-3 sm:gap-x-4">
            {/* Left Part: Title and Stats */}
            <div className="w-full sm:w-auto min-h-[36px] flex flex-col justify-center">
              <div className="flex items-center gap-4">
                <span className="text-[25px] font-semibold" style={{ color: "#4169E1" }}>
                  {formatVolume(totalVolume)}
                </span>
                <div className="flex flex-col">
                  <span className={`text-sm ${isDarkMode ? 'text-[#C5C5C5]' : 'text-gray-600'}`}>
                    {title}
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-[#C5C5C5]/70' : 'text-gray-500'}`}>
                    {subtitle}
                  </span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="mt-2">
                <StackedChartLegend 
                  data={data} 
                  colors={colors}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* Right Part: soundbet Logo and Stats */}
            <div className="flex flex-col items-end gap-2 min-h-[36px]">
              <img 
                src={isDarkMode ?  logoLight : logoDark} 
                alt="unomarket" 
                className="h-7 w-auto  "
              />
              {hoveredData && (
                <div className={`text-xs ${isDarkMode ? 'text-[#C5C5C5]' : 'text-gray-600'}`}>
                  Hover: {hoveredData.name}
                </div>
              )}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="flex gap-4 mt-3">
            <div className={`text-sm ${isDarkMode ? 'text-[#C5C5C5]' : 'text-gray-600'}`}>
              <span className="font-medium">Avg:</span> {formatVolume(averageVolume)}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-[#C5C5C5]' : 'text-gray-600'}`}>
              <span className="font-medium">Peak:</span> {formatVolume(Math.max(...(data?.map(d => d.volume) || [0])))}
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-[#C5C5C5]' : 'text-gray-600'}`}>
              <span className="font-medium">Period:</span> {timeFrame}
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div style={{ height: showHeader ? '69%' : '85%', width: '100%' }} className="transition-all duration-300 ease-in-out">
        <DebouncedParentSize>
          {({ width, height }) => (
            <StackedAreaChart
              width={width}
              height={height}
              data={data}
              isDarkMode={isDarkMode}
              timeFrame={timeFrame}
              colors={colors}
            />
         
          )}
        </DebouncedParentSize>
      </div>

      {/* Timeline Options */}
      {showTimeline && timelineOptions && handleTimelineChange && (
        <div className="px-3">
          <div className="flex gap-2 flex-wrap justify-start">
            {timelineOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimelineChange(option)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-[8px] transition-all duration-300 ease-in-out ${
                  timeFrame === option.value
                    ? "bg-[#298C8C] border border-[#298C8C] text-white transform scale-105"
                    : isDarkMode 
                      ? "bg-transparent border border-[#C5C5C5]/50 text-[#C5C5C5] hover:bg-[#C5C5C5]/30" 
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Usage examples:
const timelineOptions = [
  { value: '1h', label: '1H' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
  { value: '1m', label: '1M' },
  { value: 'all', label: 'ALL' }
];

// Sample data for stacked chart
const sampleStackedData = [
  { name: "Day 1", uv: 400, pv: 240, amt: 240, volume: 880 },
  { name: "Day 2", uv: 300, pv: 139, amt: 221, volume: 660 },
  { name: "Day 3", uv: 500, pv: 980, amt: 229, volume: 1709 },
  { name: "Day 4", uv: 478, pv: 390, amt: 200, volume: 1068 },
  { name: "Day 5", uv: 589, pv: 480, amt: 218, volume: 1287 },
  { name: "Day 6", uv: 439, pv: 380, amt: 250, volume: 1069 },
  { name: "Day 7", uv: 449, pv: 430, amt: 210, volume: 1089 },
];

export default StackedChart;
export { StackedAreaChart };