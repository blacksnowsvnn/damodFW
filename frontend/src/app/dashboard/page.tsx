"use client"

import { useEffect, useState } from "react"
import { apiRequest } from "@/lib/api"
import { OverviewStats } from "./components/OverviewStats"
import { MainChart } from "./components/MainChart"
import { RecentMembers } from "./components/RecentMembers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContentLayout } from "@/components/admin-panel/content-layout"

export default function DashboardPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const membersData = await apiRequest("/members/")
        setMembers(membersData)
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ContentLayout title="Tổng quan">
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="analytics" disabled>Thống kê</TabsTrigger>
            <TabsTrigger value="reports" disabled>Báo cáo</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <OverviewStats totalMembers={members.length} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <MainChart />
              <RecentMembers members={members} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ContentLayout>
  )
}
