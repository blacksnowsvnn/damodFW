import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Activity, ShieldCheck } from "lucide-react"

export function OverviewStats({ totalMembers }: { totalMembers: number }) {
  const stats = [
    {
      title: "Tổng thành viên",
      value: totalMembers.toString(),
      description: "Tất cả tài khoản trong hệ thống",
      icon: Users,
      color: "text-chart-1",
      bg: "bg-chart-1/20",
    },
    {
      title: "Thành viên mới",
      value: "+12",
      description: "Trong 30 ngày qua",
      icon: UserPlus,
      color: "text-chart-2",
      bg: "bg-chart-2/20",
    },
    {
      title: "Đang hoạt động",
      value: "85%",
      description: "Tỷ lệ truy cập trong tuần",
      icon: Activity,
      color: "text-chart-3",
      bg: "bg-chart-3/20",
    },
    {
      title: "Bảo mật",
      value: "Tốt",
      description: "Hệ thống đang ổn định",
      icon: ShieldCheck,
      color: "text-chart-4",
      bg: "bg-chart-4/20",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
