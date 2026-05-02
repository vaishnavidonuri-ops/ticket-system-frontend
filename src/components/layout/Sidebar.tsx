import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Ticket, Plus, User, Clock,
  Settings, ChevronRight, HelpCircle, BarChart3
} from "lucide-react"

const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { path: "/",          icon: LayoutDashboard, label: "Dashboard" },
      { path: "/tickets",   icon: Ticket,          label: "All Requests",  count: 0 },
      { path: "/my-tickets",icon: User,            label: "My Tickets" },
    ]
  },
  {
    label: "Manage",
    items: [
      { path: "/create-ticket", icon: Plus,      label: "New Incident" },
      { path: "/sla",           icon: Clock,     label: "SLA Rules" },
      { path: "/reports",       icon: BarChart3, label: "Reports" },
    ]
  },
  {
    label: "System",
    items: [
      { path: "/settings", icon: Settings,   label: "Settings" },
      { path: "/help",     icon: HelpCircle, label: "Help & Support" },
    ]
  }
]

export const Sidebar = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [hovered, setHovered] = useState(false)

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path)

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen bg-[#1c2340] z-50 flex flex-col transition-all duration-200 ease-in-out overflow-hidden",
        hovered ? "w-[220px]" : "w-14"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-14 px-3.5 border-b border-white/10 shrink-0 overflow-hidden">
        <div className="w-7 h-7 shrink-0 bg-red-600 rounded-md flex items-center justify-center font-black text-white text-sm select-none">
          V
        </div>
        <div className={cn("transition-opacity duration-150 whitespace-nowrap", hovered ? "opacity-100" : "opacity-0")}>
          <div className="text-white font-bold text-sm leading-tight">visaka</div>
          <div className="text-slate-400 text-[10px] leading-tight">IT Helpdesk</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className={cn(
              "px-3.5 mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap transition-opacity duration-150",
              hovered ? "opacity-100" : "opacity-0"
            )}>
              {group.label}
            </div>
            {group.items.map(item => {
              const active = isActive(item.path)
              const Icon   = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={item.label}
                  className={cn(
                    "w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all border-l-2",
                    "hover:bg-white/8",
                    active
                      ? "bg-[#2e3a62] text-white border-blue-400"
                      : "text-slate-400 border-transparent hover:text-slate-200"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5 shrink-0", active ? "text-blue-400" : "")} size={18} />
                  <span className={cn("whitespace-nowrap transition-opacity duration-150", hovered ? "opacity-100" : "opacity-0")}>
                    {item.label}
                  </span>
                  {"count" in item && item.count! > 0 && hovered && (
                    <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.count}
                    </span>
                  )}
                  {active && hovered && <ChevronRight className="ml-auto h-3 w-3 text-blue-400 shrink-0" />}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom user */}
      <div className={cn(
        "border-t border-white/10 px-3.5 py-3 flex items-center gap-3 overflow-hidden shrink-0"
      )}>
        <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
          AJ
        </div>
        <div className={cn("transition-opacity duration-150 whitespace-nowrap min-w-0", hovered ? "opacity-100" : "opacity-0")}>
          <div className="text-white text-xs font-semibold truncate">Alice Johnson</div>
          <div className="text-slate-400 text-[10px] truncate">IT Support</div>
        </div>
      </div>
    </aside>
  )
}
