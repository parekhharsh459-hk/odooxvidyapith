import { useState, useMemo } from 'react'
import { StatusPill } from './CommandCenter'

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all bg-gray-50'
const Field = ({ label, children, error }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
)

const today = new Date().toISOString().split('T')[0]
const SERVICE_TYPES = ['Oil & Filter Change', 'Tyre Replacement', 'Brake System Repair', 'Engine Overhaul', 'Transmission Service', 'Battery Replacement', 'AC Service', 'Wheel Alignment', 'Electrical Repair', 'Coolant Flush']

export default function MaintenanceLogs({ vehicles, setVehicles, maintenance, setMaintenance, addActivity }) {
    const [form, setForm] = useState({ vehicleId: '', serviceType: '', cost: '', date: today, notes: '' })
    const [errors, setErrors] = useState({})
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)

    const setF = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

    const validate = () => {
        const e = {}
        if (!form.vehicleId) e.vehicleId = 'Select a vehicle'
        if (!form.serviceType) e.serviceType = 'Select service type'
        if (!form.cost || isNaN(form.cost) || +form.cost <= 0) e.cost = 'Enter valid cost'
        if (!form.date) e.date = 'Select date'
        return e
    }

    const handleAdd = () => {
        const e = validate(); if (Object.keys(e).length) { setErrors(e); return }
        const log = { id: `M${Date.now()}`, vehicleId: form.vehicleId, serviceType: form.serviceType, cost: +form.cost, date: form.date, notes: form.notes }
        setMaintenance(m => [log, ...m])
        // Set vehicle status to "In Shop"
        const v = vehicles.find(vv => vv.id === form.vehicleId)
        setVehicles(vs => vs.map(vv => vv.id === form.vehicleId ? { ...vv, status: 'In Shop' } : vv))
        addActivity(`${v?.name} sent for ${form.serviceType} — now In Shop`, 'maintenance')
        setForm({ vehicleId: '', serviceType: '', cost: '', date: today, notes: '' })
        setShowForm(false)
    }

    const filtered = useMemo(() =>
        maintenance.filter(m => {
            const v = vehicles.find(vv => vv.id === m.vehicleId)
            return `${v?.name || ''} ${m.serviceType} ${m.notes || ''}`.toLowerCase().includes(search.toLowerCase())
        }).sort((a, b) => b.date.localeCompare(a.date))
        , [maintenance, search, vehicles])

    // Maintenance cost per vehicle
    const costByVehicle = useMemo(() => {
        const map = {}
        maintenance.forEach(m => { map[m.vehicleId] = (map[m.vehicleId] || 0) + m.cost })
        return map
    }, [maintenance])

    const totalCost = maintenance.reduce((s, m) => s + m.cost, 0)

    return (
        <div className="space-y-4 max-w-[1400px]">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Services</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Rajdhani,sans-serif' }}>{maintenance.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Cost</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1" style={{ fontFamily: 'Rajdhani,sans-serif' }}>₹{totalCost.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Vehicles In Shop</p>
                    <p className="text-2xl font-bold text-red-600 mt-1" style={{ fontFamily: 'Rajdhani,sans-serif' }}>{vehicles.filter(v => v.status === 'In Shop').length}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Per Service</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'Rajdhani,sans-serif' }}>₹{maintenance.length ? Math.round(totalCost / maintenance.length).toLocaleString() : 0}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <input className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400 bg-white w-72 shadow-sm"
                    placeholder="🔍  Search logs…" value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={() => setShowForm(f => !f)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
                    {showForm ? '✕ Hide Form' : '+ Log Service'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: 'Rajdhani,sans-serif' }}>Log New Service</h3>
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">⚠️ Adding a service record will automatically set the vehicle status to <strong>In Shop</strong>.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Vehicle" error={errors.vehicleId}>
                            <select className={inputCls} value={form.vehicleId} onChange={e => setF('vehicleId', e.target.value)}>
                                <option value="">— Select Vehicle —</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate}) [{v.status}]</option>)}
                            </select>
                        </Field>
                        <Field label="Service Type" error={errors.serviceType}>
                            <select className={inputCls} value={form.serviceType} onChange={e => setF('serviceType', e.target.value)}>
                                <option value="">— Select Type —</option>
                                {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </Field>
                        <Field label="Cost (₹)" error={errors.cost}>
                            <input className={inputCls} type="number" value={form.cost} onChange={e => setF('cost', e.target.value)} placeholder="e.g. 15000" />
                        </Field>
                        <Field label="Service Date" error={errors.date}>
                            <input className={inputCls} type="date" value={form.date} onChange={e => setF('date', e.target.value)} />
                        </Field>
                        <div className="sm:col-span-2">
                            <Field label="Notes (optional)">
                                <input className={inputCls} value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Additional details…" />
                            </Field>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-5">
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleAdd} className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>Log Service</button>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-4">
                {/* Service history table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100"><h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Service History</h3></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-4 py-3 text-left whitespace-nowrap">Vehicle</th>
                                <th className="px-4 py-3 text-left whitespace-nowrap">Service</th>
                                <th className="px-4 py-3 text-left whitespace-nowrap">Cost</th>
                                <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
                                <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
                            </tr></thead>
                            <tbody>
                                {filtered.map(m => {
                                    const v = vehicles.find(vv => vv.id === m.vehicleId)
                                    return (
                                        <tr key={m.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-800 text-xs">{v?.name || '?'}</p>
                                                <p className="text-gray-400 text-[10px] font-mono">{v?.plate}</p>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">{m.serviceType}</td>
                                            <td className="px-4 py-3 font-semibold text-amber-600">₹{m.cost.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{m.date}</td>
                                            <td className="px-4 py-3"><StatusPill status={v?.status || '?'} /></td>
                                        </tr>
                                    )
                                })}
                                {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No logs found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cost per vehicle */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-100"><h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Cost per Vehicle</h3></div>
                    <div className="p-4 space-y-3">
                        {vehicles.filter(v => costByVehicle[v.id]).map(v => {
                            const cost = costByVehicle[v.id] || 0
                            const pct = Math.round((cost / totalCost) * 100)
                            return (
                                <div key={v.id}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-700 font-medium truncate max-w-[140px]">{v.name}</span>
                                        <span className="text-amber-600 font-semibold">₹{cost.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: '#F59E0B' }} />
                                    </div>
                                </div>
                            )
                        })}
                        {Object.keys(costByVehicle).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No maintenance costs yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}
