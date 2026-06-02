"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function LineChartBlock({
  data,
}: {
  data: { month: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="#6b6b5a33" />
        <XAxis dataKey="month" stroke="#6b6b5a" fontSize={9} />
        <YAxis stroke="#6b6b5a" fontSize={10} />
        <Tooltip
          contentStyle={{ background: "#0a0a08", border: "1px solid #6b6b5a" }}
        />
        <Line type="monotone" dataKey="count" stroke="#c0392b" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
