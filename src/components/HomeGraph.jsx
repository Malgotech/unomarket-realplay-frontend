import { useState, useMemo } from "react";
import { LineChart } from "@mui/x-charts";
import Stack from "@mui/material/Stack";

const CHART_COLORS = ["#298C8C", "#e71e8dff", "#EF6A40", "#0167C6"];
const CHART_COLORS1 = ["#ffffffff", "#8940EF", "#e4e71eff", "#40A9EF"];

export default function HomeChart({
  events = []
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hoveredProbability, setHoveredProbability] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);

  // Line colors - use your existing color schemes
  const lineColors = isDarkMode ? CHART_COLORS1 : CHART_COLORS;

  // Text & Axis colors
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const gridColor = isDarkMode ? "#444" : "#ddd";
  const backgroundColor = isDarkMode ? "#0B0B0B" : "#FFFFFF";

  // Process events data to get chart series
  const { chartSeries, xAxisData, hasData } = useMemo(() => {
    if (!events || events.length === 0) {
      return { chartSeries: [], xAxisData: [], hasData: false };
    }

    // Take the first 3 events with probabilityGraph data
    const validEvents = events
      .filter(event => event?.probabilityGraph?.markets?.length > 0)
      .slice(1, 4);

    if (validEvents.length === 0) {
      return { chartSeries: [], xAxisData: [], hasData: false };
    }

    // Process each event's probability graph
    const seriesData = validEvents.map((event, index) => {
      const market = event.probabilityGraph.markets[0]; // Take first market from each event
      const history = market.history || [];
      
      // Sort history by timestamp
      const sortedHistory = [...history].sort((a, b) => a.t - b.t);
      
      // Extract probability values
      const probabilityValues = sortedHistory.map(point => point.p);
      
      // Format timestamps for x-axis
      const timestamps = sortedHistory.map(point => {
        const date = new Date(point.t * 1000);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        });
      });

      return {
        label: event.event_title || `Event ${index + 1}`,
        data: probabilityValues,
        timestamps: timestamps,
        curve: "stepAfter",
        color: lineColors[index % lineColors.length],
        showMark: false,
      };
    });

    // Use timestamps from the first series for x-axis
    const xAxisLabels = seriesData[0]?.timestamps || [];

    return {
      chartSeries: seriesData,
      xAxisData: xAxisLabels,
      hasData: seriesData.length > 0 && xAxisLabels.length > 0
    };
  }, [events, lineColors]);

  return (
    <Stack
      width="100%"
      sx={{
        background: backgroundColor,
        borderRadius: 2,
        p: 2,
        height: "300px",
      }}
    >
      {!hasData ? (
        <div className="h-full w-full flex items-center justify-center text-gray-500">
          No data available for the selected time frame
        </div>
      ) : (
        <LineChart
          height={250}
          xAxis={[
            {
              data: Array.from({ length: xAxisData.length }, (_, i) => i),
              valueFormatter: (index) => xAxisData[index] || "",
              tickLabelStyle: { fill: textColor },
              tickNumber: Math.min(5, xAxisData.length),
              scaleType: 'point',
            },
          ]}
          yAxis={[
            {
              valueFormatter: (value) => `${value}%`,
              tickLabelStyle: { fill: textColor },
              min: 0,
              max: 100,
            },
          ]}
          grid={{
            horizontal: true,
            vertical: false,
            stroke: gridColor,
          }}
          slotProps={{
            legend: {
              labelStyle: { fill: textColor },
              position: { vertical: 'top', horizontal: 'middle' },
            },
            tooltip: {
              sx: {
                ".MuiChartsTooltip-label": { color: textColor },
                ".MuiChartsTooltip-value": { color: textColor },
                backgroundColor: isDarkMode ? "#222" : "#fff",
                border: `1px solid ${gridColor}`,
              },
            },
          }}
          series={chartSeries}
        />
      )}
    </Stack>
  );
}