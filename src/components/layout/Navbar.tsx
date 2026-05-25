import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, ListTodo, Sprout, Menu } from 'lucide-react'
import { useState } from 'react'
import { CoinBadge } from './CoinBadge'

const links = [
  { to: '/', label: 'لوحة التركيز', icon: LayoutGrid },
  { to: '/tasks', label: 'المهام', icon: ListTodo },
  { to: '/farm', label: 'المزرعة', icon: Sprout },
]

export function Navbar() {
  const loc = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-deep/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-accent">
          Focus OS
        </Link>
        <div className="hidden items-center gap-4 md:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1 text-sm transition ${
                loc.pathname === to ? 'text-accent' : 'text-white/70 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <CoinBadge />
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <CoinBadge />
          <button type="button" onClick={() => setOpen((o) => !o)} className="p-2 text-white/80">
            <Menu size={22} />
          </button>
        </div>
      </div>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-col gap-2 border-t border-white/10 px-4 py-3 md:hidden"
        >
          {links.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="py-2 text-sm">
              {label}
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  )
}
