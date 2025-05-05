"use client"
import Link from "next/link"
import { ElementType } from "react"

interface MenuLinkProps {
  href: string
  icon: ElementType
  label: string
}

export function MenuLink({ href, icon: Icon, label }: MenuLinkProps) {
  return (
    <Link href={href} className="flex items-center gap-2 w-full px-4 py-2">
      <Icon size={16} />
      <span>{label}</span>
    </Link>
  )
}