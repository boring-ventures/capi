"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { type User as UserType } from "@/types/user";

export interface UserAvatarProps {
  name: string;
  role: 'client' | 'technician';
  photoUrl?: string;
  className?: string;
}

export function UserAvatar({ name, role, photoUrl, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      {photoUrl ? (
        <AvatarImage src={photoUrl} alt={name} />
      ) : (
        <AvatarFallback>
          {name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
