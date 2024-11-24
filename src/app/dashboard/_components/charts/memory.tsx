"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
// import { formatCompactNumber } from "@/lib/formatters";
import {
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";

export function MemoryUsageChart({
  chartData,
}: {
  chartData: {
    id: number;
    usage: number;
  }[];
}) {
  const chartConfig = {
    usage: {
      label: "Usage",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Memory</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(v) => v + "MiB"}
                />
              }
            />
            <Area
              dataKey="usage"
              type="natural"
              fill="var(--color-accent)"
              fillOpacity={0.3}
              stroke="var(--color-accent)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
