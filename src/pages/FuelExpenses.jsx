import { useState, useMemo } from 'react'

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all bg-gray-50'
const Field = ({ label, children, error }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
)
const today = new Date().toISOString().split('T')[0]

export default function FuelExpenses({ vehicles, fuel, setFuel, maintenance, addActivity }) {
    const [form, setForm] = useState({ vehicleId: '', liters: '', cost: '', date: today })
    const [errors, setErrors] = useState({})
    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')

    const setF = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

    const validate = () => {
        const e = {}
        if (!form.vehicleId) e.vehicleId = 'Select a vehicle'
        if (!form.liters || isNaN(form.liters) || +form.liters <= 0) e.liters = 'Enter valid liters'
        if (!form.cost || isNaN(form.cost) || +form.cost <= 0) e.cost = 'Enter valid cost'
        if (!form.date) e.date = 'Select date'
        return e
    }

    const handleAdd = () => {
        const e = validate(); if (Object.keys(e).length) { setErrors(e); return }
        const entry = { id: `F${Date.now()}`, vehicleId: form.vehicleId, liters: +form.liters, cost: +form.cost, date: form.date }
        setFuel(f => [entry, ...f])
        const v = vehicles.find(vv => vv.id === form.vehicleId)
        addActivity(`Fuel logged for ${v?.name} — ${form.liters}L @ ₹${form.cost}`, 'fuel')
        setForm({ vehicleId: '', liters: '', cost: '', date: today })
        setShowForm(false)
    }

    // Computed summaries
    const summary = useMemo(() => {
        const byVehicle = {}
        vehicles.forEach(v => { byVehicle[v.id] = { vehicle: v, fuelCost: 0, fuelLiters: 0, maintCost: 0 } })
        fuel.forEach(f => { if (byVehicle[f.vehicleId]) { byVehicle[f.vehicleId].fuelCost += f.cost; byVehicle[f.vehicleId].fuelLiters += f.liters } })
        maintenance.forEach(m => { if (byVehicle[m.vehicleId]) byVehicle[m.vehicleId].maintCost += m.cost })
        return Object.values(byVehicle).filter(s => s.fuelCost > 0 || s.maintCost > 0)
    }, [vehicles, fuel, maintenance])

    const totalFuel = fuel.reduce((s, f) => s + f.cost, 0)
    const totalMaint = maintenance.reduce((s, m) => s + m.cost, 0)
    const totalOps = totalFuel + totalMaint

    const filteredFuel = fuel.filter(f => {
        const v = vehicles.find(vv => vv.id === f.vehicleId)
        return `${v?.name || ''} ${v?.plate || ''} ${f.date}`.toLowerCase().includes(search.toLowerCase())
    }).sort((a, b) => b.date.localeCompare(a.date))

    return (
        <div className="space-y-4 max-w-[1400px]">
            {/* Cost summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="text-2xl mb-2">⛽</div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Fuel Cost</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1" style={{ fontFamily: 'Rajdhani,sans-serif' }}>₹{totalFuel.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{fuel.reduce((s, f) => s + f.liters, 0).toLocaleString()} Litres Total</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="text-2xl mb-2">🔧</div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Maintenance Cost</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1" style={{ fontFamily: 'Rajdhani,sans-serif' }}>₹{totalMaint.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{maintenance.length} service records</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="text-2xl mb-2">💸</div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Operational Cost</p>
                    <p className="text-2xl font-bold text-red-600 mt-1" style={{ fontFamily: 'Rajdhani,sans-serif' }}>₹{totalOps.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Fuel + Maintenance</p>
                </div>
            </div>

            {/* Per-vehicle cost breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100"><h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Cost Breakdown by Vehicle</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 text-left whitespace-nowrap">Vehicle</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Fuel Cost</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Maintenance Cost</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Total Ops Cost</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Fuel Consumed</th>
                        </tr></thead>
                        <tbody>
                            {summary.sort((a, b) => (b.fuelCost + b.maintCost) - (a.fuelCost + a.maintCost)).map(s => (
                                <tr key={s.vehicle.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-800">{s.vehicle.name}</p>
                                        <p className="text-gray-400 text-[10px] font-mono">{s.vehicle.plate}</p>
                                    </td>
                                    <td className="px-4 py-3 text-indigo-600 font-semibold">₹{s.fuelCost.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-amber-600 font-semibold">₹{s.maintCost.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-red-600 font-bold">₹{(s.fuelCost + s.maintCost).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-gray-600">{s.fuelLiters.toLocaleString()} L</td>
                                </tr>
                            ))}
                            {summary.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No cost data available.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <input className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400 bg-white w-72 shadow-sm"
                    placeholder="🔍  Search fuel logs…" value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={() => setShowForm(f => !f)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
                    {showForm ? '✕ Close' : '⛽ Log Fuel Entry'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: 'Rajdhani,sans-serif' }}>Log Fuel Entry</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Field label="Vehicle" error={errors.vehicleId}>
                            <select className={inputCls} value={form.vehicleId} onChange={e => setF('vehicleId', e.target.value)}>
                                <option value="">— Select —</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Litres" error={errors.liters}><input className={inputCls} type="number" value={form.liters} onChange={e => setF('liters', e.target.value)} placeholder="e.g. 80" /></Field>
                        <Field label="Cost (₹)" error={errors.cost}><input className={inputCls} type="number" value={form.cost} onChange={e => setF('cost', e.target.value)} placeholder="e.g. 8400" /></Field>
                        <Field label="Date" error={errors.date}><input className={inputCls} type="date" value={form.date} onChange={e => setF('date', e.target.value)} /></Field>
                    </div>
                    <div className="flex justify-end gap-3 mt-5">
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleAdd} className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>Log Entry</button>
                    </div>
                </div>
            )}

            {/* Fuel log table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100"><h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Fuel Log History</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 text-left whitespace-nowrap">Vehicle</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Litres</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Cost</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Rate/L</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
                        </tr></thead>
                        <tbody>
                            {filteredFuel.map(f => {
                                const v = vehicles.find(vv => vv.id === f.vehicleId)
                                const rate = f.liters ? (f.cost / f.liters).toFixed(2) : '—'
                                return (
                                    <tr key={f.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3"><p className="font-medium text-gray-800">{v?.name}</p><p className="font-mono text-[10px] text-gray-400">{v?.plate}</p></td>
                                        <td className="px-4 py-3 text-gray-700">{f.liters} L</td>
                                        <td className="px-4 py-3 font-semibold text-indigo-600">₹{f.cost.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-500">₹{rate}/L</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{f.date}</td>
                                    </tr>
                                )
                            })}
                            {filteredFuel.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No fuel logs found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
