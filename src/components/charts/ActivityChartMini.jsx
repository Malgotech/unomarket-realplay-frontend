import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import CustomCard from '@components/ui/CustomCard';
import { useSelector } from 'react-redux';
import { isDarkColor } from '../../utils/colorExtractor'; // Added import for isDarkColor

// Define colors for up to 4 market lines - same as ActivityChart
const CHART_COLORS = ['#298C8C', '#8940EF', '#EF6A40', '#40A9EF'];

// NEW: Custom dot with a solid center and a blinking filled outer circle (smaller version)
const BlinkingDotMini = (props) => {
  const { cx, cy, stroke, index, dataLength } = props;
  // Only show the dot for the last data point
  if (index === dataLength - 1) {
    return (
      <g>
        {/* Blinking filled outer circle */}
        <circle
          cx={cx}
          cy={cy}
          r="8" // Smaller radius
          fill={stroke}
          opacity="0.18"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: 'soundbet-blink 1.6s infinite cubic-bezier(0.4,0,0.2,1)'
          }}
        />
        {/* Solid center circle */}
        <circle
          cx={cx}
          cy={cy}
          r="3" // Smaller radius
          fill={stroke}
          // stroke={isDarkColor(stroke) ? "#fff" : "#000"} // Adjust stroke for visibility based on line color
          strokeWidth="1" // Smaller stroke width
        />
      </g>
    );
  }
  return null;
};

