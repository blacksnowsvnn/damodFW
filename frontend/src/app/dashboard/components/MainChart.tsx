"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const data = [
  { name: "T2", total: 400 },
  { name: "T3", total: 300 },
  { name: "T4", total: 500 },
  { name: "T5", total: 280 },
  { name: "T6", total: 590 },
  { name: "T7", total: 480 },
  { name: "CN", total: 600 },
]

const chartConfig = {
  total: {
    label: "Truy cập",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function MainChart() {
  return (
    <Card className="col-span-4 border-none shadow-sm">
      <CardHeader>
        <CardTitle>Hoạt động hệ thống</CardTitle>
        <CardDescription>Số lượng truy cập trong 7 ngày gần nhất</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />} 
              cursor={{ fill: 'var(--muted)' }}
            />
            <Bar
              dataKey="total"
              fill="var(--color-total)"
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
