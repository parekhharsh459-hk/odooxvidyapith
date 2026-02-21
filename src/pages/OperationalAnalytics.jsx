import { useMemo } from 'react'

const exportCSV = (rows, filename) => {
    const headers = Object.keys(rows[0] || {}).join(',')
    const body = rows.map(r => Object.values(r).join(',')).join('\n')
    const blob = new Blob([headers + '\n' + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
}

// Simple horizontal bar chart
const HBar = ({ label, value, max, color = '#6366F1', prefix = '', suffix = '' }) => (
    <div className="flex items-center gap-3">
        <span className="text-xs text-gray-600 w-32 truncate shrink-0">{label}</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: color }} />
        </div>
        <span className="text-xs font-semibold text-gray-700 w-20 text-right shrink-0">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</span>
    </div>
)

export default function OperationalAnalytics({ vehicles, fuel, maintenance, trips }) {
    const metrics = useMemo(() => {
        return vehicles.map(v => {
            const vFuel = fuel.filter(f => f.vehicleId === v.id)
            const vMaint = maintenance.filter(m => m.vehicleId === v.id)
            const fuelL = vFuel.reduce((s, f) => s + f.liters, 0)
            const fuelC = vFuel.reduce((s, f) => s + f.cost, 0)
            const maintC = vMaint.reduce((s, m) => s + m.cost, 0)
            const totalOps = fuelC + maintC
            const fuelEff = fuelL > 0 ? +(v.odometer / fuelL).toFixed(2) : 0
            const roi = v.acqCost > 0 ? +((v.revenue - totalOps) / v.acqCost * 100).toFixed(1) : 0
            return { id: v.id, name: v.name, plate: v.plate, type: v.type, fuelL, fuelC, maintC, totalOps, fuelEff, roi, revenue: v.revenue, acqCost: v.acqCost }
        })
    }, [vehicles, fuel, maintenance])

    const tripStats = useMemo(() => {
        const total = trips.length
        const completed = trips.filter(t => t.status === 'Completed').length
        const dispatched = trips.filter(t => t.status === 'Dispatched').length
        const cancelled = trips.filter(t => t.status === 'Cancelled').length
        const draft = trips.filter(t => t.status === 'Draft').length
        return { total, completed, dispatched, cancelled, draft }
    }, [trips])

    const maxROI = Math.max(...metrics.map(m => Math.abs(m.roi)), 1)
    const maxEff = Math.max(...metrics.map(m => m.fuelEff), 1)
    const maxRev = Math.max(...metrics.map(m => m.revenue), 1)
    const maxOps = Math.max(...metrics.map(m => m.totalOps), 1)

    const totalRevenue = vehicles.reduce((s, v) => s + v.revenue, 0)
    const totalFuel = fuel.reduce((s, f) => s + f.cost, 0)
    const totalMaint = maintenance.reduce((s, m) => s + m.cost, 0)
    const totalOps = totalFuel + totalMaint
    const netProfit = totalRevenue - totalOps

    const csvData = metrics.map(m => ({
        Vehicle: m.name, Plate: m.plate, Type: m.type,
        'Fuel (L)': m.fuelL, 'Fuel Cost (₹)': m.fuelC, 'Maint Cost (₹)': m.maintC,
        'Total Ops (₹)': m.totalOps, 'Fuel Efficiency (km/L)': m.fuelEff,
        'Revenue (₹)': m.revenue, 'ROI (%)': m.roi,
    }))

    return (
        <div className="space-y-4 max-w-[1400px]">
            {/* Top KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: '#10B981' },
                    { label: 'Total Ops Cost', value: `₹${totalOps.toLocaleString()}`, icon: '💸', color: '#EF4444' },
                    { label: 'Net Profit', value: `₹${Math.abs(netProfit).toLocaleString()}`, icon: netProfit >= 0 ? '📈' : '📉', color: netProfit >= 0 ? '#6366F1' : '#EF4444' },
                    { label: 'Fleet Avg ROI', value: `${metrics.length ? (metrics.reduce((s, m) => s + m.roi, 0) / metrics.length).toFixed(1) : 0}%`, icon: '🎯', color: '#8B5CF6' },
                ].map(k => (
                    <div key={k.label} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                        <div className="text-2xl mb-2">{k.icon}</div>
                        <p className="text-xl font-bold mt-1" style={{ fontFamily: 'Rajdhani,sans-serif', color: k.color }}>{k.value}</p>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{k.label}</p>
                    </div>
                ))}
            </div>

            {/* Trip Completion Stats */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">Trip Completion Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Trips', val: tripStats.total, color: '#6366F1' },
                        { label: 'Completed', val: tripStats.completed, color: '#10B981' },
                        { label: 'Dispatched', val: tripStats.dispatched, color: '#F59E0B' },
                        { label: 'Cancelled', val: tripStats.cancelled, color: '#EF4444' },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <div className="text-3xl font-bold" style={{ color: s.color, fontFamily: 'Rajdhani,sans-serif' }}>{s.val}</div>
                            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                            {tripStats.total > 0 && <div className="text-[10px] text-gray-400">{Math.round(s.val / tripStats.total * 100)}% of total</div>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                {/* Fuel Efficiency */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">⛽ Fuel Efficiency (km / L)</h3>
                    <div className="space-y-3">
                        {metrics.filter(m => m.fuelEff > 0).sort((a, b) => b.fuelEff - a.fuelEff).map(m => (
                            <HBar key={m.id} label={m.name} value={m.fuelEff} max={maxEff} color="#6366F1" suffix=" km/L" />
                        ))}
                        {metrics.filter(m => m.fuelEff > 0).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No fuel data yet.</p>}
                    </div>
                </div>

                {/* Vehicle ROI */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">🎯 Vehicle ROI (%)</h3>
                    <div className="space-y-3">
                        {[...metrics].sort((a, b) => b.roi - a.roi).map(m => (
                            <HBar key={m.id} label={m.name} value={Math.abs(m.roi)} max={maxROI} color={m.roi >= 0 ? '#10B981' : '#EF4444'} suffix="%" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                {/* Revenue by vehicle */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">💰 Revenue per Vehicle</h3>
                    <div className="space-y-3">
                        {[...metrics].sort((a, b) => b.revenue - a.revenue).map(m => (
                            <HBar key={m.id} label={m.name} value={m.revenue} max={maxRev} color="#10B981" prefix="₹" />
                        ))}
                    </div>
                </div>

                {/* Ops cost by vehicle */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">💸 Total Ops Cost per Vehicle</h3>
                    <div className="space-y-3">
                        {[...metrics].filter(m => m.totalOps > 0).sort((a, b) => b.totalOps - a.totalOps).map(m => (
                            <HBar key={m.id} label={m.name} value={m.totalOps} max={maxOps} color="#EF4444" prefix="₹" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed table + CSV export */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Per-Vehicle Analytics</h3>
                    <button onClick={() => exportCSV(csvData, 'fleetflow_analytics.csv')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
                        ⬇ Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 text-left whitespace-nowrap">Vehicle</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Type</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Fuel (L)</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Fuel Cost</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Maint Cost</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Total Ops</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Efficiency</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Revenue</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">ROI</th>
                        </tr></thead>
                        <tbody>
                            {metrics.map(m => (
                                <tr key={m.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3"><p className="font-medium text-gray-800 text-xs">{m.name}</p><p className="font-mono text-[10px] text-gray-400">{m.plate}</p></td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">{m.type}</td>
                                    <td className="px-4 py-3 text-gray-600">{m.fuelL.toLocaleString()} L</td>
                                    <td className="px-4 py-3 text-indigo-600 font-semibold">₹{m.fuelC.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-amber-600 font-semibold">₹{m.maintC.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-red-500 font-bold">₹{m.totalOps.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-gray-600">{m.fuelEff > 0 ? `${m.fuelEff} km/L` : '—'}</td>
                                    <td className="px-4 py-3 text-green-600 font-semibold">₹{m.revenue.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-bold text-xs ${m.roi >= 0 ? 'text-green-600' : 'text-red-500'}`}>{m.roi}%</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
