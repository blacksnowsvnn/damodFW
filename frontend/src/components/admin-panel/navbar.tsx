import { UserNav } from "@/components/admin-panel/user-nav"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SearchCommand } from "@/components/admin-panel/search-command"

interface NavbarProps {
  title: string
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-bold text-lg ml-4 hidden md:block">{title}</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <SearchCommand />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
