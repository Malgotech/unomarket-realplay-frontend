import { useState } from "react";
import { LineChart } from "@mui/x-charts";
import Stack from "@mui/material/Stack";
import { useSelector } from "react-redux";
import { useMemo } from "react";

const CHART_COLORS = ["#298C8C", "#e71e8dff", "#EF6A40", "#0167C6"];
const CHART_COLORS1 = ["#ffffffff", "#8940EF", "#e4e71eff", "#40A9EF"];

export default function StockChart({
  eventData,
  probabilityData = [],
  timeFrame,
  timelineOptions,
  handleTimelineChange,
  isSubmarketMode = false,
}) {
  const [hoveredProbability, setHoveredProbability] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);
  const theme = useSelector((state) => state.theme.value);
  const isDarkMode = theme === "dark";

  // Line colors - use your existing color schemes
  const lineColors = isDarkMode ? CHART_COLORS1 : CHART_COLORS;

  // Comprehensive theme colors
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const gridColor = isDarkMode ? "#444" : "#ddd";
  const backgroundColor = isDarkMode ? "#0B0B0B" : "#FFFFFF";
  const axisLineColor = isDarkMode ? "#666" : "#aaa";
  const tooltipBackground = isDarkMode ? "#222" : "#fff";
  const tooltipBorderColor = isDarkMode ? "#444" : "#ddd";
  const noDataTextColor = isDarkMode ? "#888" : "#666";

  // Data processing logic from your original component
  const normalizedMarkets = useMemo(() => {
    if (!probabilityData) return [];
    // New format: { success, event_id, interval, markets: [{ id, name, s1, s2, history: [{ t, p }] }] }
    if (Array.isArray(probabilityData.markets)) {
      return probabilityData.markets.map((m) => {
        const history = Array.isArray(m.history) ? m.history : [];
        return {
          market_id: m.id,
          market_name: m.name,
          data: history.map((h) => ({
            time: new Date(h.t * 1000).toISOString(),
            probability: h.p,
            a: h.a,
          })),
        };
      });
    }
    // Legacy format: array of markets with .market_id/.market_name and .data
    if (Array.isArray(probabilityData)) {
      return probabilityData;
    }
    return [];
  }, [probabilityData]);

  const marketMeta = useMemo(() => {
    const meta = {};
    if (!eventData?.sub_markets) return meta;
    for (const sm of eventData.sub_markets) {
      const startMs = sm.start_date ? Date.parse(sm.start_date) : undefined;
      let resolutionTarget;
      let resolutionTimeMs;
      const isResolved =
        sm.status === "settled" ||
        sm.resolution_state === "final_resolution" ||
        (sm.result && sm.result !== "pending");
      if (isResolved && sm.result) {
        // If side_1 wins -> 100 else 0
        const side1 = sm.side_1 || "Yes";
        resolutionTarget = sm.result === side1 ? 100 : 0;
        resolutionTimeMs = sm.updatedAt ? Date.parse(sm.updatedAt) : undefined;
      }
      meta[sm._id] = { startMs, resolutionTarget, resolutionTimeMs };
    }
    return meta;
  }, [eventData]);

  const filteredData = useMemo(() => {
    if (!normalizedMarkets || normalizedMarkets.length === 0) return [];

    const now = new Date();
    let cutoffTime = null;
    switch (timeFrame) {
      case "1h":
        cutoffTime = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        break;
      case "1d":
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "1w":
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "1m":
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "all":
      default:
        cutoffTime = null;
        break;
    }

    const result = normalizedMarkets
      .map((market) => {
        let data = Array.isArray(market.data) ? [...market.data] : [];
        // Append resolution jump if applicable
        const meta = marketMeta[market.market_id];
        if (meta && meta.resolutionTarget !== undefined) {
          const lastTimeMs = data.length
            ? Date.parse(data[data.length - 1].time)
            : undefined;
          // Choose resolution time: provided, else lastTime + 60s, else now
          const resTimeMs =
            meta.resolutionTimeMs ||
            (lastTimeMs ? lastTimeMs + 60 * 1000 : Date.now());
          const resISO = new Date(resTimeMs).toISOString();
          // Only push if not already at same timestamp/value
          const alreadyAtTarget =
            data.length &&
            data[data.length - 1].probability === meta.resolutionTarget;
          if (!alreadyAtTarget) {
            data = [
              ...data,
              { time: resISO, probability: meta.resolutionTarget, a: true },
            ];
          }
        }

        // Apply timeframe cutoff if needed
        if (cutoffTime) {
          // Find first index >= cutoff
          const cutoffMs = cutoffTime.getTime();
          let firstIdx = data.findIndex(
            (item) => Date.parse(item.time) >= cutoffMs
          );
          if (firstIdx === -1) {
            // No points inside window; try to include a boundary using last point before cutoff (if any)
            const prev = data.length ? data[data.length - 1] : null;
            data = prev
              ? [
                  {
                    time: cutoffTime.toISOString(),
                    probability: prev.probability,
                    a: prev.a,
                  },
                ]
              : [];
          } else {
            const prev = firstIdx > 0 ? data[firstIdx - 1] : null;
            const inside = data.slice(firstIdx);
            const firstInsideTime = inside.length
              ? Date.parse(inside[0].time)
              : null;
            // Insert synthetic boundary at cutoff with previous 'a' and value if cutoff is before first inside point
            if (
              prev &&
              (firstInsideTime === null || cutoffMs < firstInsideTime)
            ) {
              inside.unshift({
                time: cutoffTime.toISOString(),
                probability: prev.probability,
                a: prev.a,
              });
            }
            data = inside;
          }
        }

        return { ...market, data };
      })
      .filter((m) => m.data.length > 0);

    return result;
  }, [normalizedMarkets, timeFrame, marketMeta]);

  const processedData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      console.error("ERROR: filteredData is empty");
      return [];
    }

    return filteredData
      .map((market) => {
        const dataPoints = market.data;

        if (dataPoints.length === 0) return { ...market, processedData: [] };

        const firstValidProbability =
          dataPoints.find(
            (point) =>
              point.probability !== null && point.probability !== undefined
          )?.probability || "50.00";

        const processedPoints = dataPoints.map((point) => ({
          ...point,
          probability:
            point.probability !== null && point.probability !== undefined
              ? point.probability
              : firstValidProbability,
          a: point.a,
        }));

        if (processedPoints.length === 1) {
          const dataPoint = processedPoints[0];
          const time = new Date(dataPoint.time);
          const probability = dataPoint.probability;

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
                hasData: true,
              },
              dataPoint,
              {
                time: laterDate.toISOString(),
                probability,
                a: true,
                hasData: true,
              },
            ],
          };
        }

        return {
          ...market,
          processedData: processedPoints,
        };
      })
      .filter((market) => market.processedData.length > 0);
  }, [filteredData]);

  // Prepare data for MUI LineChart
  const chartSeries = useMemo(() => {
    if (!processedData.length) return [];

    // Limit to top 4 markets as in original
    const marketsToShow = processedData.slice(0, 4);

    return marketsToShow.map((market, index) => {
      // Sort data by timestamp
      const sortedData = [...market.processedData].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
      );

      return {
        label: market.market_name || `Market ${index + 1}`,
        data: sortedData.map((point) => parseFloat(point.probability)),
        curve: "stepAfter",
        color: lineColors[index % lineColors.length],
        showMark: false,
      };
    });
  }, [processedData, lineColors]);

  const xAxisData = useMemo(() => {
    if (!processedData.length || !processedData[0]?.processedData?.length)
      return [];

    // Collect all timestamps across all markets
    const allTimestamps = new Set();
    processedData.forEach((market) => {
      market.processedData.forEach((dataPoint) => {
        if (dataPoint.time) {
          allTimestamps.add(new Date(dataPoint.time).getTime());
        }
      });
    });

    // Convert to array, sort, and format based on timeframe
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    // Format timestamps based on timeframe
    return sortedTimestamps.map((timestamp) => {
      const date = new Date(timestamp);
      if (timeFrame === "1h" || timeFrame === "1d") {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (timeFrame === "1w") {
        return date.toLocaleDateString([], { weekday: "short" });
      }
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    });
  }, [processedData, timeFrame]);

  // Calculate Y-axis range
  const yAxisRange = useMemo(() => {
    if (!processedData.length) return [0, 100];

    let min = Infinity;
    let max = -Infinity;

    processedData.forEach((market) => {
      market.processedData.forEach((point) => {
        const val = parseFloat(point.probability);
        if (!isNaN(val)) {
          min = Math.min(min, val);
          max = Math.max(max, val);
        }
      });
    });

    if (!isFinite(min) || !isFinite(max)) return [0, 100];

    const range = max - min;
    const pad = Math.max(range * 0.1, 2);
    const yMin = 0;
    let yMax = Math.ceil((max + pad) / 5) * 5;
    if (yMax < 20) yMax = 20;
    if (yMax > 100) yMax = 100;

    return [yMin, yMax];
  }, [processedData]);

  // Check if we have valid data
  const hasData = useMemo(() => {
    return chartSeries.length > 0 && xAxisData.length > 0;
  }, [chartSeries, xAxisData]);

  return (
    <Stack
      width="100%"
      sx={{
        background: backgroundColor,
        borderRadius: 2,
        p: 2,
        height: "400px",
       
      }}
    >
      {!hasData ? (
        <div 
          className="h-full w-full flex items-center justify-center"
          style={{ color: noDataTextColor }}
        >
          No data available for the selected time frame
        </div>
      ) : (
        <LineChart
          height={350}
          sx={{
            // Chart area styling
            '& .MuiChartsAxis-root .MuiChartsAxis-line': {
              stroke: axisLineColor,
            },
            '& .MuiChartsAxis-root .MuiChartsAxis-tick': {
              stroke: axisLineColor,
            },
            // Legend styling
            '& .MuiChartsLegend-root': {
              color: textColor,
            },
            // Grid styling
            '& .MuiChartsAxis-root .MuiChartsAxis-tickLabel': {
              fill: textColor,
            },
          }}
          xAxis={[
            {
              data: Array.from({ length: xAxisData.length }, (_, i) => i),
              valueFormatter: (index) => xAxisData[index] || "",
              tickLabelStyle: { 
                fill: textColor,
                fontSize: 12,
              },
              tickNumber: Math.min(5, xAxisData.length),
              axisLine: { 
                stroke: axisLineColor,
                strokeWidth: 1,
              },
              tick: { 
                stroke: axisLineColor,
                strokeWidth: 1,
              },
            },
          ]}
          yAxis={[
            {
              valueFormatter: (value) => `${value}%`,
              tickLabelStyle: { 
                fill: textColor,
                fontSize: 12,
              },
              min: yAxisRange[0],
              max: yAxisRange[1],
              axisLine: { 
                stroke: axisLineColor,
                strokeWidth: 1,
              },
              tick: { 
                stroke: axisLineColor,
                strokeWidth: 1,
              },
            },
          ]}
          grid={{
            horizontal: true,
            vertical: false,
            stroke: gridColor,
            strokeWidth: 0.5,
          }}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'top', horizontal: 'right' },
              labelStyle: { 
                fill: textColor,
                fontSize: 12,
              },
              itemMarkWidth: 10,
              itemMarkHeight: 10,
              markGap: 5,
              itemGap: 15,
            },
            tooltip: {
              sx: {
                '& .MuiChartsTooltip-label': { 
                  color: textColor,
                  fontSize: 14,
                  fontWeight: 600,
                },
                '& .MuiChartsTooltip-value': { 
                  color: textColor,
                  fontSize: 13,
                  fontWeight: 500,
                },
                '& .MuiChartsTooltip-cell': {
                  color: textColor,
                },
                '& .MuiChartsTooltip-table': {
                  color: textColor,
                },
                '& .MuiChartsTooltip-mark': {
                  strokeWidth: 2,
                },
                backgroundColor: tooltipBackground,
                border: `1px solid ${tooltipBorderColor}`,
                borderRadius: '6px',
                boxShadow: isDarkMode 
                  ? '0 4px 12px rgba(0,0,0,0.3)'
                  : '0 4px 12px rgba(0,0,0,0.1)',
                padding: '8px 12px',
              },
            },
          }}
          colors={lineColors}
          series={chartSeries}
        />
      )}
    </Stack>
  );
}