import { TrendingUp } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background px-4"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, oklch(0.72 0.13 72 / 0.10) 0%, transparent 55%),
          radial-gradient(ellipse at 100% 100%, oklch(0.72 0.13 72 / 0.05) 0%, transparent 50%)
        `,
      }}
    >
      {/* Thin amber line at top */}
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="mb-10 flex flex-col items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/30"
          style={{ boxShadow: '0 0 40px oklch(0.72 0.13 72 / 0.15)' }}
        >
          <TrendingUp className="h-7 w-7 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            <span className="text-primary">Stoc</span>
            <span className="text-foreground">Flow</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">
            Reinventing Stocks
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
