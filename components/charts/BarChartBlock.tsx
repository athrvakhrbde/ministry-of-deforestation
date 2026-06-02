"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BarChartBlock({
  data,
}: {
  data: { name: string; count: number; fill: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
        <XAxis type="number" stroke="#6b6b5a" fontSize={10} />
        <YAxis type="category" dataKey="name" stroke="#6b6b5a" fontSize={9} width={75} />
        <Tooltip
          contentStyle={{ background: "#0a0a08", border: "1px solid #6b6b5a" }}
        />
        <Bar dataKey="count" radius={0} />
      </BarChart>
    </ResponsiveContainer>
  );
}
