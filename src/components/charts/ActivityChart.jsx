import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { curveCardinal, curveStepAfter } from '@visx/curve';
import { GridRows } from '@visx/grid';
import { AxisBottom, AxisRight } from '@visx/axis';
import { ParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { bisector } from 'd3-array';
import { format } from 'date-fns';
import { isDarkColor } from '../../utils/colorExtractor';

// Define colors for up to 4 market lines
const CHART_COLORS = ["#298C8C", "#e71e8dff", "#EF6A40", "#0167C6"];
const CHART_COLORS1 = ["#ffffffff", "#8940EF", "#e4e71eff", "#40A9EF"];


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

// NEW: Visx Chart Component
const VisxChart = ({ 
  width, 
  height, 
  chartData, 
  marketsToShow, 
  yAxisStats, 
  timeFrame, 
  isDarkMode,
  onHover,
  hoveredData,
  marketMeta, // meta: { [market_id]: { startMs?: number, resolutionTarget?: 0|100, resolutionTimeMs?: number } }
  seriesByMarketId // { [market_id]: Array<{ timestamp: number, value: number, a: boolean }> }
}) => {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  // State for mouse position to create the gray overlay effect
  const [mouseX, setMouseX] = useState(null);

  // Margins - responsive based on width
  const margin = { 
    top: 10, 
    right: 60,
    bottom: 60, // add a bit of room under x-axis
    left: 14 // Reduced left margin for tighter alignment
  };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  // Scales
  const xScale = useMemo(() => {
    const now = Date.now();
    const byTimeframe = (tf) => {
      switch (tf) {
        case '1h': return [new Date(now - 1 * 60 * 60 * 1000), new Date(now)];
        case '1d': return [new Date(now - 24 * 60 * 60 * 1000), new Date(now)];
        case '1w': return [new Date(now - 7 * 24 * 60 * 60 * 1000), new Date(now)];
        case '1m': return [new Date(now - 30 * 24 * 60 * 60 * 1000), new Date(now)];
        default: return null;
      }
    };

    let domain = byTimeframe(timeFrame);
    if (!domain) {
      // 'all' or unknown -> derive from data
      if (!chartData.length) return scaleTime({ range: [0, innerWidth] });
      domain = [
        Math.min(...chartData.map(d => getDate(d))),
        Math.max(...chartData.map(d => getDate(d)))
      ];
    }
    return scaleTime({
      range: [0, innerWidth],
      domain,
    });
  }, [chartData, innerWidth, timeFrame]);

  const yScale = useMemo(() => {
    // Add a small visual padding below zero so lines don't sit on the x-axis
    const padPct = 0.1; // 3% of visible range
    const visualPad = Math.max(2, (yAxisStats.max - yAxisStats.min) * padPct);
    // Allow domain min to go slightly below 0 to create the gap
    const domainMin = Math.max(-10, 0 - visualPad);
    return scaleLinear({
      range: [innerHeight, 0],
      domain: [domainMin, yAxisStats.max],
      nice: false,
    });
  }, [innerHeight, yAxisStats]);

  // Format tick values for x-axis
  const formatXTick = (value) => {
    const tickTime = new Date(value);
    if (timeFrame === '1h' || timeFrame === '1d') {
      return format(tickTime, 'HH:mm');
    } else if (timeFrame === '1w') {
      return format(tickTime, 'eee');
    }
    return format(tickTime, 'MMM dd');
  };

  // Always render exactly 5 x-axis ticks, inset from edges to avoid clipping
  const xTickValues = useMemo(() => {
    const domain = xScale?.domain?.();
    if (!domain || !domain[0] || !domain[1]) return [];
    const startMs = domain[0]?.getTime?.() ?? Number(domain[0]);
    const endMs = domain[1]?.getTime?.() ?? Number(domain[1]);
    if (!isFinite(startMs) || !isFinite(endMs) || endMs <= startMs) return [];
    const fractions = [0.1, 0.3, 0.5, 0.7, 0.9];
    return fractions.map(f => new Date(startMs + ((endMs - startMs) * f)));
  }, [xScale]);

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

    // If no exact data point found, interpolate values for smooth tracking
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
      showTooltip({
        tooltipData: d,
        tooltipLeft: adjustedX,
        tooltipTop: 0, // Position at top for time tooltip
      });
      onHover && onHover(d);
    }
  };

  const handleMouseLeave = () => {
    hideTooltip();
    setMouseX(null); // Clear mouse position
    onHover && onHover(null);
  };

  if (!chartData.length || !marketsToShow.length) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg 
        width={width} 
        height={height}
      >
        <Group left={margin.left} top={margin.top}>
          {/* Y-axis grid lines (dotted) */}
          <GridRows
            scale={yScale}
            width={innerWidth}
            stroke="rgba(197, 197, 197, 0.3)"
            strokeDasharray="2,4"
            // Only draw grid lines for all but the last tick to avoid overlap with x-axis
            tickValues={yAxisStats.ticks.slice(1, 5)}
          />

          {/* Pre-start dotted 0% baselines for each market */}
          {marketsToShow.map((market, index) => {
            const meta = marketMeta?.[market.market_id];
            if (!meta?.startMs) return null;
            const domain = xScale.domain();
            const domainStart = domain[0]?.getTime?.() ?? Number(domain[0]);
            const domainEnd = domain[1]?.getTime?.() ?? Number(domain[1]);
            const start = meta.startMs;
            // draw only if start is inside (domainStart, domainEnd] and domainStart < start
            if (!isFinite(domainStart) || !isFinite(start) || start <= domainStart) return null;
            const x1 = xScale(new Date(domainStart));
            const x2 = xScale(new Date(Math.min(start, domainEnd)));
            if (!(x2 > x1)) return null;
const color = isDarkMode
  ? CHART_COLORS1[index % CHART_COLORS1.length]
  : CHART_COLORS[index % CHART_COLORS.length];

      return (
              <line
                key={`prestart-${market.market_id}`}
                x1={x1}
        y1={yScale(0)}
                x2={x2}
        y2={yScale(0)}
                stroke={color}
                strokeOpacity={0.55}
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Draw lines for each market */}
          {marketsToShow.map((market, index) => {
           const color = isDarkMode
             ? CHART_COLORS1[index % CHART_COLORS1.length]
             : CHART_COLORS[index % CHART_COLORS.length];
            const series = seriesByMarketId?.[market.market_id] || [];

            // Clip the series to the current x-domain and insert boundary points for correct styling at edges
            const clipToDomain = (arr) => {
              if (!arr || arr.length === 0) return [];
              const [dStart, dEnd] = xScale.domain();
              const startMs = dStart?.getTime?.() ?? Number(dStart);
              const endMs = dEnd?.getTime?.() ?? Number(dEnd);
              if (!isFinite(startMs) || !isFinite(endMs)) return arr;

              const inside = arr.filter(pt => pt.timestamp >= startMs && pt.timestamp <= endMs);
              // find last point before start and first after start
              const before = [...arr].filter(pt => pt.timestamp < startMs);
              const lastBefore = before.length ? before[before.length - 1] : null;
              const afterStart = arr.find(pt => pt.timestamp >= startMs);
              if (lastBefore && afterStart && (!inside.length || inside[0].timestamp !== startMs)) {
                inside.unshift({ timestamp: startMs, value: lastBefore.value, a: lastBefore.a });
              }
              // append boundary at end if needed
              const lastInside = inside.length ? inside[inside.length - 1] : null;
              const afterEnd = arr.find(pt => pt.timestamp > endMs);
              if (lastInside && lastInside.timestamp < endMs) {
                inside.push({ timestamp: endMs, value: lastInside.value, a: lastInside.a });
              } else if (!lastInside && afterEnd) {
                // no points inside but there is a point after; create flat segment at start->start (no visible line)
                inside.push({ timestamp: startMs, value: afterEnd.value, a: afterEnd.a });
              }
              return inside;
            };

            // Helper to split a series into runs where a segment is SOLID only if BOTH endpoints have a!==false.
            // This guarantees dotted styling starts exactly at both transitions (true→false and false→true) and covers all spans with any 'a=false'.
            const splitRuns = (arr) => {
              if (!arr || arr.length < 2) return [];
              const runs = [];
              const segSolid = (l, r) => (l?.a !== false) && (r?.a !== false);
              let currentSolid = segSolid(arr[0], arr[1]);
              let points = [arr[0], arr[1]];
              for (let i = 2; i < arr.length; i++) {
                const solid = segSolid(arr[i - 1], arr[i]);
                if (solid === currentSolid) {
                  points.push(arr[i]);
                } else {
                  runs.push({ a: currentSolid, points });
                  points = [arr[i - 1], arr[i]];
                  currentSolid = solid;
                }
              }
              runs.push({ a: currentSolid, points });
              return runs;
            };

            const clippedSeries = clipToDomain(series);
            if (mouseX === null) {
              const runs = splitRuns(clippedSeries);
              return (
                <g key={market.market_id}>
                  {runs.map((run, i) => (
                    <LinePath
                      key={`${market.market_id}-run-${i}`}
                      data={run.points}
                      x={(d) => xScale(new Date(d.timestamp))}
                      y={(d) => yScale(d.value)}
                      stroke={color}
                      strokeWidth={2}
                      strokeOpacity={run.a ? 1 : 0.5}
                      strokeDasharray={run.a ? undefined : '4,4'}
                      curve={curveStepAfter}
                    />
                  ))}
                </g>
              );
            } else {
              const mouseDate = xScale.invert(mouseX);
              // Find left index in series
              let leftIdx = 0;
              while (leftIdx < clippedSeries.length - 1 && new Date(clippedSeries[leftIdx + 1].timestamp) <= mouseDate) {
                leftIdx++;
              }
              const d0 = clippedSeries[leftIdx];
              const d1 = clippedSeries[leftIdx + 1];
              const intersection = d0
                ? { timestamp: mouseDate.getTime(), value: d0.value, a: d0.a }
                : null;
              const before = clippedSeries.filter(pt => new Date(pt.timestamp) <= mouseDate);
              const after = clippedSeries.filter(pt => new Date(pt.timestamp) >= mouseDate);
              if (intersection) {
                if (!before.length || before[before.length - 1].timestamp !== intersection.timestamp) before.push(intersection);
                if (!after.length || after[0].timestamp !== intersection.timestamp) after.unshift(intersection);
              }
              const runsBefore = splitRuns(before);
              const runsAfter = splitRuns(after);
              return (
                <g key={market.market_id}>
                  {runsBefore.map((run, i) => (
                    <LinePath
                      key={`${market.market_id}-before-${i}`}
                      data={run.points}
                      x={(d) => xScale(new Date(d.timestamp))}
                      y={(d) => yScale(d.value)}
                      stroke={color}
                      strokeWidth={2}
                      strokeOpacity={run.a ? 1 : 0.5}
                      strokeDasharray={run.a ? undefined : '4,4'}
                      curve={curveStepAfter}
                    />
                  ))}
                  {runsAfter.map((run, i) => (
                    <LinePath
                      key={`${market.market_id}-after-${i}`}
                      data={run.points}
                      x={(d) => xScale(new Date(d.timestamp))}
                      y={(d) => yScale(d.value)}
                      stroke={'rgba(128, 128, 128, 0.6)'}
                      strokeWidth={2}
                      strokeOpacity={run.a ? 0.6 : 0.5}
                      strokeDasharray={run.a ? undefined : '4,4'}
                      curve={curveStepAfter}
                    />
                  ))}
                </g>
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
              stroke="rgba(128, 128, 128, 0.6)"
              strokeWidth={1}
              strokeDasharray="2,2"
              pointerEvents="none"
            />
          )}

          {/* Draw blinking dots at the end of each line - only show when not hovering and last 'a' is not false */}
          {!mouseX && marketsToShow.map((market, index) => {
            const color = isDarkMode
              ? CHART_COLORS1[index % CHART_COLORS1.length]
              : CHART_COLORS[index % CHART_COLORS.length];
            const lineData = chartData.filter(d => getValue(d, market.market_id) !== undefined);
            if (!lineData.length) return null;

            // Prefer the last point inside the current x-domain
            const domain = xScale.domain();
            const startMs = domain[0]?.getTime?.() ?? Number(domain[0]);
            const endMs = domain[1]?.getTime?.() ?? Number(domain[1]);
            const visible = lineData.filter(d => {
              const t = new Date(d.timestamp).getTime();
              return (!isNaN(t)) && t >= startMs && t <= endMs;
            });
            const lastPoint = (visible.length ? visible[visible.length - 1] : lineData[lineData.length - 1]);
            if (!lastPoint) return null;

            const lastA = lastPoint[`${market.market_id}_a`];
            if (lastA === false) return null; // hide dot when last point is inactive

            const x = xScale(getDate(lastPoint));
            const y = yScale(getValue(lastPoint, market.market_id));

            return (
              <g key={`dot-${market.market_id}`}>
                {/* Blinking outer circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill={color}
                  fillOpacity={0.18}
                  className="animate-pulse"
                />
                {/* Solid center circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={4.5}
                  fill={color}
                />
              </g>
            );
          })}

          {/* Hover dots - positioned on the vertical line */}
          {mouseX !== null && tooltipData && marketsToShow.map((market, index) => {
            // For step chart, always use the value of the left (previous) data point
            const mouseDate = xScale.invert(mouseX);
            const lineData = chartData.filter(d => getValue(d, market.market_id) !== undefined);
            let leftIdx = 0;
            while (leftIdx < lineData.length - 1 && getDate(lineData[leftIdx + 1]) <= mouseDate) {
              leftIdx++;
            }
            const d0 = lineData[leftIdx];
            if (!d0) return null;
            const value = getValue(d0, market.market_id);
            const color = isDarkMode
              ? CHART_COLORS1[index % CHART_COLORS1.length]
              : CHART_COLORS[index % CHART_COLORS.length];
            return (
              <g key={`hover-dot-${market.market_id}`}>
                {/* Blinking outer circle - same size as end dots */}
                <circle
                  cx={mouseX}
                  cy={yScale(value)}
                  r={12}
                  fill={color}
                  fillOpacity={0.50}
                  className="animate-pulse"
                />
                {/* Solid center circle - same size as end dots */}
                <circle
                  cx={mouseX}
                  cy={yScale(value)}
                  r={4.5}
                  fill={color}
                />
              </g>
            );
          })}

          {/* X-axis */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            tickValues={xTickValues}
            stroke="rgba(197, 197, 197, 0.3)"
            tickStroke="#6b7280"
            tickLabelProps={{
              fill: '#6b7280',
              fontSize: 12,
              textAnchor: 'middle',
            }}
            tickFormat={formatXTick}
          />

          {/* Y-axis */}
          <AxisRight
            left={innerWidth}
            scale={yScale}
            tickValues={yAxisStats.ticks}
            stroke="transparent"
            tickStroke="transparent"
            tickLabelProps={{
              fill: '#6b7280',
              fontSize: 12,
              textAnchor: 'start',
              dx: 8,
            }}
            tickFormat={(value) => `${value}%`}
          />

          {/* Invisible overlay for mouse events */}
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
    {tooltipOpen && tooltipData && mouseX !== null && (
      (() => {
        const tooltipWidth = 120;
        const halfTooltipWidth = tooltipWidth / 2;
        
        // Calculate the absolute position of the vertical line
        const verticalLinePosition = mouseX + margin.left;
        
        // Calculate ideal centered position
        let tooltipLeft = verticalLinePosition - halfTooltipWidth;
        
        if (verticalLinePosition < margin.left + halfTooltipWidth) {
          tooltipLeft = margin.left; // 10px offset from left edge
        }
        // Stick to right edge if vertical line is too close to right boundary  
        else if (verticalLinePosition > width - margin.right - halfTooltipWidth) {
          tooltipLeft = width - margin.right - tooltipWidth; // 10px offset from right edge
        }
        
        return (
          <TooltipWithBounds
            key={`time-tooltip-${Math.random()}`}
            top={margin.top - 35} // shifted 20px further up
            left={tooltipLeft - 10}
            style={{
              ...tooltipStyles,
              background: isDarkMode ? '#333333' : '#FFFFFF',
              color: isDarkMode ? '#FFFFFF' : '#000000',
              fontSize: '12px',
              padding: '6px 8px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              minWidth: '120px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              zIndex: 10,
            }}
          >
            <div>
              <strong>
                {format(getDate(tooltipData), 'MMM dd, yyyy HH:mm')}
              </strong>
            </div>
          </TooltipWithBounds>
        );
      })()
    )}

      {/* Individual tooltips for each market data point */}
      {tooltipOpen && tooltipData && (() => {
        // For each market, use the same step logic as the hover dot: always use the left data point (d0)
        const marketPoints = marketsToShow.map((market, index) => {
          const mouseDate = mouseX !== null ? xScale.invert(mouseX) : null;
          const lineData = chartData.filter(d => getValue(d, market.market_id) !== undefined);
          let leftIdx = 0;
          while (mouseDate && leftIdx < lineData.length - 1 && getDate(lineData[leftIdx + 1]) <= mouseDate) {
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
            index
          };
        }).filter(point => point.value !== null);

        // Sort by y position to handle overlapping
        marketPoints.sort((a, b) => a.yPosition - b.yPosition);

        // Adjust positions to prevent overlapping (minimum 20px spacing)
        const minSpacing = 20;
        for (let i = 1; i < marketPoints.length; i++) {
          if (marketPoints[i].yPosition - marketPoints[i-1].yPosition < minSpacing) {
            marketPoints[i].yPosition = marketPoints[i-1].yPosition + minSpacing;
          }
        }

        return marketPoints.map((point) => (
          <TooltipWithBounds
            key={`market-tooltip-${point.market.market_id}`}
            top={point.yPosition - 10} // shifted tooltip 18px upward
            left={mouseX + margin.left}
            style={{
              ...tooltipStyles,
              background: point.color,
              color: '#080808ff',
              fontSize: '11px',
              padding: '3px 6px',
              borderRadius: '4px',
              textAlign: 'left',
              minWidth: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>
{marketsToShow.length > 1
  ? (point.market.market_name || `Market ${point.index + 1}`)
  : 'Yes'}
              </span>
              <span style={{ marginLeft: '0px' }}>{Math.round(point.value)}%</span>
            </div>
          </TooltipWithBounds>
        ));
      })()}
    </div>
  );
};
const CustomChartLegend = ({ markets, chartData, colors, hoveredData }) => {
  if (!markets || markets.length === 0) {
    return <div style={{ minHeight: '28px' }}>&nbsp;</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:gap-x-4 sm:gap-y-2">
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
        } else if (chartData.length > 0) {
          const latestDataPoint = chartData[chartData.length - 1];
          const value = latestDataPoint[marketId];
          if (typeof value === 'number' && !isNaN(value)) {
            valueText = `${Math.round(value)}%`;
          }
        }

        const marketName = market.market_name || `Market ${index + 1}`;

        return (
          <div key={marketId} className="flex items-center text-sm">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: color }}
            ></span>
            <span style={{ color: color }}>
              {marketName}
              {valueText && <span className="ml-1.5">{valueText}</span>}
            </span>
          </div>
        );
      })}
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
        // Update dimensions with debounce
        updateDimensions(width || 800, height || 300);
        
        // Use current dimensions or fallback to new ones
        return children({
          width: dimensions.width || width || 800,
          height: dimensions.height || height || 300
        });
      }}
    </ParentSize>
  );
};

const ActivityChart = ({ 
  eventData, 
  probabilityData = [], 
  timeFrame, 
  timelineOptions, 
  handleTimelineChange,
  isSubmarketMode = false  // New parameter to explicitly specify submarket mode
}) => {
  const [hoveredProbability, setHoveredProbability] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);
  const theme = useSelector((state) => state.theme.value); // Get current theme
  const isDarkMode = theme === 'dark'; // Check if dark mode is active

  // Now use the explicit parameter instead of inferring it

  // Normalize incoming data (supports new format with markets[].history and legacy format)
  const normalizedMarkets = useMemo(() => {
    if (!probabilityData) return [];
    // New format: { success, event_id, interval, markets: [{ id, name, s1, s2, history: [{ t, p }] }] }
    if (Array.isArray(probabilityData.markets)) {
      return probabilityData.markets.map(m => {
        const history = Array.isArray(m.history) ? m.history : [];
        return {
          market_id: m.id,
          market_name: m.name,
          data: history.map(h => ({ time: new Date(h.t * 1000).toISOString(), probability: h.p, a: h.a }))
        };
      });
    }
    // Legacy format: array of markets with .market_id/.market_name and .data
    if (Array.isArray(probabilityData)) {
      return probabilityData;
    }
    return [];
  }, [probabilityData]);

  // Build market meta (start date and resolution details) from eventData
  const marketMeta = useMemo(() => {
    const meta = {};
    if (!eventData?.sub_markets) return meta;
    for (const sm of eventData.sub_markets) {
      const startMs = sm.start_date ? Date.parse(sm.start_date) : undefined;
      let resolutionTarget;
      let resolutionTimeMs;
      const isResolved = sm.status === 'settled' || sm.resolution_state === 'final_resolution' || (sm.result && sm.result !== 'pending');
      if (isResolved && sm.result) {
        // If side_1 wins -> 100 else 0
        const side1 = sm.side_1 || 'Yes';
        resolutionTarget = sm.result === side1 ? 100 : 0;
        resolutionTimeMs = sm.updatedAt ? Date.parse(sm.updatedAt) : undefined;
      }
      meta[sm._id] = { startMs, resolutionTarget, resolutionTimeMs };
    }
    return meta;
  }, [eventData]);

  // Filter data based on timeFrame and append resolution jump when applicable
  const filteredData = useMemo(() => {
    if (!normalizedMarkets || normalizedMarkets.length === 0) return [];

    const now = new Date();
    let cutoffTime = null;
    switch (timeFrame) {
      case '1h': cutoffTime = new Date(now.getTime() - 1 * 60 * 60 * 1000); break;
      case '1d': cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '1w': cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '1m': cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case 'all': default: cutoffTime = null; break;
    }

    const result = normalizedMarkets.map(market => {
      let data = Array.isArray(market.data) ? [...market.data] : [];
      // Append resolution jump if applicable
      const meta = marketMeta[market.market_id];
      if (meta && meta.resolutionTarget !== undefined) {
        const lastTimeMs = data.length ? Date.parse(data[data.length - 1].time) : undefined;
        // Choose resolution time: provided, else lastTime + 60s, else now
        const resTimeMs = meta.resolutionTimeMs || (lastTimeMs ? lastTimeMs + 60 * 1000 : Date.now());
        const resISO = new Date(resTimeMs).toISOString();
        // Only push if not already at same timestamp/value
        const alreadyAtTarget = data.length && data[data.length - 1].probability === meta.resolutionTarget;
        if (!alreadyAtTarget) {
          data = [...data, { time: resISO, probability: meta.resolutionTarget, a: true }];
        }
      }

      // Apply timeframe cutoff if needed
      if (cutoffTime) {
        // Find first index >= cutoff
        const cutoffMs = cutoffTime.getTime();
        let firstIdx = data.findIndex(item => Date.parse(item.time) >= cutoffMs);
        if (firstIdx === -1) {
          // No points inside window; try to include a boundary using last point before cutoff (if any)
          const prev = data.length ? data[data.length - 1] : null;
          data = prev ? [{ time: cutoffTime.toISOString(), probability: prev.probability, a: prev.a }] : [];
        } else {
          const prev = firstIdx > 0 ? data[firstIdx - 1] : null;
          const inside = data.slice(firstIdx);
          const firstInsideTime = inside.length ? Date.parse(inside[0].time) : null;
          // Insert synthetic boundary at cutoff with previous 'a' and value if cutoff is before first inside point
          if (prev && (firstInsideTime === null || cutoffMs < firstInsideTime)) {
            inside.unshift({ time: cutoffTime.toISOString(), probability: prev.probability, a: prev.a });
          }
          data = inside;
        }
      }

      return { ...market, data };
    }).filter(m => m.data.length > 0);

    return result;
  }, [normalizedMarkets, timeFrame, marketMeta]);

  // Process the data to make it usable for the chart
  const processedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      console.error("ERROR: filteredData is empty in ActivityChart");
      return [];
    }


    return filteredData.map(market => {
      // Use all available data points regardless of hasData flag
      const dataPoints = market.data;

      // If no data points at all, return empty processed data
      if (dataPoints.length === 0) return { ...market, processedData: [] };

      // Find the first valid probability value to use as a baseline
      const firstValidProbability = dataPoints.find(point => point.probability !== null && point.probability !== undefined)?.probability || "50.00";

      // Create processed data points, filling in null values with the first valid probability
      const processedPoints = dataPoints.map(point => ({
        ...point,
        probability: point.probability !== null && point.probability !== undefined ? point.probability : firstValidProbability,
        a: point.a
      }));

      // If we have only one data point, create synthetic points for better visibility
      if (processedPoints.length === 1) {
        const dataPoint = processedPoints[0];
        const time = new Date(dataPoint.time);
        const probability = dataPoint.probability;

        // Create an earlier time point and a later point
        const earlierDate = new Date(time);
        earlierDate.setDate(earlierDate.getDate() - 1);

        const laterDate = new Date(time);
        laterDate.setDate(laterDate.getDate() + 1);

        return {
          ...market,
          processedData: [
            {
              time: earlierDate.toISOString(),
                probability,
                a: true,
              hasData: true
            },
            dataPoint,
            {
              time: laterDate.toISOString(),
                probability, 
                a: true,
              hasData: true
            }
          ]
        };
      }

      // If we have multiple data points, use them directly
      return {
        ...market,
        processedData: processedPoints
      };
    }).filter(market => market.processedData.length > 0);
  }, [filteredData]);

  // Generate x-axis ticks with proper intervals
  const xAxisTicks = useMemo(() => {
    if (!processedData.length || !processedData[0]?.processedData?.length) return [];

    // Collect all timestamps from all markets
    const allTimestamps = [];
    processedData.forEach(market => {
      if (market.processedData && market.processedData.length > 0) {
        market.processedData.forEach(dataPoint => {
          if (dataPoint.time) {
            allTimestamps.push(new Date(dataPoint.time).getTime());
          }
        });
      }
    });

    // If no timestamps are found, return empty array
    if (allTimestamps.length === 0) return [];

    // Sort timestamps and find first and last
    allTimestamps.sort((a, b) => a - b);
    const firstTime = allTimestamps[0];
    const lastTime = allTimestamps[allTimestamps.length - 1];
    const timeRange = lastTime - firstTime;

    // Determine appropriate number of ticks based on data density and timeframe
    let tickCount;
    const dataPointCount = allTimestamps.length;
    
    if (dataPointCount <= 3) {
      // For very few data points, show all of them
      return allTimestamps.map(timestamp => {
        const tickTime = new Date(timestamp);
        let label;
        
        if (timeFrame === '1h') {
          label = tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (timeFrame === '1d') {
          label = tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (timeFrame === '1w') {
          label = tickTime.toLocaleDateString([], { weekday: 'short' });
        } else {
          label = tickTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
        
        return {
          timestamp,
          label
        };
      });
    } else {
      // Dynamic tick count based on data density and timeframe - limited to max 5, min 3
      if (timeFrame === '1h') {
        tickCount = Math.min(5, Math.max(3, Math.ceil(dataPointCount / 8)));
      } else if (timeFrame === '1d') {
        tickCount = Math.min(5, Math.max(3, Math.ceil(dataPointCount / 6)));
      } else if (timeFrame === '1w') {
        tickCount = Math.min(5, Math.max(3, Math.floor(dataPointCount / 5)));
      } else if (timeFrame === '1m') {
        tickCount = Math.min(5, Math.max(3, Math.floor(dataPointCount / 10)));
      } else {
        tickCount = Math.min(5, Math.max(3, Math.floor(dataPointCount / 15)));
      }
    }
    
    const ticks = [];
    
    // Create evenly spaced ticks
    for (let i = 0; i <= tickCount; i++) {
      const tickTime = new Date(firstTime + (timeRange * (i / tickCount)));
      let label;

      if (timeFrame === '1h') {
        label = tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeFrame === '1d') {
        label = tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeFrame === '1w') {
        label = tickTime.toLocaleDateString([], { weekday: 'short' });
      } else {
        label = tickTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }

      ticks.push({
        timestamp: tickTime.getTime(),
        label: label
      });
    }

    return ticks;
  }, [processedData, timeFrame]);

  // Compute 4 evenly spaced tick values using xAxisTicks indices via useMemo
  const displayXTicks = useMemo(() => {
    if (!processedData.length) return [];
    // Collect and sort all timestamps
    const allTimes = processedData.flatMap(market =>
      market.processedData.map(pt => new Date(pt.time).getTime())
    );
    if (!allTimes.length) return [];
    allTimes.sort((a, b) => a - b);
    const start = allTimes[0];
    const end = allTimes[allTimes.length - 1];
    const range = end - start;
    // Return 5 ticks at equal intervals including start and end
    return [0, 1, 2, 3, 4].map(i => start + (range * (i / 4)));
  }, [processedData]);

  // Format the data for the chart
  const chartData = useMemo(() => {
    if (!processedData.length) {
      return [];
    }

    // Find all unique timestamps across all markets
    const allTimestamps = new Set();
    processedData.forEach(market => {
      market.processedData.forEach(dataPoint => {
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
      processedData.forEach(market => {
        const marketData = market.processedData.find(
          d => new Date(d.time).getTime() === timestamp
        );

        if (marketData) {
          // Store the probability as a number and use the market_id as the key
          dataPoint[market.market_id] = parseFloat(marketData.probability);
          // Also store the market name for reference in tooltip
          dataPoint[`${market.market_id}_name`] = market.market_name;
          // Store the availability flag 'a' as well
          dataPoint[`${market.market_id}_a`] = marketData.a;
        }
      });

      return dataPoint;
    });
  }, [processedData]);

  // Build per-market series including 'a' flag for dotted rendering
  const seriesByMarketId = useMemo(() => {
    const map = {};
    if (!processedData.length) return map;
    processedData.forEach(market => {
      const id = market.market_id;
      map[id] = market.processedData
        .map(pt => ({ timestamp: new Date(pt.time).getTime(), value: parseFloat(pt.probability), a: pt.a !== false }))
        .sort((a, b) => a.timestamp - b.timestamp);
    });
    return map;
  }, [processedData]);

  // Calculate dynamic Y-axis domain and ticks
  const yAxisStats = useMemo(() => {
  if (!chartData.length) return { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] };
    let min = Infinity;
    let max = -Infinity;
    chartData.forEach(point => {
      Object.keys(point).forEach(key => {
        if (key !== 'timestamp' && key.endsWith('_name') === false) {
          const val = point[key];
          if (typeof val === 'number' && !isNaN(val)) {
            min = Math.min(min, val);
            max = Math.max(max, val);
          }
        }
      });
    });
  if (!isFinite(min) || !isFinite(max)) return { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] };
  // Always include 0% so the baseline is visible
  const range = max - min;
  const pad = Math.max(range * 0.1, 2);
  const yMin = 0;
  let yMax = Math.ceil((max + pad) / 5) * 5;
  if (yMax < 20) yMax = 20; // ensure some headroom
  if (yMax > 100) yMax = 100;
    // Generate exactly 5 evenly spaced ticks
    const tickCount = 4; // 4 intervals = 5 ticks
    const step = (yMax - yMin) / tickCount;
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round(yMin + i * step));
    return { min: yMin, max: yMax, ticks };
  }, [chartData]);

  // Format tick values for x-axis
  const customTickFormatter = (value) => {
    const tickTime = new Date(value);
    if (timeFrame === '1h' || timeFrame === '1d') {
      return tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeFrame === '1w') {
      return tickTime.toLocaleDateString([], { weekday: 'short' });
    }
    return tickTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Limit to displaying only the top 4 markets
  const marketsToShow = useMemo(() => {
    if (!processedData.length) return [];

    // Sort by the probability values (higher value = higher priority)
    // and take only the first 4 markets
    return processedData
      .slice(0, 4);
  }, [processedData]);

  // Check if we have valid data to display
  const hasData = useMemo(() => {
    const hasMarketsToShow = marketsToShow.length > 0;
    const hasChartData = chartData.length > 0;


    if (!hasMarketsToShow) {
      console.error("ERROR: No markets to show in ActivityChart");
    }

    if (!hasChartData) {
      console.error("ERROR: No chart data points in ActivityChart");
    }

    return hasMarketsToShow && hasChartData;
  }, [marketsToShow, chartData]);

  // Console log for debugging
  // console.log('ActivityChart Debug:', {
  //   hasData,
  //   marketsCount: marketsToShow.length, 
  //   chartDataPoints: chartData.length,
  //   firstMarket: processedData[0],
  //   chartData,
  //   hoveredProbability, // Added for debugging
  // });

  return (
    <div className="h-[400px] w-full transition-all duration-300 ease-in-out">
      {/* MODIFIED HEADER SECTION */}
      {/* This outer div controls the overall spacing of the header block and the chart below it */}
      <div className="px-3 pt-1 min-h-[67px]"> {/* Added min-height to ensure consistent space */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-y-3 sm:gap-x-4">
          {/* Left Part: Legend or Chance Display */}
          <div className="w-full sm:w-auto min-h-[36px] flex items-center"> {/* Added min-height and flex alignment */}
            {eventData && eventData.has_sub_markets && !isSubmarketMode ? (
              <CustomChartLegend
                markets={marketsToShow}
                chartData={chartData}
                colors={isDarkMode ? CHART_COLORS1 : CHART_COLORS}
                hoveredData={hoveredData}
              />
            ) : eventData ? (
              <span
                className="text-[25px] font-semibold block" 
                style={{ color: "#4169E1" }}
              >
                {hoveredProbability !== null
                  ? parseFloat(hoveredProbability).toFixed(0)
                  : probabilityData.length > 0 &&
                    probabilityData[0]?.data?.length > 0 &&
                    probabilityData[0].data[probabilityData[0].data.length - 1]?.probability !== null &&
                    probabilityData[0].data[probabilityData[0].data.length - 1]?.probability !== undefined
                  ? parseFloat(
                      probabilityData[0].data[
                        probabilityData[0].data.length - 1
                      ].probability
                    ).toFixed(0)
                  : "0"}
                %<span className="text-[17px] ml-2" style={{ color: "#4169E1" }}>Chance</span>
                {/* Percentage change indicator with calculated value */}
                {probabilityData.length > 0 && probabilityData[0]?.data?.length > 1 && (
                  <span className="ml-2 text-sm">
                    {(() => {
                      // Calculate percentage change
                      const currentData = probabilityData[0].data;
                      // Get start value based on timeframe
                      let startIndex = 0;
                      // Find the first data point for this timeframe
                      if (timeFrame !== 'all' && currentData.length > 0) {
                        const now = new Date();
                        let cutoffTime;

                        switch (timeFrame) {
                          case '1h': cutoffTime = new Date(now.getTime() - 1 * 60 * 60 * 1000); break;
                          case '1d': cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
                          case '1w': cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
                          case '1m': cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
                          default: break;
                        }

                        for (let i = 0; i < currentData.length; i++) {
                          if (new Date(currentData[i].time) >= cutoffTime) {
                            startIndex = i;
                            break;
                          }
                        }
                      }

                      // Get start and end values
                      const startValue = parseFloat(currentData[startIndex]?.probability || 0);
                      const endValue = hoveredProbability !== null 
                        ? parseFloat(hoveredProbability) 
                        : parseFloat(currentData[currentData.length - 1]?.probability || 0);

                      // Calculate change
                      const change = endValue - startValue;
                      const changePercent = Math.abs(change).toFixed(1);
                      const isUp = change >= 0;

                      return (
                        <>
                          <span 
                            className={`${isUp ? "text-[#009689]" : "text-[#8D1F17]"} font-normal`} // Added font-normal (400 weight)
                          >
                            {isUp ? "▲" : "▼"} {changePercent}%
                          </span>
                        </>
                      );
                    })()}
                  </span>
                )}
              </span>
            ) : (
              <div className="min-h-[36px]">&nbsp;</div> /* Consistent minimum height */
            )}
          </div>

          {/* Right Part: soundbet Logo */}
          <div className="flex justify-end w-full sm:w-auto min-h-[36px] items-center">
            <img 
              src={isDarkMode ? "/soundbet-dark.png" : "/soundbet-full-light.png"} 
              alt="soundbet" 
              className="h-7 w-auto opacity-30 mr-2"
            />
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="h-full w-full flex items-center justify-center text-gray-500 transition-opacity duration-300">
          No data available for the selected time frame
        </div>
      ) : (
        <div 
          style={{ height: '69%', width: '100%' }} 
          className="transition-all duration-300 ease-in-out"
        >
          <DebouncedParentSize>
            {({ width, height }) => (
              <VisxChart
                width={width}
                height={height}
                chartData={chartData}
                marketsToShow={marketsToShow}
                yAxisStats={yAxisStats}
                timeFrame={timeFrame}
                isDarkMode={isDarkMode}
                onHover={(data) => {
                  if (data) {
                    if (!eventData.has_sub_markets && processedData[0]?.market_id) {
                      const hoveredValue = data[processedData[0].market_id];
                      if (hoveredValue !== undefined) {
                        setHoveredProbability(hoveredValue);
                      }
                    } else if (eventData.has_sub_markets) {
                      const firstMarketKey = processedData[0]?.market_id;
                      if (firstMarketKey && data[firstMarketKey] !== undefined) {
                        setHoveredProbability(data[firstMarketKey]);
                      }
                    }
                    setHoveredData(data);
                  } else {
                    setHoveredProbability(null);
                    setHoveredData(null);
                  }
                }}
                hoveredData={hoveredData}
                marketMeta={marketMeta}
                seriesByMarketId={seriesByMarketId}
              />
            )}
          </DebouncedParentSize>
        </div>
      )}

      {/* Timeline Options - Moved below the chart, left aligned */}
      {timelineOptions && handleTimelineChange && (
        <div className="px-3">
          <div className="flex gap-2 flex-wrap justify-start">
            {timelineOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimelineChange(option)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-[8px] transition-all duration-300 ease-in-out ${
                  timeFrame === option.value
                    ? "bg-[#FF4215] border border-[#FF4215] text-white transform scale-105"
                    : isDarkMode ?  "bg-transparent border border-[#C5C5C5]/50 text-[#C5C5C5] hover:bg-[#C5C5C5]/30" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
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

export default ActivityChart;