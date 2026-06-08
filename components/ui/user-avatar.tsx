'use client'

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name?: string | null
  avatarUrl?: string | null
  className?: string
}

function resolveAvatarUrl(avatarUrl: string | null | undefined): string | null {
  if (!avatarUrl) return null
  if (avatarUrl.startsWith('http')) return avatarUrl
  // Relative paths are stored as "user-id/filename.jpg" inside the "avatars" bucket
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`
}

export function UserAvatar({ name, avatarUrl, className }: UserAvatarProps) {
  const initials = (name ?? "?").charAt(0).toUpperCase()
  const src = resolveAvatarUrl(avatarUrl)

  return (
    <Avatar className={cn("w-8 h-8 shrink-0", className)}>
      {src && <AvatarImage src={src} alt={name ?? ""} />}
      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}