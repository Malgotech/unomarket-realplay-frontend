import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisRight } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { useTooltip, defaultStyles, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { bisector } from 'd3-array';
import { format } from 'date-fns';
import { ParentSize } from '@visx/responsive';
import { curveStepAfter } from '@visx/curve';

// Define colors for up to 2 market lines (top markets only)
const CHART_COLORS = ["#257e7e", "#274ECC"];
const CHART_COLORS1 = ["#fff", "#274ECC"];
// Tooltip styles
const tooltipStyles = {
  ...defaultStyles,
  background: '#333333',
  color: '#FFFFFF',
  borderRadius: '4px',
  padding: '12px',
};

// Data accessor functions
const getDate = (d) => new Date(d.timestamp);
const getValue = (d, marketId) => d[marketId];

// Bisector for finding closest data point
const bisectDate = bisector((d) => new Date(d.timestamp)).left;

// Visx Chart Component optimized for mini size
const VisxChartMini = ({
  width,
  height,
  chartData,
  marketsToShow,
  yAxisStats,
  timeFrame,
  isDarkMode,
  onHover,
  hoveredData
}) => {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({ detectBounds: true, scroll: true });

  // State for mouse position to create the gray overlay effect
  const [mouseX, setMouseX] = useState(null);

  // Margins - smaller for mini chart
  const margin = {
    top: 5,
    right: 35,
    bottom: 25,
    left: 8
  };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  // Scales
  const xScale = useMemo(() => {
    if (!chartData.length) return scaleTime({ range: [0, innerWidth], domain: [new Date(), new Date()] });
    const extent = [
      Math.min(...chartData.map(d => getDate(d))),
      Math.max(...chartData.map(d => getDate(d)))
    ];
    return scaleTime({
      range: [0, innerWidth],
      domain: extent,
    });
  }, [chartData, innerWidth]);

  const yScale = useMemo(() => {
    return scaleLinear({
      range: [innerHeight, 0],
      domain: [yAxisStats.min, yAxisStats.max],
    });
  }, [innerHeight, yAxisStats]);

  // Format tick values for x-axis (simplified for mini chart)
  const formatXTick = (value) => {
    const tickTime = new Date(value);
    if (timeFrame === '1h' || timeFrame === '1d') {
      return format(tickTime, 'HH:mm');
    } else {
      return format(tickTime, 'MMM dd');
    }
  };

  // Handle mouse events
  const handleTooltip = (event) => {
    if (!chartData.length) return;

    const { x } = localPoint(event) || { x: 0 };
    const adjustedX = x - margin.left;

    // Set mouse position for gray overlay effect
    setMouseX(adjustedX);

    const x0 = xScale.invert(adjustedX);
    const index = bisectDate(chartData, x0, 1);
    const d0 = chartData[index - 1];
    const d1 = chartData[index];
    let d = d0;
    if (d1 && getDate(d1)) {
      d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
    }

    // If no exact data point found, interpolate values for smooth tracking (same as ActivityChart)
    if (!d && d0 && d1) {
      const t = (x0.valueOf() - getDate(d0).valueOf()) / (getDate(d1).valueOf() - getDate(d0).valueOf());
      d = { timestamp: x0.getTime() };

      // Interpolate values for each market
      marketsToShow.forEach(market => {
        const value0 = getValue(d0, market.market_id);
        const value1 = getValue(d1, market.market_id);
        if (value0 !== undefined && value1 !== undefined) {
          d[market.market_id] = value0 + (value1 - value0) * t;
        }
      });
    }

    if (d) {
      const xPos = xScale(getDate(d));
      const marketData = {};
      marketsToShow.forEach(market => {
        const value = getValue(d, market.market_id);
        if (value !== undefined) {
          marketData[market.market_id] = value;
        }
      });

      showTooltip({
        tooltipData: { ...d, marketData },
        tooltipLeft: xPos + margin.left,
        tooltipTop: margin.top + 20,
      });

      onHover && onHover(marketData);
    }
  };

  const handleMouseLeave = () => {
    hideTooltip();
    setMouseX(null);
    onHover && onHover(null);
  };

  if (!chartData.length || !marketsToShow.length) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center text-gray-500 text-xs">
        No data available
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* Y-axis grid lines (simplified for mini chart) */}
          <GridRows
            scale={yScale}
            width={innerWidth}
            stroke="rgba(197, 197, 197, 0.3)"
            strokeDasharray="2,4"
            tickValues={yAxisStats.ticks} // Use same ticks as Y-axis labels
          />

          {/* Draw lines for each market */}
          {marketsToShow.map((market, index) => {
           const color = isDarkMode
             ? CHART_COLORS1[index % CHART_COLORS1.length]
             : CHART_COLORS[index % CHART_COLORS.length];
            const lineData = chartData.filter(
              (d) => getValue(d, market.market_id) !== undefined
            );

            if (!lineData.length) return null;

            if (mouseX === null) {
              // Draw normal line when no mouse interaction
              return (
                <LinePath
                  key={market.market_id}
                  data={lineData}
                  x={(d) => xScale(getDate(d))}
                  y={(d) => yScale(getValue(d, market.market_id))}
                  stroke={color}
                  strokeWidth={2}
                  curve={curveStepAfter}
                />
              );
            } else {
              // Split line into two parts: before and after mouse position (same as ActivityChart)
              const mouseDate = xScale.invert(mouseX);
              // Find the two closest data points
              let leftIdx = 0;
              while (
                leftIdx < lineData.length - 1 &&
                getDate(lineData[leftIdx + 1]) <= mouseDate
              ) {
                leftIdx++;
              }
              const rightIdx = leftIdx + 1;
              const d0 = lineData[leftIdx];
              const d1 = lineData[rightIdx];
              // For step chart, intersection point is always at d0 (left point)
              let intersectionPoint = null;
              if (d0) {
                intersectionPoint = {
                  ...d0,
                  timestamp: mouseDate.getTime(),
                  [market.market_id]: getValue(d0, market.market_id),
                };
              }
              // Build before/after arrays
              const beforeMouse = lineData.filter(
                (d) => getDate(d) <= mouseDate
              );
              const afterMouse = lineData.filter(
                (d) => getDate(d) >= mouseDate
              );
              if (intersectionPoint) {
                if (
                  !beforeMouse.length ||
                  getDate(beforeMouse[beforeMouse.length - 1]) !== mouseDate
                ) {
                  beforeMouse.push(intersectionPoint);
                }
                if (
                  !afterMouse.length ||
                  getDate(afterMouse[0]) !== mouseDate
                ) {
                  afterMouse.unshift(intersectionPoint);
                }
              }
              return (
                <Group key={market.market_id}>
                  {/* Line before mouse (original color) */}
                  {beforeMouse.length > 1 && (
                    <LinePath
                      data={beforeMouse}
                      x={(d) => xScale(getDate(d))}
                      y={(d) => yScale(getValue(d, market.market_id))}
                      stroke={color}
                      strokeWidth={2}
                      curve={curveStepAfter}
                    />
                  )}
                  {/* Line after mouse (gray color) */}
                  {afterMouse.length > 1 && (
                    <LinePath
                      data={afterMouse}
                      x={(d) => xScale(getDate(d))}
                      y={(d) => yScale(getValue(d, market.market_id))}
                      stroke="rgba(128, 128, 128, 0.6)"
                      strokeWidth={2}
                      curve={curveStepAfter}
                    />
                  )}
                </Group>
              );
            }
          })}

          {/* Vertical line at mouse position */}
          {mouseX !== null && (
            <line
              x1={mouseX}
              y1={0}
              x2={mouseX}
              y2={innerHeight}
              stroke={isDarkMode ? "#FFFFFF" : "rgba(128, 128, 128, 0.6)"}
              strokeWidth={1}
              strokeDasharray="2,2"
              pointerEvents="none"
            />
          )}

          {/* Draw blinking dots at the end of each line - only show when not hovering */}
          {!mouseX &&
            marketsToShow.map((market, index) => {
             const color = isDarkMode
               ? CHART_COLORS1[index % CHART_COLORS1.length]
               : CHART_COLORS[index % CHART_COLORS.length];
              const lineData = chartData.filter(
                (d) => getValue(d, market.market_id) !== undefined
              );
              if (!lineData.length) return null;

              const lastPoint = lineData[lineData.length - 1];
              const x = xScale(getDate(lastPoint));
              const y = yScale(getValue(lastPoint, market.market_id));

              return (
                <Group key={`dot-${market.market_id}`}>
                  {/* Blinking outer circle - matches ActivityChart size */}
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={color}
                    fillOpacity="0.18"
                    className="animate-pulse"
                  />
                  {/* Solid center circle - matches ActivityChart size */}
                  <circle cx={x} cy={y} r="3" fill={color} />
                </Group>
              );
            })}

          {/* Hover dots for current mouse position - positioned on the vertical line (same as ActivityChart) */}
          {mouseX !== null &&
            tooltipData &&
            marketsToShow.map((market, index) => {
              const color = isDarkMode
                ? CHART_COLORS1[index % CHART_COLORS1.length]
                : CHART_COLORS[index % CHART_COLORS.length];
              const lineData = chartData.filter(
                (d) => getValue(d, market.market_id) !== undefined
              );
              if (!lineData.length) return null;

              // For step chart, always use the value of the left (previous) data point (same as ActivityChart)
              const mouseDate = xScale.invert(mouseX);
              let leftIdx = 0;
              while (
                leftIdx < lineData.length - 1 &&
                getDate(lineData[leftIdx + 1]) <= mouseDate
              ) {
                leftIdx++;
              }
              const d0 = lineData[leftIdx];
              if (!d0) return null;
              const value = getValue(d0, market.market_id);

              return (
                <Group key={`hover-dot-${market.market_id}`}>
                  {/* Blinking outer circle - same size as end dots */}
                  <circle
                    cx={mouseX}
                    cy={yScale(value)}
                    r="8"
                    fill={color}
                    fillOpacity="0.50"
                    className="animate-pulse"
                  />
                  {/* Solid center circle - same size as end dots */}
                  <circle cx={mouseX} cy={yScale(value)} r="3" fill={color} />
                </Group>
              );
            })}

          {/* X-axis (simplified) */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            numTicks={2} // Fewer ticks for mini chart
            stroke="rgba(197, 197, 197, 0.3)"
            tickStroke="#6b7280"
            tickLabelProps={{
              fill: "#6b7280",
              fontSize: 10,
              textAnchor: "middle",
            }}
            tickFormat={formatXTick}
          />

          {/* Y-axis (simplified) */}
          <AxisRight
            left={innerWidth}
            scale={yScale}
            tickValues={yAxisStats.ticks} // Show all ticks that correspond to grid lines
            stroke="transparent"
            tickStroke="transparent"
            tickLabelProps={{
              fill: "#6b7280",
              fontSize: 10,
              textAnchor: "start",
              dx: 4,
            }}
            tickFormat={(value) => `${value}%`}
          />

          {/* Interactive overlay */}
          <rect
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleTooltip}
            onMouseLeave={handleMouseLeave}
          />
        </Group>
      </svg>

      {/* Time Tooltip at top of vertical line */}
      {tooltipOpen &&
        tooltipData &&
        mouseX !== null &&
        (() => {
          const tooltipWidth = 120;
          const halfTooltipWidth = tooltipWidth / 2;

          // Calculate the absolute position of the vertical line
          const verticalLinePosition = mouseX + margin.left;

          // Calculate ideal centered position
          let tooltipLeft = verticalLinePosition - halfTooltipWidth;

          if (verticalLinePosition < margin.left + halfTooltipWidth) {
            tooltipLeft = margin.left;
          }
          // Stick to right edge if vertical line is too close to right boundary
          else if (
            verticalLinePosition >
            width - margin.right - halfTooltipWidth
          ) {
            tooltipLeft = width - margin.right - tooltipWidth;
          }

          return (
            <TooltipInPortal
              key={`time-tooltip-${tooltipData?.timestamp || "mini"}`}
              top={margin.top - 35}
              left={tooltipLeft - 10}
              style={{
                ...tooltipStyles,
                background: isDarkMode ? "#333333" : "#FFFFFF",
                color: isDarkMode ? "#FFFFFF" : "#000000",
                fontSize: "12px",
                padding: "6px 8px",
                textAlign: "center",
                whiteSpace: "nowrap",
                minWidth: "120px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <div>
                <strong>
                  {format(getDate(tooltipData), "MMM dd, yyyy HH:mm")}
                </strong>
              </div>
            </TooltipInPortal>
          );
        })()}

      {/* Individual tooltips for each market data point */}
      {tooltipOpen &&
        tooltipData &&
        (() => {
          // For each market, use the same step logic as the hover dot: always use the left data point (d0)
          const marketPoints = marketsToShow
            .map((market, index) => {
              const mouseDate = mouseX !== null ? xScale.invert(mouseX) : null;
              const lineData = chartData.filter(
                (d) => getValue(d, market.market_id) !== undefined
              );
              let leftIdx = 0;
              while (
                mouseDate &&
                leftIdx < lineData.length - 1 &&
                getDate(lineData[leftIdx + 1]) <= mouseDate
              ) {
                leftIdx++;
              }
              const d0 = lineData[leftIdx];
              let value = d0 ? getValue(d0, market.market_id) : null;
             const color = isDarkMode
               ? CHART_COLORS1[index % CHART_COLORS1.length]
               : CHART_COLORS[index % CHART_COLORS.length];
              const yPosition = yScale(value);
              return {
                market,
                value,
                color,
                yPosition,
                index,
              };
            })
            .filter((point) => point.value !== null);

          // Sort by y position to handle overlapping
          marketPoints.sort((a, b) => a.yPosition - b.yPosition);

          // Adjust positions to prevent overlapping (minimum 20px spacing)
          const minSpacing = 20;
          const tooltipPadding = 12;
          const minY = Math.max(tooltipPadding, 0);
          const maxY = Math.max(minY, innerHeight - tooltipPadding);

          for (let i = 0; i < marketPoints.length; i++) {
            marketPoints[i].yPosition = Math.min(
              Math.max(marketPoints[i].yPosition, minY),
              maxY
            );
            if (
              i > 0 &&
              marketPoints[i].yPosition - marketPoints[i - 1].yPosition <
                minSpacing
            ) {
              marketPoints[i].yPosition = Math.min(
                maxY,
                marketPoints[i - 1].yPosition + minSpacing
              );
            }
          }

          for (let i = marketPoints.length - 2; i >= 0; i--) {
            if (
              marketPoints[i + 1].yPosition - marketPoints[i].yPosition <
              minSpacing
            ) {
              marketPoints[i].yPosition = Math.max(
                minY,
                marketPoints[i + 1].yPosition - minSpacing
              );
            }
          }

          return marketPoints.map((point) => (
            <TooltipInPortal
              key={`market-tooltip-${point.market.market_id}`}
              top={point.yPosition - 10}
              left={mouseX + margin.left}
              style={{
                ...tooltipStyles,
                background: point.color,
                color: "#000",
                fontSize: "11px",
                padding: "3px 6px",
                borderRadius: "4px",
                textAlign: "left",
                minWidth: "auto",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>
                  {marketsToShow.length > 1
                    ? point.market.market_name || `Market ${point.index + 1}`
                    : "Yes"}
                </span>
                <span style={{ marginLeft: "0px" }}>
                  {Math.round(point.value)}%
                </span>
              </div>
            </TooltipInPortal>
          ));
        })()}
    </div>
  );
};

// Custom legend component for sub-markets (simplified for mini chart - max 2 markets)
const CustomChartLegendMini = ({ markets, chartData, colors, hoveredData }) => {
  if (!markets || markets.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      {markets.map((market, index) => { // Show all markets (max 2)
        const color = isDarkMode
          ? CHART_COLORS1[index % CHART_COLORS1.length]
          : CHART_COLORS[index % CHART_COLORS.length];
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
              className="w-1.5 h-1.5 rounded-full mr-1"
              style={{ backgroundColor: color }}
            ></span>
            <span style={{ color: color, fontSize: '10px' }}>
              {marketName.length > 8 ? marketName.substring(0, 8) + '...' : marketName}
              {valueText && <span className="ml-1">{valueText}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Debounced ParentSize wrapper for smoother transitions
const DebouncedParentSizeMini = ({ children, debounceMs = 50 }) => {
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
        updateDimensions(width, height);
        return children(dimensions);
      }}
    </ParentSize>
  );
};

const ActivityChartMiniVisx = ({
  eventData,
  timeFrame = '1w'
}) => {
  const [hoveredProbability, setHoveredProbability] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === 'dark';

  // Process event data to extract probability data for multiple markets
  const marketsData = useMemo(() => {
    if (!eventData) return [];

    // Handle trending API format: probabilityGraph.markets (not marketsData)
    if (eventData?.probabilityGraph?.markets?.length) {
      return eventData.probabilityGraph.markets.map((market, index) => {
        // Find the corresponding sub_market to get start_date
        const subMarket = eventData.sub_markets?.find(sm => sm._id === market.id);
        const startDate = subMarket?.start_date ? new Date(subMarket.start_date) : null;

        // Handle trending API format: market.history array
        const marketData = market.history || [];

        return {
          market_id: market.id, // Use 'id' from trending API
          market_name: market.name, // Use 'name' from trending API
           color : isDarkMode
  ? CHART_COLORS1[index % CHART_COLORS1.length]
  : CHART_COLORS[index % CHART_COLORS.length],
          start_date: startDate,
          data: marketData
            .filter(item => {
              // Filter out data points before the market's start date
              const timestamp = item.t * 1000; // Trending API uses 't' (unix timestamp)
              const itemDate = new Date(timestamp);
              return !startDate || itemDate >= startDate;
            })
            .map(item => ({
              timestamp: item.t * 1000, // Convert unix timestamp to milliseconds
              probability: parseFloat(item.p) || 50, // Use 'p' from trending API
            }))
        };
      });
    }

    // Fallback: Handle legacy format if marketsData exists
    if (eventData?.probabilityGraph?.marketsData?.length) {
      return eventData.probabilityGraph.marketsData.map((market, index) => {
        // Find the corresponding sub_market to get start_date
        const subMarket = eventData.sub_markets?.find(sm => sm._id === (market.id || market.market_id));
        const startDate = subMarket?.start_date ? new Date(subMarket.start_date) : null;

        // Handle both old and new data formats
        const marketData = market.history || market.data || [];

        return {
          market_id: market.id || market.market_id, // Handle both 'id' and 'market_id'
          market_name: market.name || market.market_name, // Handle both 'name' and 'market_name'
          color:  isDarkMode
  ? CHART_COLORS1[index % CHART_COLORS1.length]
  : CHART_COLORS[index % CHART_COLORS.length],
          start_date: startDate,
          data: marketData
            .filter(item => {
              // Filter out data points before the market's start date
              const timestamp = item.t ? item.t * 1000 : new Date(item.time).getTime(); // Handle both 't' (unix) and 'time' formats
              const itemDate = new Date(timestamp);
              return !startDate || itemDate >= startDate;
            })
            .map(item => ({
              timestamp: item.t ? item.t * 1000 : new Date(item.time).getTime(), // Handle both 't' (unix) and 'time' formats
              probability: parseFloat(item.p || item.probability) || 50, // Handle both 'p' and 'probability'
            }))
        };
      });
    }

    // Final fallback: Create synthetic data from current market prices if no historical data
    if (eventData?.sub_markets?.length && !eventData?.probabilityGraph) {
      console.log('ActivityChartMiniVisx - No probability graph, checking for actual trading data');

      // Only create synthetic data if there's actual trading data (lastTradedSide1Price is not null)
      const hasAnyTradingData = eventData.sub_markets.some(sm => sm.lastTradedSide1Price !== null);

      if (!hasAnyTradingData) {
        console.log('ActivityChartMiniVisx - No trading data available, returning empty data');
        return [];
      }

      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);

      // Sort sub_markets by lastTradedSide1Price (descending) and take top 2
      const sortedSubMarkets = eventData.sub_markets
        .filter(submarket => submarket.lastTradedSide1Price !== null) // Only include markets with actual trading
        .map(submarket => ({
          ...submarket,
          currentPrice: submarket.lastTradedSide1Price
        }))
        .sort((a, b) => b.currentPrice - a.currentPrice)
        .slice(0, 2);

      return sortedSubMarkets.map((submarket, index) => {
        return {
          market_id: submarket._id,
          market_name: submarket.name,
          color: isDarkMode
  ? CHART_COLORS1[index % CHART_COLORS1.length]
  : CHART_COLORS[index % CHART_COLORS.length],
          start_date: submarket.start_date ? new Date(submarket.start_date) : null,
          data: [
            {
              timestamp: oneHourAgo,
              probability: submarket.currentPrice
            },
            {
              timestamp: now,
              probability: submarket.currentPrice
            }
          ]
        };
      });
    }

    return [];
  }, [eventData]);

  // Filter data based on timeFrame
  const filteredMarketsData = useMemo(() => {
    if (!marketsData.length) return [];

    const now = new Date();
    let cutoffTime;

    switch (timeFrame) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '1d':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1w':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        return marketsData;
    }

    return marketsData.map(market => ({
      ...market,
      data: market.data.filter(item => item.timestamp >= cutoffTime.getTime())
    })).filter(market => market.data.length > 0);
  }, [marketsData, timeFrame]);

  // Combine all unique timestamps from all markets for x-axis
  const chartData = useMemo(() => {
    if (!filteredMarketsData.length) return [];

    const allTimestamps = new Set();
    filteredMarketsData.forEach(market => {
      market.data.forEach(dataPoint => {
        allTimestamps.add(dataPoint.timestamp);
      });
    });

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    const result = sortedTimestamps.map(timestamp => {
      const dataPoint = { timestamp };

      filteredMarketsData.forEach(market => {
        const marketData = market.data.find(d => d.timestamp === timestamp);
        if (marketData) {
          dataPoint[market.market_id] = marketData.probability;
          dataPoint[`${market.market_id}_name`] = market.market_name;
        }
      });

      return dataPoint;
    });

    console.log('ActivityChartMiniVisx - Chart data:', result.slice(0, 3)); // Log first 3 items
    return result;
  }, [filteredMarketsData]);

  // Calculate dynamic Y-axis domain and ticks
  const yAxisStats = useMemo(() => {
    if (!chartData.length) return { min: 0, max: 100, ticks: [0, 50, 100] };

    let min = Infinity;
    let max = -Infinity;

    chartData.forEach(point => {
      Object.keys(point).forEach(key => {
        if (key !== 'timestamp' && !key.endsWith('_name')) {
          const val = point[key];
          if (typeof val === 'number' && !isNaN(val)) {
            min = Math.min(min, val);
            max = Math.max(max, val);
          }
        }
      });
    });

    if (!isFinite(min) || !isFinite(max)) {
      return { min: 0, max: 100, ticks: [0, 50, 100] };
    }

    const range = max - min;
    let pad = Math.max(range * 0.1, 2);

    let yMin = Math.floor((min - pad) / 5) * 5;
    let yMax = Math.ceil((max + pad) / 5) * 5;

    if (yMin < 0) yMin = 0;
    if (yMax > 100) yMax = 100;

    // Simplified ticks for mini chart
    const ticks = [yMin, Math.round((yMin + yMax) / 2), yMax];

    return { min: yMin, max: yMax, ticks };
  }, [chartData]);

  // Limit to displaying only the top 2 markets by current percentage
  const marketsToShow = useMemo(() => {
    if (!filteredMarketsData.length || !chartData.length) return [];

    // Get the latest data point to determine current percentages
    const latestDataPoint = chartData[chartData.length - 1];

    // Create array of markets with their current percentages
    const marketsWithPercentages = filteredMarketsData.map(market => {
      const currentValue = latestDataPoint?.[market.market_id] || market.data[market.data.length - 1]?.probability || 50;
      return {
        ...market,
        currentPercentage: currentValue
      };
    });

    // Sort by current percentage (descending) and take top 2
    return marketsWithPercentages
      .sort((a, b) => b.currentPercentage - a.currentPercentage)
      .slice(0, 2);
  }, [filteredMarketsData, chartData]);

  // Check if we have valid data to display
  const hasData = useMemo(() => {
    const hasMarketsToShow = marketsToShow.length > 0;
    const hasChartData = chartData.length > 0;
    console.log('ActivityChartMiniVisx - Data check (top 2 markets):', {
      hasMarketsToShow,
      marketsCount: marketsToShow.length,
      hasChartData,
      chartDataLength: chartData.length,
      eventId: eventData?._id,
      hasProbabilityGraph: !!eventData?.probabilityGraph,
      marketsInGraph: eventData?.probabilityGraph?.markets?.length || 0,
      topMarkets: marketsToShow.map(m => ({ name: m.market_name, percentage: m.currentPercentage }))
    });

    return hasMarketsToShow && hasChartData;
  }, [marketsToShow, chartData, eventData]);
  // console.log('hasData :>> ', hasData);
  // Find the most recent probability value for display (from first market)
  const currentValue = useMemo(() => {
    if (hoveredProbability !== null) {
      return Math.round(hoveredProbability);
    }

    // Check if we have actual trading data
    const hasActualTradingData = eventData?.sub_markets?.[0]?.lastTradedSide1Price !== null;

    if (!marketsToShow.length || !chartData.length || !hasActualTradingData) return null;

    const firstMarket = marketsToShow[0];
    const latestDataPoint = chartData[chartData.length - 1];
    const value = latestDataPoint?.[firstMarket.market_id];

    return value !== undefined && value !== null ? Math.round(value) : null;
  }, [marketsToShow, chartData, hoveredProbability, eventData]);

  // Calculate percentage change for the first market
  const percentageChange = useMemo(() => {
    if (!marketsToShow.length || !chartData.length || chartData.length < 2) {
      return null;
    }

    const firstMarket = marketsToShow[0];

    // Get start value based on timeframe
    let startIndex = 0;
    if (timeFrame !== 'all' && chartData.length > 0) {
      const now = new Date();
      let cutoffTime;

      switch (timeFrame) {
        case '1h': cutoffTime = new Date(now.getTime() - 1 * 60 * 60 * 1000); break;
        case '1d': cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
        case '1w': cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
        case '1m': cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
        default: break;
      }

      for (let i = 0; i < chartData.length; i++) {
        if (new Date(chartData[i].timestamp) >= cutoffTime) {
          startIndex = i;
          break;
        }
      }
    }

    // Get start and end values
    const startValue = chartData[startIndex]?.[firstMarket.market_id];
    const endValue = hoveredProbability !== null
      ? hoveredProbability
      : chartData[chartData.length - 1]?.[firstMarket.market_id];

    if (startValue === undefined || endValue === undefined) {
      return null;
    }

    // Calculate change
    const change = endValue - startValue;
    const changePercent = Math.abs(change).toFixed(1);
    const isUp = change >= 0;

    return { changePercent, isUp };
  }, [marketsToShow, chartData, hoveredProbability, timeFrame]);

  return (
    <div className=" h-full w-full">
      {/* Current value display - positioned at top */}
      <div className="px-2 pt-1 pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {/* For multi-market events, show market names with percentages (top 2 only) */}
            {eventData?.has_sub_markets && marketsToShow.length > 1 ? (
              <div className="flex flex-wrap items-center gap-2">
                {marketsToShow.map((market, index) => {
                 const color = isDarkMode
                   ? CHART_COLORS1[index % CHART_COLORS1.length]
                   : CHART_COLORS[index % CHART_COLORS.length];
                  const marketId = market.market_id;

                  // Use hoveredData if available, otherwise use the latest data point
                  let currentMarketValue = null;
                  if (hoveredData && hoveredData[marketId] !== undefined) {
                    currentMarketValue = Math.round(hoveredData[marketId]);
                  } else if (chartData && chartData.length > 0) {
                    const latestDataPoint = chartData[chartData.length - 1];
                    const value = latestDataPoint && latestDataPoint[marketId];
                    if (typeof value === "number" && !isNaN(value)) {
                      currentMarketValue = Math.round(value);
                    }
                  }

                  // Check if there's actual trading data for this market
                  const subMarket = eventData?.sub_markets?.find(sm => sm._id === marketId);
                  const hasActualTradingData = subMarket?.lastTradedSide1Price !== null;

                  if (!hasActualTradingData) {
                    currentMarketValue = null;
                  }

                  return (
                    <div key={marketId} className="flex items-center">
                      <span
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: color }}
                      ></span>
                      <span
                        style={{
                          color: color,
                          fontSize: "12px",
                          fontWeight: "400",
                        }}
                      >
                        {market.market_name}:{" "}
                        {currentMarketValue !== null
                          ? `${currentMarketValue}%`
                          : "--"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              // For single market events, show "Chance" as before
              <>
                <span
                  className="text-[22px] font-semibold"
                  style={{ color: isDarkMode ? "#e8d6ff" : "#4169E1" }}
                >
                  {currentValue !== null ? `${currentValue}%` : "--"}
                  <span
                    className="text-sm ml-1 "
                    style={{ color: isDarkMode ? "#e8d6ff" : "#4169E1" }}
                  >
                    Chance
                  </span>
                </span>

                {/* Percentage change indicator */}
                {percentageChange && (
                  <span className="ml-2 text-sm mt-1.5">
                    <span
                      className={`${
                        percentageChange.isUp
                          ? "text-[#009689]"
                          : "text-[#8D1F17]"
                      } font-normal`}
                    >
                      {percentageChange.isUp ? "▲" : "▼"}{" "}
                      {percentageChange.changePercent}%
                    </span>
                  </span>
                )}
              </>
            )}
          </div>

          {/* Legend for multi-market events - not needed since we show market names inline for top 2 */}
        </div>
      </div>

      {/* Chart */}
      {!hasData ? (
        <div className="h-full w-full flex items-center justify-center text-gray-500 text-xs">
          <div className="text-center">
            <div>No chart data available</div>
          </div>
        </div>
      ) : (
        <div style={{ height: "calc(100% - 50px)", width: "100%" }}>
          <DebouncedParentSizeMini>
            {({ width, height }) => (
              <VisxChartMini
                width={width}
                height={height}
                chartData={chartData}
                marketsToShow={marketsToShow}
                yAxisStats={yAxisStats}
                timeFrame={timeFrame}
                isDarkMode={isDarkMode}
                onHover={(data) => {
                  setHoveredData(data);
                  if (data && marketsToShow.length > 0) {
                    const firstMarketValue = data[marketsToShow[0].market_id];
                    setHoveredProbability(firstMarketValue);
                  } else {
                    setHoveredProbability(null);
                  }
                }}
                hoveredData={hoveredData}
              />
            )}
          </DebouncedParentSizeMini>
        </div>
      )}
    </div>
  );
};

export default ActivityChartMiniVisx;





 