import { useMemo, useState } from 'react'

// ─── Reusable helpers ─────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, icon, color }) => (
    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: color + '18' }}>{icon}</div>
        <div className="min-w-0 flex-1">
            <p className="text-xl font-bold text-gray-900 whitespace-nowrap" style={{ fontFamily: 'Rajdhani,sans-serif' }}>{value}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-tight mt-0.5 truncate">{label}</p>
            {sub && <p className="text-[10px] text-gray-400 truncate">{sub}</p>}
        </div>
    </div>
)

// Compact horizontal bar chart (status distribution)
const BarChart = ({ data, title }) => {
    const max = Math.max(...data.map(d => d.value), 1)
    const total = data.reduce((s, d) => s + d.value, 0)
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm h-full">
            <h3 className="font-semibold text-gray-700 mb-4 text-xs uppercase tracking-wider">{title}</h3>
            <div className="space-y-3">
                {data.map((d, i) => (
                    <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 font-medium">{d.label}</span>
                            <span className="text-xs font-bold text-gray-800">{d.value} <span className="text-gray-400 font-normal">({total ? Math.round(d.value / total * 100) : 0}%)</span></span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${total ? Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0) : 0}%`, background: d.color }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">Total fleet: <span className="font-semibold text-gray-600">{total} vehicles</span></p>
        </div>
    )
}

// Compact donut chart (vehicle type)
const PieChart = ({ data, title }) => {
    const total = data.reduce((s, d) => s + d.value, 0) || 1
    const COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6']
    const R = 36, CX = 50, CY = 50, STROKE = 14
    let cumulative = 0
    const circumference = 2 * Math.PI * R

    const slices = data.map((d, i) => {
        const pct = d.value / total
        const dash = pct * circumference
        const slice = { color: COLORS[i % COLORS.length], dash, offset: circumference - cumulative * circumference, label: d.label, pct: Math.round(pct * 100), value: d.value }
        cumulative += pct
        return slice
    })

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm h-full">
            <h3 className="font-semibold text-gray-700 mb-4 text-xs uppercase tracking-wider">{title}</h3>
            <div className="flex items-center gap-5">
                {/* Fixed-size donut SVG */}
                <div className="shrink-0 relative" style={{ width: 100, height: 100 }}>
                    <svg viewBox="0 0 100 100" width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Background ring */}
                        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F3F4F6" strokeWidth={STROKE} />
                        {slices.map((s, i) => (
                            <circle key={i} cx={CX} cy={CY} r={R} fill="none"
                                stroke={s.color} strokeWidth={STROKE}
                                strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                                strokeDashoffset={s.offset}
                                style={{ transition: 'stroke-dasharray 0.6s ease' }}
                            />
                        ))}
                    </svg>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-gray-800" style={{ fontFamily: 'Rajdhani,sans-serif' }}>{data.reduce((s, d) => s + d.value, 0)}</span>
                        <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">vehicles</span>
                    </div>
                </div>
                {/* Legend */}
                <div className="space-y-2 flex-1 min-w-0">
                    {slices.map((s, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                                <span className="text-xs text-gray-600 truncate">{s.label}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-700 shrink-0">{s.value} <span className="text-gray-400 font-normal text-[10px]">({s.pct}%)</span></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const ActivityFeed = ({ activity }) => {
    const typeStyle = { dispatch: '🟢', maintenance: '🔴', complete: '✅', add: '➕', alert: '⚠️', info: 'ℹ️', fuel: '⛽', cancel: '🔴' }
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">Recent Activity</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {activity.slice(0, 12).map(a => (
                    <div key={a.id} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                        <span className="text-sm mt-0.5 shrink-0">{typeStyle[a.type] || 'ℹ️'}</span>
                        <div className="min-w-0">
                            <p className="text-sm text-gray-700 leading-snug">{a.msg}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function CommandCenter({ vehicles, trips, maintenance, fuel, activity }) {
    const [filterType, setFilterType] = useState('All')
    const [filterStatus, setFilterStatus] = useState('All')
    const [filterRegion, setFilterRegion] = useState('All')

    const filtered = useMemo(() => vehicles.filter(v =>
        (filterType === 'All' || v.type === filterType) &&
        (filterStatus === 'All' || v.status === filterStatus) &&
        (filterRegion === 'All' || v.region === filterRegion)
    ), [vehicles, filterType, filterStatus, filterRegion])

    const kpis = useMemo(() => {
        const total = vehicles.length
        const onTrip = vehicles.filter(v => v.status === 'On Trip').length
        const inShop = vehicles.filter(v => v.status === 'In Shop').length
        const avail = vehicles.filter(v => v.status === 'Available').length
        const util = total ? Math.round((onTrip / total) * 100) : 0
        const pending = trips.filter(t => t.status === 'Draft').length
        return { total, onTrip, inShop, avail, util, pending }
    }, [vehicles, trips])

    const barData = useMemo(() => {
        const counts = { Available: 0, 'On Trip': 0, 'In Shop': 0, 'Out of Service': 0 }
        filtered.forEach(v => counts[v.status] = (counts[v.status] || 0) + 1)
        return [
            { label: 'Available', value: counts['Available'], color: '#10B981' },
            { label: 'On Trip', value: counts['On Trip'], color: '#6366F1' },
            { label: 'In Shop', value: counts['In Shop'], color: '#F59E0B' },
            { label: 'Out of Service', value: counts['Out of Service'], color: '#EF4444' },
        ]
    }, [filtered])

    const pieData = useMemo(() => {
        const counts = { Truck: 0, Van: 0, Bike: 0 }
        vehicles.forEach(v => counts[v.type] = (counts[v.type] || 0) + 1)
        return Object.entries(counts).filter(([, v]) => v > 0).map(([label, value]) => ({ label, value }))
    }, [vehicles])

    const regions = [...new Set(vehicles.map(v => v.region))]

    const Sel = ({ label, val, setVal, opts }) => (
        <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</label>
            <select value={val} onChange={e => setVal(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-indigo-400">
                <option value="All">All</option>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    )

    return (
        <div className="space-y-6 max-w-[1400px]">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI icon="🚛" label="Active Fleet" value={kpis.onTrip} sub={`of ${kpis.total} vehicles`} color="#6366F1" />
                <KPI icon="🔧" label="Maintenance Alerts" value={kpis.inShop} sub="vehicles in shop" color="#F59E0B" />
                <KPI icon="📈" label="Utilization Rate" value={`${kpis.util}%`} sub={`${kpis.avail} idle`} color="#10B981" />
                <KPI icon="📦" label="Pending Cargo" value={kpis.pending} sub="trips in draft" color="#8B5CF6" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
                <Sel label="Vehicle Type" val={filterType} setVal={setFilterType} opts={['Truck', 'Van', 'Bike']} />
                <Sel label="Status" val={filterStatus} setVal={setFilterStatus} opts={['Available', 'On Trip', 'In Shop', 'Out of Service']} />
                <Sel label="Region" val={filterRegion} setVal={setFilterRegion} opts={regions} />
                <button onClick={() => { setFilterType('All'); setFilterStatus('All'); setFilterRegion('All'); }}
                    className="text-xs text-indigo-500 hover:text-indigo-700 font-medium mt-5 transition-colors">Reset</button>
                <span className="text-xs text-gray-400 mt-5">{filtered.length} of {vehicles.length} vehicles</span>
            </div>

            {/* Charts + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-stretch">
                <div className="lg:col-span-2"><BarChart data={barData} title="Fleet Status Distribution" /></div>
                <div className="lg:col-span-1"><PieChart data={pieData} title="By Vehicle Type" /></div>
                <div className="lg:col-span-2"><ActivityFeed activity={activity} /></div>
            </div>

            {/* Filtered vehicle mini-list */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Fleet Overview</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-5 py-3 text-left">Vehicle</th>
                            <th className="px-5 py-3 text-left">Plate</th>
                            <th className="px-5 py-3 text-left">Type</th>
                            <th className="px-5 py-3 text-left">Region</th>
                            <th className="px-5 py-3 text-left">Odometer</th>
                            <th className="px-5 py-3 text-left">Status</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map((v, i) => (
                                <tr key={v.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-gray-800">{v.name}</td>
                                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{v.plate}</td>
                                    <td className="px-5 py-3 text-gray-600">{v.type}</td>
                                    <td className="px-5 py-3 text-gray-600">{v.region}</td>
                                    <td className="px-5 py-3 text-gray-600">{(v.odometer || 0).toLocaleString()} km</td>
                                    <td className="px-5 py-3"><StatusPill status={v.status} /></td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No vehicles match the selected filters.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// Status pill exported for reuse
export const StatusPill = ({ status }) => {
    const styles = {
        'Available': 'bg-green-100 text-green-700',
        'On Trip': 'bg-indigo-100 text-indigo-700',
        'In Shop': 'bg-amber-100 text-amber-700',
        'Out of Service': 'bg-red-100 text-red-700',
        'Draft': 'bg-gray-100 text-gray-600',
        'Dispatched': 'bg-indigo-100 text-indigo-700',
        'Completed': 'bg-green-100 text-green-700',
        'Cancelled': 'bg-red-100 text-red-700',
        'On Duty': 'bg-indigo-100 text-indigo-700',
        'Off Duty': 'bg-gray-100 text-gray-500',
        'Suspended': 'bg-red-100 text-red-700',
        'Valid': 'bg-green-100 text-green-700',
        'Expired': 'bg-red-100 text-red-700',
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    )
}
