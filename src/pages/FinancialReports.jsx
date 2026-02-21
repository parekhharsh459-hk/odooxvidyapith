import { useMemo } from 'react'

export default function FinancialReports({ vehicles, fuel, maintenance, trips }) {
    const summary = useMemo(() => {
        const totalRevenue = vehicles.reduce((s, v) => s + (v.revenue || 0), 0)
        const totalFuelCost = fuel.reduce((s, f) => s + f.cost, 0)
        const totalMaintCost = maintenance.reduce((s, m) => s + m.cost, 0)
        const totalAcqCost = vehicles.reduce((s, v) => s + (v.acqCost || 0), 0)
        const totalOps = totalFuelCost + totalMaintCost
        const netProfit = totalRevenue - totalOps
        const fleetROI = totalAcqCost > 0 ? +((netProfit / totalAcqCost) * 100).toFixed(2) : 0
        const completedTrips = trips.filter(t => t.status === 'Completed').length
        const avgTripRev = completedTrips > 0 ? Math.round(totalRevenue / completedTrips) : 0
        return { totalRevenue, totalFuelCost, totalMaintCost, totalAcqCost, totalOps, netProfit, fleetROI, completedTrips, avgTripRev }
    }, [vehicles, fuel, maintenance, trips])

    const vehicleFinancials = useMemo(() =>
        vehicles.map(v => {
            const fuelCost = fuel.filter(f => f.vehicleId === v.id).reduce((s, f) => s + f.cost, 0)
            const maintCost = maintenance.filter(m => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0)
            const totalOps = fuelCost + maintCost
            const roi = v.acqCost > 0 ? +((v.revenue - totalOps) / v.acqCost * 100).toFixed(1) : 0
            return { ...v, fuelCost, maintCost, totalOps, roi }
        }).sort((a, b) => b.revenue - a.revenue)
        , [vehicles, fuel, maintenance])

    const Card = ({ label, value, sub, icon, positive }) => (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold mt-1" style={{ fontFamily: 'Rajdhani,sans-serif', color: positive === true ? '#10B981' : positive === false ? '#EF4444' : '#111827' }}>{value}</p>
                    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
                </div>
                <div className="text-2xl">{icon}</div>
            </div>
        </div>
    )

    return (
        <div className="space-y-4 max-w-[1400px]">
            {/* P&L Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card label="Total Revenue" value={`₹${summary.totalRevenue.toLocaleString()}`} icon="💰" positive={true} />
                <Card label="Total Ops Cost" value={`₹${summary.totalOps.toLocaleString()}`} icon="💸" positive={false} />
                <Card label="Net Profit / Loss" value={`${summary.netProfit >= 0 ? '+' : '−'}₹${Math.abs(summary.netProfit).toLocaleString()}`} icon={summary.netProfit >= 0 ? '📈' : '📉'} positive={summary.netProfit >= 0} />
                <Card label="Fleet ROI" value={`${summary.fleetROI}%`} icon="🎯" positive={summary.fleetROI >= 0} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card label="Total Acquisition" value={`₹${summary.totalAcqCost.toLocaleString()}`} icon="🏭" />
                <Card label="Fuel Expenditure" value={`₹${summary.totalFuelCost.toLocaleString()}`} icon="⛽" />
                <Card label="Maintenance Spend" value={`₹${summary.totalMaintCost.toLocaleString()}`} icon="🔧" />
                <Card label="Avg Revenue/Trip" value={`₹${summary.avgTripRev.toLocaleString()}`} sub={`over ${summary.completedTrips} completed`} icon="🚚" />
            </div>

            {/* Expense breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">Expense Breakdown</h3>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {[
                        { label: 'Fuel', value: summary.totalFuelCost, color: '#6366F1' },
                        { label: 'Maintenance', value: summary.totalMaintCost, color: '#F59E0B' },
                    ].map(item => {
                        const pct = summary.totalOps > 0 ? Math.round(item.value / summary.totalOps * 100) : 0
                        return (
                            <div key={item.label} className="flex-1 min-w-0">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-gray-600">{item.label}</span>
                                    <span className="font-bold" style={{ color: item.color }}>₹{item.value.toLocaleString()} ({pct}%)</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: item.color }} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Vehicle-level P&L table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Vehicle-Level P&amp;L</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 text-left whitespace-nowrap">Vehicle</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Acquisition Cost</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Revenue</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Fuel Cost</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Maint Cost</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Net P/L</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">ROI</th>
                        </tr></thead>
                        <tbody>
                            {vehicleFinancials.map(v => {
                                const pl = v.revenue - v.totalOps
                                return (
                                    <tr key={v.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800 text-xs">{v.name}</p>
                                            <p className="text-gray-400 text-[10px] font-mono">{v.plate}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">₹{v.acqCost.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-green-600 font-semibold">₹{v.revenue.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-indigo-600">₹{v.fuelCost.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-amber-600">₹{v.maintCost.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-bold ${pl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {pl >= 0 ? '+' : '−'}₹{Math.abs(pl).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${v.roi >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{v.roi}%</span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {/* Totals footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-8 text-sm font-bold">
                    <span className="text-gray-500">Totals:</span>
                    <span className="text-green-600">Revenue ₹{summary.totalRevenue.toLocaleString()}</span>
                    <span className="text-red-500">Ops ₹{summary.totalOps.toLocaleString()}</span>
                    <span className={summary.netProfit >= 0 ? 'text-green-700' : 'text-red-600'}>Net {summary.netProfit >= 0 ? '+' : '−'}₹{Math.abs(summary.netProfit).toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
}
