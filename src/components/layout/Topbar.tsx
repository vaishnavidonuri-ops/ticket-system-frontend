import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Bell, Zap, History, HelpCircle, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TopbarProps {
  title?: string
  breadcrumbs?: { label: string; path?: string }[]
}

export const Topbar = ({ title, breadcrumbs }: TopbarProps) => {
  const navigate     = useNavigate()
  const [search, setSearch] = useState("")
  const [showMenu, setShowMenu] = useState(false)

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/tickets?search=${encodeURIComponent(search.trim())}`)
      setSearch("")
    }
  }

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 gap-3 sticky top-0 z-40 shadow-sm">
      {/* Brand */}
      <span className="text-red-600 font-black text-lg tracking-tight select-none">visaka</span>
      <div className="h-5 w-px bg-slate-200 mx-1" />

      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="flex items-center gap-1.5 text-sm text-slate-500">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-300">/</span>}
              {b.path ? (
                <button onClick={() => navigate(b.path!)} className="hover:text-blue-600 transition-colors">
                  {b.label}
                </button>
              ) : (
                <span className="text-slate-800 font-semibold">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : (
        <span className="text-sm font-semibold text-slate-700">{title ?? "Dashboard"}</span>
      )}

      <div className="flex-1" />

      {/* Global search */}
      <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 gap-2 w-64 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-sm transition-all">
        <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <input
          className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
          placeholder="Search requests…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* Icon bar */}
      <div className="flex items-center gap-1">
        {[
          { Icon: Zap,      tip: "Quick actions", onClick: () => setShowMenu(!showMenu) },
          { Icon: History,  tip: "History" },
          { Icon: HelpCircle, tip: "Help" },
        ].map(({ Icon, tip, onClick }) => (
          <button
            key={tip}
            title={tip}
            onClick={onClick}
            className="h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        {/* Notification */}
        <button className="relative h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
            9
          </span>
        </button>
      </div>

      {/* Create button */}
      <Button variant="primary" size="sm" onClick={() => navigate("/create-ticket")} className="rounded-full gap-1.5 ml-1">
        <Plus className="h-3.5 w-3.5" />
        New
      </Button>

      {/* User avatar */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">AJ</div>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-10 z-20 bg-white rounded-xl border border-slate-200 shadow-xl w-48 py-1 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-800">Alice Johnson</div>
                <div className="text-xs text-slate-400">EMP001 • IT Support</div>
              </div>
              {[
                { label: "My Tickets", action: () => navigate("/my-tickets") },
                { label: "Settings",   action: () => {} },
                { label: "Sign out",   action: () => {}, danger: true },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setShowMenu(false) }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors",
                    "danger" in item && item.danger ? "text-red-600 hover:bg-red-50" : "text-slate-700"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
