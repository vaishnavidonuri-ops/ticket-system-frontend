import { useEffect, useState, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, type SortingState, type ColumnDef,
} from "@tanstack/react-table"
import { Search, RefreshCw, X, ChevronUp, ChevronDown, ChevronsUpDown, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { AppShell } from "@/components/layout/AppShell"
import { StatusBadge, PriorityBadge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { API, formatDate, CURRENT_USER } from "@/lib/utils"
import departments from "@/data/departments.json"
import users from "@/data/users.json"

const PAGE_SIZE = 20

interface Ticket {
  id: number
  ticketNumber?: string
  title: string
  status: string
  priority: string
  department: string
  issueType?: string
  assignedTo?: string
  assignedToName?: string
  createdAt: string
}

const getUserName = (id: string) => (users as Array<{ id: string; name: string }>).find(u => u.id === id)?.name ?? id

export default function TicketListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [data, setData]       = useState<Ticket[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }])

  const [filters, setFilters] = useState({
    search:     searchParams.get("search")     ?? "",
    status:     searchParams.get("status")     ?? "",
    priority:   searchParams.get("priority")   ?? "",
    department: searchParams.get("department") ?? "",
    assignedTo: searchParams.get("assignedTo") ?? "",
  })

  const sort = sorting[0]
  const sortColMap: Record<string, string> = {
    createdAt: "created_at", status: "status", priority: "priority", id: "id",
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String((page - 1) * PAGE_SIZE),
        sortBy:    sort ? (sortColMap[sort.id] ?? sort.id) : "created_at",
        sortOrder: sort ? (sort.desc ? "DESC" : "ASC") : "DESC",
      })
      if (filters.search)     p.set("search",     filters.search)
      if (filters.status)     p.set("status",     filters.status)
      if (filters.priority)   p.set("priority",   filters.priority)
      if (filters.department) p.set("department", filters.department)
      if (filters.assignedTo) p.set("assigned_to", filters.assignedTo)

      const res  = await fetch(`${API}/tickets/all?${p}`)
      const json = await res.json()
      setData(json.data?.rows ?? json.data ?? [])
      setTotal(json.data?.total ?? json.total ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, filters, sort])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [filters])

  const columns: ColumnDef<Ticket>[] = [
    {
      id: "id",
      header: "ID",
      accessorFn: row => row.ticketNumber ?? `#${String(row.id).padStart(6, "0")}`,
      cell: info => (
        <span className="font-mono text-xs text-blue-600 font-semibold">{info.getValue<string>()}</span>
      ),
      size: 90,
    },
    {
      id: "title",
      header: "Subject",
      accessorKey: "title",
      enableSorting: false,
      cell: info => (
        <div>
          <div className="text-sm font-medium text-slate-800 line-clamp-1">{info.getValue<string>()}</div>
          {info.row.original.issueType && (
            <div className="text-xs text-slate-400 mt-0.5">{info.row.original.issueType}</div>
          )}
        </div>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      accessorKey: "priority",
      cell: info => <PriorityBadge priority={info.getValue<string>()} />,
      size: 100,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: info => <StatusBadge status={info.getValue<string>()} />,
      size: 110,
    },
    {
      id: "assignedTo",
      header: "Technician",
      enableSorting: false,
      accessorKey: "assignedTo",
      cell: info => {
        const id = info.getValue<string>()
        return id ? (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-xs text-slate-700">{getUserName(id)}</span>
          </div>
        ) : <span className="text-xs text-slate-400">Not Assigned</span>
      },
      size: 140,
    },
    {
      id: "department",
      header: "Group",
      accessorKey: "department",
      enableSorting: false,
      cell: info => <span className="text-xs text-slate-500">{info.getValue<string>() || "—"}</span>,
      size: 120,
    },
    {
      id: "createdAt",
      header: "Created On",
      accessorKey: "createdAt",
      cell: info => <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(info.getValue<string>())}</span>,
      size: 100,
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: Math.ceil(total / PAGE_SIZE),
  })

  const totalPages  = Math.ceil(total / PAGE_SIZE)
  const hasFilters  = Object.values(filters).some(Boolean)
  const clearFilter = () => setFilters({ search: "", status: "", priority: "", department: "", assignedTo: "" })

  const SortIcon = ({ id }: { id: string }) => {
    const s = sorting.find(x => x.id === id)
    if (!s) return <ChevronsUpDown className="h-3 w-3 text-slate-300 ml-1" />
    return s.desc
      ? <ChevronDown className="h-3 w-3 text-blue-500 ml-1" />
      : <ChevronUp   className="h-3 w-3 text-blue-500 ml-1" />
  }

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard", path: "/" }, { label: "All Requests" }]}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">All Requests</h1>
            <p className="text-xs text-slate-500 mt-0.5">{total} request{total !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate("/create-ticket")}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New Incident
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-2 shadow-sm">
          {/* Search */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 gap-2 w-52 focus-within:border-blue-400 focus-within:bg-white transition-all">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
              placeholder="Search requests…"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
            {filters.search && (
              <button onClick={() => setFilters(f => ({ ...f, search: "" }))} className="text-slate-300 hover:text-slate-500">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Status */}
          <select
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:border-blue-400"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>

          {/* Priority */}
          <select
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:border-blue-400"
            value={filters.priority}
            onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
          >
            <option value="">All Priority</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          {/* Department */}
          <select
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:border-blue-400"
            value={filters.department}
            onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
          >
            <option value="">All Groups</option>
            {(departments as string[]).map(d => <option key={d}>{d}</option>)}
          </select>

          {/* Technician */}
          <select
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:border-blue-400"
            value={filters.assignedTo}
            onChange={e => setFilters(f => ({ ...f, assignedTo: e.target.value }))}
          >
            <option value="">All Technicians</option>
            {(users as Array<{ id: string; name: string }>).map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilter}>
              <X className="h-3.5 w-3.5 mr-1" /> Clear filters
            </Button>
          )}

          {/* Assigned-to-me quick filter */}
          <button
            onClick={() => setFilters(f => ({ ...f, assignedTo: f.assignedTo === CURRENT_USER.id ? "" : CURRENT_USER.id }))}
            className={`ml-auto text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filters.assignedTo === CURRENT_USER.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            }`}
          >
            My Tickets
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">Loading requests…</div>
          ) : data.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-3xl mb-2">🔍</div>
              <div className="text-sm font-semibold text-slate-600">No requests found</div>
              <div className="text-xs text-slate-400 mt-1">Try adjusting your filters or create a new request.</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    {table.getHeaderGroups().map(hg => (
                      <tr key={hg.id}>
                        {hg.headers.map(h => (
                          <th
                            key={h.id}
                            onClick={h.column.getCanSort() ? h.column.getToggleSortingHandler() : undefined}
                            className={`px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap select-none ${h.column.getCanSort() ? "cursor-pointer hover:text-slate-700" : ""}`}
                            style={{ width: h.column.columnDef.size }}
                          >
                            <span className="flex items-center">
                              {flexRender(h.column.columnDef.header, h.getContext())}
                              {h.column.getCanSort() && <SortIcon id={h.column.id} />}
                            </span>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {table.getRowModel().rows.map(row => (
                      <tr
                        key={row.id}
                        onClick={() => navigate(`/tickets/${row.original.id}`)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <div className="text-xs text-slate-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} records
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(1)}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                    const pg = start + i
                    return pg <= totalPages ? (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                          page === pg
                            ? "bg-blue-600 text-white"
                            : "text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {pg}
                      </button>
                    ) : null
                  })}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(totalPages)}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronsRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
