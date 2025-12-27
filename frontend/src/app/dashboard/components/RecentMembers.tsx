import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface Member {
  id: number
  email: string
  full_name: string | null
  rank: number
}

export function RecentMembers({ members }: { members: Member[] }) {
  return (
    <Card className="col-span-3 border-none shadow-sm">
      <CardHeader>
        <CardTitle>Thành viên mới</CardTitle>
        <CardDescription>
          Có {members.length} thành viên vừa tham gia hệ thống.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {members.slice(0, 5).map((member) => (
            <div key={member.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {member.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {member.full_name || member.email.split("@")[0]}
                </p>
                <p className="text-sm text-muted-foreground">
                  {member.email}
                </p>
              </div>
              <div className="ml-auto font-medium text-xs bg-muted px-2 py-1 rounded">
                Rank {member.rank}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
