import { useState } from 'react'

const today = new Date().toISOString().split('T')[0]
const isExpired = (ds) => new Date(ds) < new Date(today)

const STATUS_STYLES = {
    'On Duty': 'bg-indigo-100 text-indigo-700',
    'Off Duty': 'bg-gray-100 text-gray-500',
    'Suspended': 'bg-red-100 text-red-700',
    'Valid': 'bg-green-100 text-green-700',
    'Expired': 'bg-red-100 text-red-700',
}
const Pill = ({ label }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[label] || 'bg-gray-100 text-gray-600'}`}>{label}</span>
)

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 transition-all bg-gray-50'
const Field = ({ label, children, error }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
        {children}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
)

const BLANK_DRIVER = { name: '', license: '', safetyScore: '', completedTrips: '', totalTrips: '', dutyStatus: 'Off Duty' }

export default function DriverProfiles({ drivers, setDrivers, addActivity }) {
    const [search, setSearch] = useState('')
    const [showAdd, setShowAdd] = useState(false)
    const [form, setForm] = useState(BLANK_DRIVER)
    const [errors, setErrors] = useState({})

    const setF = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

    const filtered = drivers.filter(d =>
        `${d.name} ${d.dutyStatus}`.toLowerCase().includes(search.toLowerCase())
    )

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Name required'
        if (!form.license) e.license = 'License expiry required'
        if (!form.safetyScore || isNaN(form.safetyScore) || +form.safetyScore < 0 || +form.safetyScore > 100) e.safetyScore = 'Enter 0–100'
        if (!form.completedTrips || isNaN(form.completedTrips)) e.completedTrips = 'Enter number'
        if (!form.totalTrips || isNaN(form.totalTrips)) e.totalTrips = 'Enter number'
        return e
    }

    const handleAdd = () => {
        const e = validate(); if (Object.keys(e).length) { setErrors(e); return }
        const d = { id: `D${Date.now()}`, name: form.name, license: form.license, safetyScore: +form.safetyScore, completedTrips: +form.completedTrips, totalTrips: +form.totalTrips, dutyStatus: form.dutyStatus }
        setDrivers(ds => [...ds, d])
        addActivity(`Driver ${d.name} added to roster`, 'add')
        setForm(BLANK_DRIVER); setShowAdd(false)
    }

    const toggleSuspend = (d) => {
        const next = d.dutyStatus === 'Suspended' ? 'Off Duty' : 'Suspended'
        setDrivers(ds => ds.map(dd => dd.id === d.id ? { ...dd, dutyStatus: next } : dd))
        addActivity(`${d.name} ${next === 'Suspended' ? 'suspended' : 'reinstated'}`, next === 'Suspended' ? 'alert' : 'info')
    }

    const handleDelete = (d) => {
        if (!confirm(`Remove ${d.name}?`)) return
        setDrivers(ds => ds.filter(dd => dd.id !== d.id))
        addActivity(`Driver ${d.name} removed from roster`, 'alert')
    }

    // Summary stats
    const expiredCount = drivers.filter(d => isExpired(d.license)).length
    const suspendedCount = drivers.filter(d => d.dutyStatus === 'Suspended').length
    const onDutyCount = drivers.filter(d => d.dutyStatus === 'On Duty').length
    const avgSafety = drivers.length ? Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length) : 0

    return (
        <div className="space-y-4 max-w-[1400px]">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Drivers', value: drivers.length, icon: '👤', color: '#6366F1' },
                    { label: 'On Duty', value: onDutyCount, icon: '🟢', color: '#10B981' },
                    { label: 'Expired License', value: expiredCount, icon: '⚠️', color: '#EF4444' },
                    { label: 'Avg Safety Score', value: `${avgSafety}%`, icon: '🛡️', color: '#8B5CF6' },
                ].map(k => (
                    <div key={k.label} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: k.color + '18' }}>{k.icon}</div>
                        <div>
                            <p className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Rajdhani,sans-serif' }}>{k.value}</p>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{k.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <input className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-400 bg-white w-72 shadow-sm"
                    placeholder="🔍  Search drivers…" value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={() => setShowAdd(f => !f)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>
                    {showAdd ? '✕ Close' : '+ Add Driver'}
                </button>
            </div>

            {showAdd && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 mb-4" style={{ fontFamily: 'Rajdhani,sans-serif' }}>Add New Driver</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="col-span-2 lg:col-span-1"><Field label="Full Name" error={errors.name}><input className={inputCls} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Ramesh Kumar" /></Field></div>
                        <Field label="License Expiry" error={errors.license}><input className={inputCls} type="date" value={form.license} onChange={e => setF('license', e.target.value)} /></Field>
                        <Field label="Safety Score (0-100)" error={errors.safetyScore}><input className={inputCls} type="number" value={form.safetyScore} onChange={e => setF('safetyScore', e.target.value)} placeholder="0–100" /></Field>
                        <Field label="Completed Trips" error={errors.completedTrips}><input className={inputCls} type="number" value={form.completedTrips} onChange={e => setF('completedTrips', e.target.value)} /></Field>
                        <Field label="Total Trips" error={errors.totalTrips}><input className={inputCls} type="number" value={form.totalTrips} onChange={e => setF('totalTrips', e.target.value)} /></Field>
                        <Field label="Duty Status">
                            <select className={inputCls} value={form.dutyStatus} onChange={e => setF('dutyStatus', e.target.value)}>
                                <option>Off Duty</option><option>On Duty</option><option>Suspended</option>
                            </select>
                        </Field>
                    </div>
                    <div className="flex justify-end gap-3 mt-5">
                        <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleAdd} className="px-5 py-2 rounded-xl text-white text-sm font-semibold hover:scale-[1.02] transition-all" style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)' }}>Add Driver</button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3 text-left whitespace-nowrap">Driver</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">License Expiry</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Compliance</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Safety Score</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Completion Rate</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Duty Status</th>
                            <th className="px-4 py-3 text-left whitespace-nowrap">Actions</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(d => {
                                const expired = isExpired(d.license)
                                const rate = d.totalTrips ? Math.round((d.completedTrips / d.totalTrips) * 100) : 0
                                return (
                                    <tr key={d.id} className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${expired ? 'bg-red-50/30' : ''}`}>
                                        <td className="px-4 py-3 font-medium text-gray-800">{d.name}</td>
                                        <td className="px-4 py-3 text-gray-600 text-sm">
                                            <span className={expired ? 'text-red-600 font-semibold' : ''}>{d.license}</span>
                                        </td>
                                        <td className="px-4 py-3"><Pill label={expired ? 'Expired' : 'Valid'} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${d.safetyScore}%`, background: d.safetyScore >= 85 ? '#10B981' : d.safetyScore >= 70 ? '#F59E0B' : '#EF4444' }} />
                                                </div>
                                                <span className="text-xs text-gray-600">{d.safetyScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">{d.completedTrips}/{d.totalTrips} ({rate}%)</td>
                                        <td className="px-4 py-3"><Pill label={d.dutyStatus} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => toggleSuspend(d)}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${d.dutyStatus === 'Suspended' ? 'border-green-200 text-green-600 hover:bg-green-50' : 'border-amber-200 text-amber-600 hover:bg-amber-50'}`}>
                                                    {d.dutyStatus === 'Suspended' ? 'Reinstate' : 'Suspend'}
                                                </button>
                                                <button onClick={() => handleDelete(d)} className="px-2.5 py-1 rounded-lg text-xs border border-red-100 text-red-500 hover:bg-red-50 transition-all">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No drivers found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
