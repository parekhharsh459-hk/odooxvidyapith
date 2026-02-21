import { useState } from 'react'
import { StatusPill } from './CommandCenter'

const BLANK = { name: '', plate: '', type: 'Truck', capacity: '', odometer: '', region: 'Mumbai', status: 'Available', acqCost: '', revenue: '0' }

const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900" style={{ fontFamily: 'Rajdhani,sans-serif' }}>{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <div className="p-6">{children}</div>
        </div>
    </div>
)

const Field = ({ label, children, error }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
)

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all bg-gray-50'

export default function VehicleRegistry({ vehicles, setVehicles, addActivity }) {
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState({ key: 'name', dir: 'asc' })
    const [modal, setModal] = useState(null) // null | 'add' | 'edit'
    const [editV, setEditV] = useState(null)
    const [form, setForm] = useState(BLANK)
    const [errors, setErrors] = useState({})

    const setF = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

    const sorted = [...vehicles]
        .filter(v => `${v.name} ${v.plate} ${v.type} ${v.region}`.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const av = String(a[sort.key] ?? ''), bv = String(b[sort.key] ?? '')
            return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
        })

    const toggleSort = (key) => setSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))
    const SortTh = ({ col, label }) => (
        <th className="px-4 py-3 text-left cursor-pointer hover:text-indigo-600 whitespace-nowrap" onClick={() => toggleSort(col)}>
            {label} {sort.key === col ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
        </th>
    )

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name required'
        if (!form.plate.trim()) e.plate = 'License plate required'
        else if (vehicles.some(v => v.plate === form.plate && v.id !== editV?.id)) e.plate = 'Plate already exists'
        if (!form.capacity || isNaN(form.capacity)) e.capacity = 'Valid number required'
        if (!form.odometer || isNaN(form.odometer)) e.odometer = 'Valid number required'
        if (!form.acqCost || isNaN(form.acqCost)) e.acqCost = 'Valid number required'
        return e
    }

    const openAdd = () => { setForm(BLANK); setErrors({}); setModal('add') }
    const openEdit = (v) => { setForm({ name: v.name, plate: v.plate, type: v.type, capacity: v.capacity, odometer: v.odometer, region: v.region, status: v.status, acqCost: v.acqCost, revenue: v.revenue }); setEditV(v); setErrors({}); setModal('edit') }

    const handleSave = () => {
        const e = validate(); if (Object.keys(e).length) { setErrors(e); return }
        const payload = { ...form, capacity: +form.capacity, odometer: +form.odometer, acqCost: +form.acqCost, revenue: +(form.revenue || 0) }
        if (modal === 'add') {
            const nv = { ...payload, id: `V${Date.now()}` }
            setVehicles(v => [...v, nv])
            addActivity(`New vehicle ${nv.name} added to registry`, 'add')
        } else {
            setVehicles(v => v.map(vv => vv.id === editV.id ? { ...vv, ...payload } : vv))
            addActivity(`Vehicle ${form.name} details updated`, 'info')
        }
        setModal(null)
    }

    const handleDelete = (v) => {
        if (!confirm(`Delete ${v.name}?`)) return
        setVehicles(vs => vs.filter(vv => vv.id !== v.id))
        addActivity(`Vehicle ${v.name} removed from registry`, 'alert')
    }

    const toggleOOS = (v) => {
        const next = v.status === 'Out of Service' ? 'Available' : 'Out of Service'
        setVehicles(vs => vs.map(vv => vv.id === v.id ? { ...vv, status: next } : vv))
        addActivity(`${v.name} marked as ${next}`, next === 'Out of Service' ? 'alert' : 'info')
    }

    const FormFields = () => (
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Field label="Vehicle Name / Model" error={errors.name}><input className={inputCls} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Tata Prima 4028.S" /></Field></div>
            <Field label="License Plate" error={errors.plate}><input className={inputCls} value={form.plate} onChange={e => setF('plate', e.target.value)} placeholder="MH-01-AB-1234" /></Field>
            <Field label="Vehicle Type">
                <select className={inputCls} value={form.type} onChange={e => setF('type', e.target.value)}>
                    {['Truck', 'Van', 'Bike'].map(t => <option key={t}>{t}</option>)}
                </select>
            </Field>
            <Field label="Max Capacity (kg)" error={errors.capacity}><input className={inputCls} type="number" value={form.capacity} onChange={e => setF('capacity', e.target.value)} placeholder="15000" /></Field>
            <Field label="Odometer (km)" error={errors.odometer}><input className={inputCls} type="number" value={form.odometer} onChange={e => setF('odometer', e.target.value)} placeholder="85000" /></Field>
            <Field label="Region">
                <select className={inputCls} value={form.region} onChange={e => setF('region', e.target.value)}>
                    {['Mumbai', 'Pune', 'Delhi', 'Nagpur', 'Nashik', 'Thane', 'Surat', 'Kolhapur'].map(r => <option key={r}>{r}</option>)}
                </select>
            </Field>
            <Field label="Acquisition Cost (₹)" error={errors.acqCost}><input className={inputCls} type="number" value={form.acqCost} onChange={e => setF('acqCost', e.target.value)} placeholder="2000000" /></Field>
            <Field label="Revenue Generated (₹)"><input className={inputCls} type="number" value={form.revenue} onChange={e => setF('revenue', e.target.value)} placeholder="0" /></Field>
            {modal === 'edit' && (
                <Field label="Status">
                    <select className={inputCls} value={form.status} onChange={e => setF('status', e.target.value)}>
                        {['Available', 'On Trip', 'In Shop', 'Out of Service'].map(s => <option key={s}>{s}</option>)}
                    </select>
                </Field>
            )}
        </div>
    )

    return (
        <div className="space-y-4 max-w-[1400px]">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <input className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400 bg-white w-72 shadow-sm"
                    placeholder="🔍  Search by name, plate, type, region…" value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
                    + Add Vehicle
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <SortTh col="name" label="Name / Model" />
                            <SortTh col="plate" label="Plate" />
                            <SortTh col="type" label="Type" />
                            <SortTh col="capacity" label="Max Load (kg)" />
                            <SortTh col="odometer" label="Odometer" />
                            <SortTh col="region" label="Region" />
                            <SortTh col="status" label="Status" />
                            <th className="px-4 py-3 text-left whitespace-nowrap">Actions</th>
                        </tr></thead>
                        <tbody>
                            {sorted.map(v => (
                                <tr key={v.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-800">{v.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-600 bg-gray-50">{v.plate}</td>
                                    <td className="px-4 py-3 text-gray-600">{v.type}</td>
                                    <td className="px-4 py-3 text-gray-600">{(v.capacity || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-gray-600">{(v.odometer || 0).toLocaleString()} km</td>
                                    <td className="px-4 py-3 text-gray-600">{v.region}</td>
                                    <td className="px-4 py-3"><StatusPill status={v.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => openEdit(v)} title="Edit"
                                                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all">✏️</button>
                                            <button onClick={() => toggleOOS(v)} title={v.status === 'Out of Service' ? 'Mark Available' : 'Out of Service'}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${v.status === 'Out of Service' ? 'border-green-300 text-green-600 hover:bg-green-50' : 'border-amber-200 text-amber-600 hover:bg-amber-50'}`}>
                                                {v.status === 'Out of Service' ? '✅' : '🔴'}
                                            </button>
                                            <button onClick={() => handleDelete(v)} title="Delete"
                                                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-red-100 text-red-500 hover:bg-red-50 transition-all">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sorted.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No vehicles found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <Modal title={modal === 'add' ? '+ Add New Vehicle' : '✏️ Edit Vehicle'} onClose={() => setModal(null)}>
                    <FormFields />
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSave} className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
                            {modal === 'add' ? 'Add Vehicle' : 'Save Changes'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    )
}
