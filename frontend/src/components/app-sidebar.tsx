"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  ChevronRight,
  Palette,
  Globe,
  Code,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  // Trạng thái mở rộng cho menu Hệ thống (mặc định mở nếu đang ở trong trang settings)
  const [isSystemOpen, setIsSystemOpen] = React.useState(
    pathname?.startsWith("/dashboard/settings") || false
  )

  React.useEffect(() => {
    if (pathname?.startsWith("/dashboard/settings")) {
      setIsSystemOpen(true)
    }
  }, [pathname])

  const menuGroups = [
    {
      label: "Chính",
      items: [
        {
          title: "Tổng quan",
          url: "/dashboard",
          icon: LayoutDashboard,
          active: pathname === "/dashboard",
        },
      ],
    },
    {
      label: "Quản lý",
      items: [
        {
          title: "Thành viên",
          url: "/dashboard/members",
          icon: Users,
          active: pathname?.startsWith("/dashboard/members"),
        },
      ],
    },
    {
      label: "Cấu hình",
      items: [
        {
          title: "Hệ thống",
          icon: Settings,
          active: pathname?.startsWith("/dashboard/settings"),
          // Menu con
          items: [
            {
              title: "Giao diện",
              url: "/dashboard/settings",
              icon: Palette,
              active: pathname === "/dashboard/settings",
            },
            {
              title: "SEO",
              url: "/dashboard/settings/seo",
              icon: Globe,
              active: pathname === "/dashboard/settings/seo",
            },
            {
              title: "Nâng cao (Scripts)",
              url: "/dashboard/settings/advanced",
              icon: Code,
              active: pathname === "/dashboard/settings/advanced",
            },
          ],
        },
      ],
    },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader className="h-14 border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                  <span className="truncate font-bold text-foreground">Damod Admin</span>
                  <span className="truncate text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Management Suite</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    // Logic hiển thị menu con
                    <>
                      <SidebarMenuButton
                        onClick={() => setIsSystemOpen(!isSystemOpen)}
                        tooltip={item.title}
                        isActive={item.active}
                        className={cn(
                          "transition-all duration-200 cursor-pointer",
                          item.active 
                            ? "text-foreground font-medium" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn("size-4", item.active ? "text-primary" : "text-muted-foreground")} />
                        <span>{item.title}</span>
                        <ChevronRight 
                          className={cn(
                            "ml-auto size-4 transition-transform duration-200", 
                            isSystemOpen ? "rotate-90" : ""
                          )} 
                        />
                      </SidebarMenuButton>
                      
                      {isSystemOpen && (
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton 
                                asChild 
                                isActive={subItem.active}
                                className={cn(
                                  subItem.active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""
                                )}
                              >
                                <Link href={subItem.url}>
                                  {subItem.icon && <subItem.icon className="size-3 mr-2" />}
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  ) : (
                    // Logic hiển thị menu thường
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={item.active}
                      className={cn(
                        "transition-all duration-200",
                        item.active 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" 
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                      )}
                    >
                      <Link href={item.url || "#"}>
                        <item.icon className={cn("size-4", item.active ? "text-primary" : "text-muted-foreground")} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
