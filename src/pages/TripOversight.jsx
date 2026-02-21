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
const isExpired = (dateStr) => new Date(dateStr) < new Date(today)

export default function TripOversight({ vehicles, setVehicles, drivers, setDrivers, trips, setTrips, addActivity }) {
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ vehicleId: '', driverId: '', cargo: '', pickup: '', delivery: '', date: today })
    const [errors, setErrors] = useState({})
    const [banner, setBanner] = useState(null)

    const setF = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); setBanner(null) }

    // Available = vehicle status is "Available" (not In Shop, On Trip, OOS)
    const availableVehicles = vehicles.filter(v => v.status === 'Available')
    // Available drivers = Off Duty, not suspended, not expired license
    const availableDrivers = drivers.filter(d => d.dutyStatus === 'Off Duty' && !isExpired(d.license))

    const filtered = useMemo(() =>
        trips.filter(t => {
            const v = vehicles.find(vv => vv.id === t.vehicleId)
            const d = drivers.find(dd => dd.id === t.driverId)
            const str = `${t.id} ${v?.name || ''} ${d?.name || ''} ${t.status} ${t.pickup} ${t.delivery}`.toLowerCase()
            return str.includes(search.toLowerCase())
        }).sort((a, b) => b.id.localeCompare(a.id))
        , [trips, search, vehicles, drivers])

    const validate = () => {
        const e = {}
        if (!form.vehicleId) e.vehicleId = 'Select a vehicle'
        if (!form.driverId) e.driverId = 'Select a driver'
        if (!form.cargo || isNaN(form.cargo) || +form.cargo <= 0) e.cargo = 'Enter valid cargo weight'
        if (!form.pickup.trim()) e.pickup = 'Enter pickup location'
        if (!form.delivery.trim()) e.delivery = 'Enter delivery location'
        if (form.vehicleId && form.cargo) {
            const v = vehicles.find(vv => vv.id === form.vehicleId)
            if (v && +form.cargo > v.capacity) e.cargo = `Exceeds max capacity of ${v.capacity.toLocaleString()} kg`
        }
        return e
    }

    const handleCreate = () => {
        const e = validate(); if (Object.keys(e).length) { setErrors(e); return }
        const newTrip = { id: `TR-${String(trips.length + 1).padStart(3, '0')}`, vehicleId: form.vehicleId, driverId: form.driverId, cargo: +form.cargo, pickup: form.pickup, delivery: form.delivery, status: 'Draft', date: form.date }
        setTrips(t => [newTrip, ...t])
        const v = vehicles.find(vv => vv.id === form.vehicleId)
        const d = drivers.find(dd => dd.id === form.driverId)
        addActivity(`${newTrip.id} created — ${v?.name} → ${form.delivery}`, 'info')
        setForm({ vehicleId: '', driverId: '', cargo: '', pickup: '', delivery: '', date: today })
        setShowForm(false)
    }

    const dispatch = (trip) => {
        const v = vehicles.find(vv => vv.id === trip.vehicleId)
        const d = drivers.find(dd => dd.id === trip.driverId)
        if (!v || v.status !== 'Available') { setBanner(`❌ ${v?.name} is not Available (current: ${v?.status})`); return }
        if (!d || isExpired(d.license)) { setBanner(`❌ ${d?.name}'s license has expired — dispatch blocked`); return }
        if (d.dutyStatus === 'Suspended') { setBanner(`❌ ${d?.name} is suspended — dispatch blocked`); return }
        setTrips(ts => ts.map(t => t.id === trip.id ? { ...t, status: 'Dispatched' } : t))
        setVehicles(vs => vs.map(v => v.id === trip.vehicleId ? { ...v, status: 'On Trip' } : v))
        setDrivers(ds => ds.map(d => d.id === trip.driverId ? { ...d, dutyStatus: 'On Duty' } : d))
        addActivity(`${trip.id} dispatched — ${v?.name} assigned to ${d?.name}`, 'dispatch')
        setBanner(null)
    }

    const complete = (trip) => {
        setTrips(ts => ts.map(t => t.id === trip.id ? { ...t, status: 'Completed' } : t))
        setVehicles(vs => vs.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available' } : v))
        setDrivers(ds => ds.map(d => d.id === trip.driverId ? { ...d, dutyStatus: 'Off Duty' } : d))
        const v = vehicles.find(vv => vv.id === trip.vehicleId)
        const d = drivers.find(dd => dd.id === trip.driverId)
        addActivity(`${trip.id} completed — ${v?.name} now Available`, 'complete')
    }

    const cancel = (trip) => {
        setTrips(ts => ts.map(t => t.id === trip.id ? { ...t, status: 'Cancelled' } : t))
        if (trip.status === 'Dispatched') {
            setVehicles(vs => vs.map(v => v.id === trip.vehicleId ? { ...v, status: 'Available' } : v))
            setDrivers(ds => ds.map(d => d.id === trip.driverId ? { ...d, dutyStatus: 'Off Duty' } : d))
        }
        addActivity(`${trip.id} cancelled`, 'cancel')
    }

    return (
        <div className="space-y-4 max-w-[1400px]">
            {banner && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{banner} <button onClick={() => setBanner(null)} className="ml-2 text-red-400 hover:text-red-700">✕</button></div>}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <input className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400 bg-white w-72 shadow-sm"
                    placeholder="🔍  Search trips…" value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={() => setShowForm(f => !f)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
                    {showForm ? '✕ Close Form' : '+ New Trip'}
                </button>
            </div>

            {/* Create Trip Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: 'Rajdhani,sans-serif' }}>Create New Trip</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Vehicle" error={errors.vehicleId}>
                            <select className={inputCls} value={form.vehicleId} onChange={e => setF('vehicleId', e.target.value)}>
                                <option value="">— Select Available Vehicle —</option>
                                {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate}) · {v.capacity.toLocaleString()} kg</option>)}
                            </select>
                        </Field>
                        <Field label="Driver" error={errors.driverId}>
                            <select className={inputCls} value={form.driverId} onChange={e => setF('driverId', e.target.value)}>
                                <option value="">— Select Available Driver —</option>
                                {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Cargo Weight (kg)" error={errors.cargo}>
                            <input className={inputCls} type="number" value={form.cargo} onChange={e => setF('cargo', e.target.value)} placeholder="Enter weight" />
                        </Field>
                        <Field label="Pickup Location" error={errors.pickup}>
                            <input className={inputCls} value={form.pickup} onChange={e => setF('pickup', e.target.value)} placeholder="e.g. Mumbai" />
                        </Field>
                        <Field label="Delivery Location" error={errors.delivery}>
                            <input className={inputCls} value={form.delivery} onChange={e => setF('delivery', e.target.value)} placeholder="e.g. Pune" />
                        </Field>
                        <Field label="Date">
                            <input className={inputCls} type="date" value={form.date} onChange={e => setF('date', e.target.value)} />
                        </Field>
                    </div>
                    <div className="flex justify-end gap-3 mt-5">
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleCreate} className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>Create Trip</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 text-left whitespace-nowrap">Trip ID</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Vehicle</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Driver</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Cargo</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Route</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(t => {
                                const v = vehicles.find(vv => vv.id === t.vehicleId)
                                const d = drivers.find(dd => dd.id === t.driverId)
                                return (
                                    <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600">{t.id}</td>
                                        <td className="px-4 py-3 text-gray-700">{v?.name || '—'}</td>
                                        <td className="px-4 py-3 text-gray-700">{d?.name || '—'}{d && isExpired(d.license) && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1 rounded">Expired</span>}</td>
                                        <td className="px-4 py-3 text-gray-600">{t.cargo.toLocaleString()} kg</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{t.pickup} → {t.delivery}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{t.date}</td>
                                        <td className="px-4 py-3"><StatusPill status={t.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1.5">
                                                {t.status === 'Draft' && <>
                                                    <button onClick={() => dispatch(t)} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 transition-all">Dispatch</button>
                                                    <button onClick={() => cancel(t)} className="px-2.5 py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-100 border border-gray-200 transition-all">Cancel</button>
                                                </>}
                                                {t.status === 'Dispatched' && <>
                                                    <button onClick={() => complete(t)} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 border border-green-100 transition-all">Complete</button>
                                                    <button onClick={() => cancel(t)} className="px-2.5 py-1 rounded-lg text-xs text-red-500 hover:bg-red-50 border border-red-100 transition-all">Cancel</button>
                                                </>}
                                                {(t.status === 'Completed' || t.status === 'Cancelled') && <span className="text-xs text-gray-400 italic">No actions</span>}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No trips found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