const sampleData = [
  { name: '', probability: 40, time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { name: 'Mon', probability: 50, time: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() },
  { name: 'Tue', probability: 120, time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { name: 'Wed', probability: 100, time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { name: 'Thu', probability: 90, time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { name: 'Fri', probability: 130, time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { name: 'Sat', probability: 160, time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { name: 'Sun', probability: 110, time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
];

// Custom legend component for sub-markets
const CustomChartLegend = ({ markets, chartData, colors, hoveredData }) => {
  if (!markets || markets.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs ">
      {markets.map((market, index) => {
        const color = colors[index % colors.length];
        const marketId = market.market_id;

        // Use hoveredData if available, otherwise use the latest data point
        let valueText = '';
        if (hoveredData && hoveredData[marketId] !== undefined) {
          const value = hoveredData[marketId];
          if (typeof value === 'number' && !isNaN(value)) {
            valueText = `${Math.round(value)}%`;
          }
        } else if (chartData && chartData.length > 0) {
          const latestDataPoint = chartData[chartData.length - 1];
          const value = latestDataPoint && latestDataPoint[marketId];
          if (typeof value === 'number' && !isNaN(value)) {
            valueText = `${Math.round(value)}%`;
          }
        }

        const marketName = market.market_name || `Market ${index + 1}`;

        return (
          <div key={marketId} className="flex items-center">
            <span
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: color }}
            ></span>
            <span style={{ color: color }}>
              {marketName}
              {valueText && <span className="ml-1">{valueText}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ActivityChartMini = ({ eventData, timeFrame = '1w', value = 50 }) => {
  // Add state to track hovered data and probability
  const [hoveredProbability, setHoveredProbability] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);

  // Get current theme from Redux store
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';

  // Process event data to extract probability data for multiple markets
  const marketsData = useMemo(() => {
    if (!eventData) return [];

    // If the event data contains probabilityGraph data, use it
    if (eventData?.probabilityGraph?.marketsData?.length) {
      return eventData.probabilityGraph.marketsData.map((market, index) => {
        // Handle both old and new data formats
        const marketData = market.history || market.data || [];

        return {
          market_id: market.id || market.market_id, // Handle both 'id' and 'market_id'
          market_name: market.name || market.market_name, // Handle both 'name' and 'market_name'
          color: CHART_COLORS[index % CHART_COLORS.length],
          data: marketData.map(item => ({
            name: '',
            probability: parseFloat(item.p || item.probability) || 50, // Handle both 'p' and 'probability'
            time: item.t ? new Date(item.t * 1000).toISOString() : item.time // Handle both 't' (unix) and 'time' formats
          }))
        };
      });
    }

    // If no probability data is available, use sample data
    return [{
      market_id: 'sample',
      market_name: 'Sample',
      color: CHART_COLORS[0],
      data: sampleData
    }];
  }, [eventData]);

  // Find the most recent probability value for display (from first market)
  const currentValue = useMemo(() => {
    // If we have a hovered value, use that
    if (hoveredProbability !== null) {
      return Math.round(hoveredProbability);
    }

    // Otherwise use the most recent data point
    if (!marketsData.length || !marketsData[0].data.length) return value;

    const firstMarket = marketsData[0];
    // Sort data by time to find the latest entry
    const sortedData = [...firstMarket.data].sort((a, b) =>
      new Date(b.time) - new Date(a.time)
    );

    // Return the most recent probability value, rounded to integer
    return Math.round(sortedData[0]?.probability || value);
  }, [marketsData, value, hoveredProbability]);

  // Filter data based on timeFrame for all markets
  const filteredMarketsData = useMemo(() => {
    if (!marketsData.length) {
      return [];
    }

    const now = new Date();
    let cutoffTime;

    // Set cutoff time based on timeFrame
    switch (timeFrame) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
        break;
      case '1d':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        break;
      case '1w':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
        break;
      case '1m':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        break;
      case 'all':
      default:
        // Don't filter for 'all' or undefined timeFrame
        return marketsData;
    }

    // Filter each market's data points
    return marketsData.map(market => ({
      ...market,
      data: market.data.filter(item => new Date(item.time) >= cutoffTime)
    })).filter(market => market.data.length > 0);
  }, [marketsData, timeFrame]);

  // Combine all unique timestamps from all markets for x-axis
  const combinedChartData = useMemo(() => {
    if (!filteredMarketsData.length) {
      return [];
    }

    // Find all unique timestamps across all markets
    const allTimestamps = new Set();
    filteredMarketsData.forEach(market => {
      market.data.forEach(dataPoint => {
        if (dataPoint.time) {
          allTimestamps.add(new Date(dataPoint.time).getTime());
        }
      });
    });

    // Convert to array and sort timestamps
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    // Create data points for each timestamp
    return sortedTimestamps.map(timestamp => {
      const dataPoint = { timestamp };

      // Add probability for each market at this timestamp
      filteredMarketsData.forEach(market => {
        const marketData = market.data.find(
          d => new Date(d.time).getTime() === timestamp
        );

        if (marketData) {
          // Store the probability as a number and use the market_id as the key
          dataPoint[market.market_id] = parseFloat(marketData.probability);
          // Also store market name for tooltip
          dataPoint[`${market.market_id}_name`] = market.market_name;
        }
      });

      return dataPoint;
    });
  }, [filteredMarketsData]);

  // Calculate dynamic Y-axis domain and ticks
  const yAxisStats = useMemo(() => {
    if (!combinedChartData.length) return { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] };

    let min = Infinity;
    let max = -Infinity;

    // Analyze all data points to find min and max values
    combinedChartData.forEach(point => {
      Object.keys(point).forEach(key => {
        // Only process probability values (skip timestamp and name fields)
        if (key !== 'timestamp' && !key.endsWith('_name')) {
          const val = point[key];
          if (typeof val === 'number' && !isNaN(val)) {
            min = Math.min(min, val);
            max = Math.max(max, val);
          }
        }
      });
    });

    // Handle edge case with invalid or missing data
    if (!isFinite(min) || !isFinite(max)) {
      return { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] };
    }

    // Add padding to create visual space around the data
    const range = max - min;
    let pad = Math.max(range * 0.1, 2); // At least 2% padding or 10% of range

    // Round to nearest 5 for cleaner tick values
    let yMin = Math.floor((min - pad) / 5) * 5;
    let yMax = Math.ceil((max + pad) / 5) * 5;

    // Enforce constraints (0-100% probability scale)
    if (yMin < 0) yMin = 0;
    if (yMax > 100) yMax = 100;

    // Generate exactly 5 evenly spaced ticks
    const tickCount = 4; // 4 intervals = 5 ticks
    const step = (yMax - yMin) / tickCount;
    const ticks = Array.from(
      { length: tickCount + 1 },
      (_, i) => Math.round(yMin + i * step)
    );

    return { min: yMin, max: yMax, ticks };
  }, [combinedChartData]);

  // Custom tooltip to display multiple markets' data
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload || {};

      // Define tooltip colors based on theme
      const tooltipBackgroundColor = isDarkMode ? '#333333' : '#FFFFFF';
      const tooltipTextColor = isDarkMode ? '#FFFFFF' : '#000000';
      const marketNameColor = isDarkMode ? '#FFFFFF' : 'rgba(0, 0, 0, 0.7)'; // Adjusted for dark mode

      return (
        <div
          className="px-3 py-2 rounded-md shadow-lg text-xs" // Added shadow-lg for better visibility
          style={{ backgroundColor: tooltipBackgroundColor, border: isDarkMode ? '1px solid #444' : '1px solid #ddd' }} // Added border for dark mode
        >
          {filteredMarketsData.map((market, index) => {
            // Only show markets that have data for this timestamp
            if (data[market.market_id] !== undefined) {
              return (
                <div key={market.market_id} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: market.color }}></div>
                  <p style={{ color: marketNameColor }}> {/* Use dynamic market name color */}
                    {eventData?.has_sub_markets && `${market.market_name}: `}
                    <span className="font-semibold" style={{ color: tooltipTextColor }}> {/* Ensure percentage is also themed */}
                      {Math.round(data[market.market_id])}%
                    </span>
                  </p>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  // Check if we have valid data to display
  const hasData = useMemo(() => {
    const hasMarketsData = filteredMarketsData.length > 0;
    const hasChartData = combinedChartData.length > 0;
    const hasDataPoints = filteredMarketsData.some(market => market.data && market.data.length > 0);

    return hasMarketsData && hasChartData && hasDataPoints;
  }, [filteredMarketsData, combinedChartData]);

  // Display the component with or without a card wrapper
  const renderChart = () => (
    <div className="h-full w-full relative">
      {/* Current probability displayed as chance - moved up and without background */}
      {!eventData?.has_sub_markets && (
        <div className="absolute top-0 left-1 z-10 pb-2"> {/* Changed from top-[-8px] to top-0 */}
          <span className="text-[22px] font-semibold"
            style={{ color: '#4169E1' }}>
            {currentValue}%
            <span className="text-[14px] ml-1" style={{ color: "#4169E1" }}>Chance</span>
          </span>
        </div>
      )}

      {/* Legend for sub-markets - additional padding and improved visibility */}
      {eventData?.has_sub_markets && (
        <div className="absolute top-0 left-3 z-10 max-w-[90%] pb-2"> {/* Changed from top-[-8px] to top-0 */}
          <div className="pb-1">
            <CustomChartLegend
              markets={filteredMarketsData.slice(0, 4)}
              chartData={combinedChartData}
              colors={CHART_COLORS}
              hoveredData={hoveredData}
            />
          </div>
        </div>
      )}

      {!hasData ? (
        <div className="h-full w-full flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={combinedChartData.length ? combinedChartData : [{ timestamp: Date.now(), [filteredMarketsData[0]?.market_id || 'sample']: currentValue }]}
            margin={{ top: eventData?.has_sub_markets ? 35 : 30, right: 0, left: -40, bottom: 0 }}
            onMouseMove={(e) => {
              if (e.activePayload && e.activePayload.length > 0) {
                const payload = e.activePayload[0].payload;
                setHoveredData(payload);
                if (!eventData?.has_sub_markets && filteredMarketsData[0]?.market_id) {
                  const marketId = filteredMarketsData[0].market_id;
                  if (payload[marketId] !== undefined) {
                    setHoveredProbability(payload[marketId]);
                  }
                }
              }
            }}
            onMouseLeave={() => {
              setHoveredData(null);
              setHoveredProbability(null);
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              horizontal={true}
              stroke={"rgba(197, 197, 197, 0.5)"}
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={() => ''} // Hide X-axis labels but keep ticks for visual markers
              tick={{ opacity: 0 }} // Hide ticks but keep the axis structure
              // Generate evenly spaced ticks based on actual data
              ticks={(() => {
                if (combinedChartData.length <= 1) return [];

                // Find min and max timestamps
                let minTimestamp = Infinity;
                let maxTimestamp = -Infinity;
                combinedChartData.forEach(point => {
                  minTimestamp = Math.min(minTimestamp, point.timestamp);
                  maxTimestamp = Math.max(maxTimestamp, point.timestamp);
                });

                // Generate 4-6 ticks depending on data density
                const tickCount = Math.min(6, Math.max(4, Math.ceil(combinedChartData.length / 3)));
                const timeRange = maxTimestamp - minTimestamp;

                // Create evenly distributed ticks
                return Array.from({ length: tickCount }, (_, i) =>
                  minTimestamp + (timeRange * (i / (tickCount - 1)))
                );
              })()}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[yAxisStats.min, yAxisStats.max]}
              ticks={yAxisStats.ticks}
              hide={false}
              axisLine={false}
              tickLine={false}
              orientation="right"
              width={45}
              tick={{
                fill: isDarkMode ? '#C5C5C5' : '#6b7280',
                fontSize: 12,
                textAnchor: 'start',
                dx: 8
              }}
              tickFormatter={v => v + '%'}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Render lines for each market (up to 4) */}
            {filteredMarketsData.slice(0, 4).map((market, index) => {
              const { key, ...dotProps } = market; // Destructure key if present, though market object might not have it directly here.
              // The key issue is more about props passed by Recharts to the dot function.
              return (
                <Line
                  key={market.market_id || `market-${index}`}
                  type="monotone"
                  dataKey={market.market_id}
                  stroke={market.color}
                  strokeWidth={2}
                  // Use custom dot renderer that only shows the last data point
                  // and correctly handles the key prop spread from Recharts
                  dot={(allDotProps) => {
                    const { key: dotKey, ...restDotProps } = allDotProps;
                    return <BlinkingDotMini key={dotKey} {...restDotProps} dataLength={combinedChartData.length} />;
                  }}
                  activeDot={{ r: 4, fill: market.color }}
                  isAnimationActive={true}
                  animationDuration={800}
                  connectNulls={true}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  // If the component is used standalone with CustomCard
  if (!eventData) {
    return (
      <CustomCard className="bg-zinc-100 shadow-none !p-0">
        <div className="h-[135px] w-full">
          {renderChart()}
        </div>
      </CustomCard>
    );
  }

  // If the component is used within TradeCard or TradeCardBarGraph
  return renderChart();
};

export default ActivityChartMini;