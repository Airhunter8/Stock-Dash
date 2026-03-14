'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Search, TrendingUp, LogOut, User as UserIcon, Settings,
  LayoutDashboard, Briefcase, Star, FlaskConical, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface HeaderProps {
  onSearch?: (query: string) => void
}

const NAV_LINKS = [
  { href: '/',            label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/portfolio',   label: 'Portfolio',   icon: Briefcase },
  { href: '/watchlist',   label: 'Watchlist',   icon: Star },
  { href: '/backtesting', label: 'Backtesting', icon: FlaskConical },
  { href: '/predictions', label: 'Predictions', icon: Sparkles },
]

function getInitials(name?: string | null): string {
  if (!name) return 'U'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function Header({ onSearch }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Fixed transparent header — two rows: logo/icons + nav */}
      <header
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: 'oklch(0.04 0.004 65 / 0.80)',
          backdropFilter: 'blur(18px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
          borderBottom: '1px solid oklch(0.74 0.18 68 / 0.08)',
        }}
      >
        {/* Row 1: Logo center + icons right */}
        <div className="relative h-16">

          {/* Top-center: Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-2.5 group"
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-primary/50 group-hover:ring-primary transition-all duration-300"
              style={{
                background: 'oklch(0.075 0.01 65 / 0.7)',
                boxShadow: '0 0 14px oklch(0.74 0.18 68 / 0.25)',
              }}
            >
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
            <span
              className="text-sm font-semibold tracking-widest uppercase text-foreground/85 group-hover:text-foreground transition-colors duration-200"
              style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.16em' }}
            >
              <span className="text-primary">Stoc</span>Flow
            </span>
          </Link>

          {/* Top-right: Search + Portfolio + User */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">

            <button
              onClick={() => setSearchOpen(v => !v)}
              className="h-8 w-8 flex items-center justify-center text-foreground/50 hover:text-primary transition-colors duration-200"
              aria-label="Search"
            >
              <Search className="h-[17px] w-[17px]" strokeWidth={1.5} />
            </button>

            <Link
              href="/portfolio"
              className="h-8 w-8 flex items-center justify-center text-foreground/50 hover:text-primary transition-colors duration-200"
              aria-label="Portfolio"
            >
              <Briefcase className="h-[17px] w-[17px]" strokeWidth={1.5} />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0 hover:ring-1 hover:ring-primary/40 transition-all"
                  aria-label="User menu"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name ?? 'User'} />
                    <AvatarFallback className="text-[10px] bg-primary/15 text-primary font-semibold">
                      {getInitials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session?.user?.name ?? 'Trader'}</p>
                    <p className="text-xs text-muted-foreground">{session?.user?.email ?? ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2: Horizontal nav links — centered, uppercase tracking */}
        <nav
          className="hidden md:flex items-center justify-center gap-8 h-10 border-t"
          style={{ borderColor: 'oklch(0.74 0.18 68 / 0.08)' }}
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[10px] font-medium tracking-[0.18em] uppercase transition-colors duration-200 relative group ${
                  active ? 'text-primary' : 'text-foreground/45 hover:text-foreground/80'
                }`}
              >
                {link.label}
                {/* Active underline */}
                <span
                  className={`absolute -bottom-2.5 left-0 right-0 h-px transition-all duration-200 ${
                    active ? 'bg-primary opacity-100' : 'bg-primary opacity-0 group-hover:opacity-40'
                  }`}
                />
              </Link>
            )
          })}
        </nav>

        {/* Expandable search overlay */}
        {searchOpen && (
          <div
            className="absolute top-full right-6 mt-1 w-64"
            style={{
              background: 'oklch(0.075 0.01 65 / 0.96)',
              backdropFilter: 'blur(20px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
              border: '1px solid oklch(0.24 0.020 68 / 0.6)',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 24px oklch(0.00 0.00 0 / 0.4)',
            }}
          >
            <div className="relative p-2">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search stocks..."
                className="pl-9 bg-transparent border-none h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                onChange={(e) => onSearch?.(e.target.value)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              />
            </div>
          </div>
        )}
      </header>

      {/* Bottom-center: Circular glassmorphic MENU button (mobile only) */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'oklch(0.075 0.01 65 / 0.72)',
              backdropFilter: 'blur(14px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(14px) saturate(1.5)',
              border: '1px solid oklch(0.74 0.18 68 / 0.30)',
              boxShadow:
                '0 0 0 1px oklch(0.74 0.18 68 / 0.10), 0 8px 32px oklch(0.00 0.00 0 / 0.55), 0 0 20px oklch(0.74 0.18 68 / 0.10)',
            }}
            aria-label="Open navigation menu"
          >
            <span className="text-[9px] font-bold tracking-[0.22em] text-primary/90 uppercase">
              MENU
            </span>
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="w-72 bg-card border-border/60">
          <SheetHeader>
            <SheetTitle className="text-left flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)' }}>
                <span className="text-primary">Stoc</span>Flow
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search stocks..."
              className="pl-9 bg-secondary/50 border-border/60"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>

          <nav className="mt-5 space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-primary/12 text-primary ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : ''}`} />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-6 left-6 right-6 border-t border-border/40 pt-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-3 py-2 rounded-lg hover:bg-muted/50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
