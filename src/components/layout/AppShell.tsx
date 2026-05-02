import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

interface AppShellProps {
  children: React.ReactNode
  title?: string
  breadcrumbs?: { label: string; path?: string }[]
}

export const AppShell = ({ children, title, breadcrumbs }: AppShellProps) => (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0 pl-14">
      <Topbar title={title} breadcrumbs={breadcrumbs} />
      <main className="flex-1 p-5 overflow-auto">{children}</main>
    </div>
  </div>
)
