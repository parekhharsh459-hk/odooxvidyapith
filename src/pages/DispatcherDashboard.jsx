import { useState, useEffect } from 'react';
import {
    getTrips, addTrip, updateTrip,
    getVehicles,
    getDrivers
} from '../api/fleet';

// ─── Shared Components ───────────────────────────────────────────────────────

const Card = ({ children, title, subtitle }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {(title || subtitle) && (
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col gap-1">
                {title && <h3 className="text-lg font-bold text-slate-800">{title}</h3>}
                {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

const Badge = ({ children, color }) => {
    const colors = {
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        yellow: 'bg-amber-50 text-amber-700 border-amber-100',
        red: 'bg-rose-50 text-rose-700 border-rose-100',
        slate: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${colors[color] || colors.slate}`}>
            {children}
        </span>
    );
};

const IconTrip = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);
const IconActive = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const IconVehicle = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
);
const IconDriver = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const IconLogout = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DispatcherDashboard({ user, onLogout }) {
    const [activeView, setActiveView] = useState('trips'); // trips, active, vehicles, drivers
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [form, setForm] = useState({
        vehicleId: '',
        driverId: '',
        cargoWeight: '',
        pickup: '',
        delivery: ''
    });
    const [formError, setFormError] = useState({});

    const fetchData = async () => {
        try {
            const [t, v, d] = await Promise.all([getTrips(), getVehicles(), getDrivers()]);
            setTrips(t);
            setVehicles(v);
            setDrivers(d);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAction = async (tripId, status) => {
        try {
            await updateTrip(tripId, { status });
            fetchData(); // Refresh all state to show side effects
        } catch (err) {
            alert('Action failed');
        }
    };

    const validateForm = () => {
        const e = {};
        const vehicle = vehicles.find(v => v.id === form.vehicleId);
        const driver = drivers.find(d => d.id === form.driverId);

        if (!form.vehicleId) e.vehicleId = 'Please select a vehicle';
        if (!form.driverId) e.driverId = 'Please select a driver';
        if (!form.cargoWeight || form.cargoWeight <= 0) e.cargoWeight = 'Cargo weight must be greater than 0';
        if (!form.pickup.trim()) e.pickup = 'Pickup location required';
        if (!form.delivery.trim()) e.delivery = 'Delivery location required';

        if (vehicle && Number(form.cargoWeight) > vehicle.capacity) {
            e.cargoWeight = `Weight (${form.cargoWeight}kg) exceeds vehicle capacity (${vehicle.capacity}kg)`;
        }
        if (vehicle && vehicle.status !== 'Available') {
            e.vehicleId = 'Selected vehicle is no longer available';
        }
        if (driver) {
            const isExpired = new Date(driver.licenseExpiry) < new Date();
            if (isExpired) e.driverId = 'Driver license has expired';
            if (driver.status === 'Suspended') e.driverId = 'Driver is currently suspended';
        }

        setFormError(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await addTrip(form);
            setForm({ vehicleId: '', driverId: '', cargoWeight: '', pickup: '', delivery: '' });
            setFormError({});
            fetchData();
        } catch (err) {
            alert('Failed to create trip');
        }
    };

    // Derived State
    const availableVehicles = vehicles.filter(v => v.status === 'Available');
    const availableDrivers = drivers.filter(d => {
        const isExpired = new Date(d.licenseExpiry) < new Date();
        return !isExpired && d.status !== 'Suspended';
    });

    const activeTripsList = trips.filter(t => t.status === 'Dispatched');

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse">FLEETFLOW OPERATIONAL SYSTEM INITIALIZING...</div>;

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Sidebar */}
            <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col pt-8 border-r border-[#1E293B] shadow-2xl">
                <div className="px-8 flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#374151,#1F2937)' }}>FF</div>
                    <span className="text-white font-bold text-lg" style={{ fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.04em' }}>FleetFlow</span>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: 'trips', label: 'Trip Management', icon: <IconTrip /> },
                        { id: 'active', label: 'Active Trips', icon: <IconActive /> },
                        { id: 'vehicles', label: 'Available Vehicles', icon: <IconVehicle /> },
                        { id: 'drivers', label: 'Available Drivers', icon: <IconDriver /> },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                                activeView === item.id
                                    ? 'text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                            style={{
                                background: activeView === item.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                                borderLeft: activeView === item.id ? '3px solid #818CF8' : '3px solid transparent',
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#1E293B]">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 font-bold text-sm"
                    >
                        <IconLogout />
                        LOGOUT
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-5 flex items-center justify-between z-30">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-slate-800 font-['Rajdhani'] uppercase tracking-tight">
                            {activeView.replace('-', ' ')}
                        </h1>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">DISPATCHER CONSOLE • TERMINAL 01</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-slate-800 tracking-tighter">{user.name}</span>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">{user.role}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-indigo-100 flex items-center justify-center font-black text-indigo-700 bg-indigo-50 shadow-inner">
                            {user.avatar}
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto">
                    {/* View Switcher */}
                    {activeView === 'trips' && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Form */}
                                <div className="lg:col-span-4">
                                    <Card title="Create New Trip" subtitle="Assign assets and validate loads">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1 tracking-widest">Select Vehicle</label>
                                                <select
                                                    value={form.vehicleId}
                                                    onChange={e => setForm({ ...form, vehicleId: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                >
                                                    <option value="">Select Vehicle</option>
                                                    {availableVehicles.map(v => (
                                                        <option key={v.id} value={v.id}>{v.name} ({v.capacity}kg)</option>
                                                    ))}
                                                </select>
                                                {formError.vehicleId && <p className="text-rose-500 text-[10px] mt-1 font-bold">{formError.vehicleId}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1 tracking-widest">Select Driver</label>
                                                <select
                                                    value={form.driverId}
                                                    onChange={e => setForm({ ...form, driverId: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                >
                                                    <option value="">Select Driver</option>
                                                    {availableDrivers.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </select>
                                                {formError.driverId && <p className="text-rose-500 text-[10px] mt-1 font-bold">{formError.driverId}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1 tracking-widest">Cargo Weight (kg)</label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={form.cargoWeight}
                                                    onChange={e => setForm({ ...form, cargoWeight: e.target.value })}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                />
                                                {formError.cargoWeight && <p className="text-rose-500 text-[10px] mt-1 font-bold">{formError.cargoWeight}</p>}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1 tracking-widest">Pickup</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Locality"
                                                        value={form.pickup}
                                                        onChange={e => setForm({ ...form, pickup: e.target.value })}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                    />
                                                    {formError.pickup && <p className="text-rose-500 text-[10px] mt-1 font-bold">{formError.pickup}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-black uppercase text-slate-400 mb-1 tracking-widest">Delivery</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Destination"
                                                        value={form.delivery}
                                                        onChange={e => setForm({ ...form, delivery: e.target.value })}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                    />
                                                    {formError.delivery && <p className="text-rose-500 text-[10px] mt-1 font-bold">{formError.delivery}</p>}
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-200"
                                            >
                                                CREATE TRIP DRAFT
                                            </button>
                                        </form>
                                    </Card>
                                </div>

                                {/* Table */}
                                <div className="lg:col-span-8">
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trip ID</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manifest</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {trips.map(trip => {
                                                        const v = vehicles.find(v => v.id === trip.vehicleId);
                                                        const d = drivers.find(d => d.id === trip.driverId);
                                                        return (
                                                            <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors group">
                                                                <td className="px-6 py-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-black text-slate-700">{trip.id}</span>
                                                                        <span className="text-[10px] text-slate-400 font-bold">{trip.date}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-bold text-slate-700">{v?.name || 'N/A'}</span>
                                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{d?.name || 'N/A'} • {trip.cargoWeight}kg</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-slate-600">{trip.pickup}</span>
                                                                        <span className="text-slate-300">→</span>
                                                                        <span className="text-xs font-bold text-slate-600">{trip.delivery}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge color={
                                                                        trip.status === 'Dispatched' ? 'blue' :
                                                                            trip.status === 'Completed' ? 'green' :
                                                                                trip.status === 'Cancelled' ? 'red' : 'slate'
                                                                    }>
                                                                        {trip.status}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        {trip.status === 'Draft' && (
                                                                            <button
                                                                                onClick={() => handleAction(trip.id, 'Dispatched')}
                                                                                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
                                                                            >
                                                                                Dispatch
                                                                            </button>
                                                                        )}
                                                                        {trip.status === 'Dispatched' && (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => handleAction(trip.id, 'Completed')}
                                                                                    className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"
                                                                                >
                                                                                    Complete
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleAction(trip.id, 'Cancelled')}
                                                                                    className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                        {trip.status === 'Draft' && (
                                                                            <button
                                                                                onClick={() => handleAction(trip.id, 'Cancelled')}
                                                                                className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeView === 'active' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeTripsList.length > 0 ? activeTripsList.map(trip => {
                                const v = vehicles.find(v => v.id === trip.vehicleId);
                                const d = drivers.find(d => d.id === trip.driverId);
                                return (
                                    <div key={trip.id} className="bg-white rounded-2xl border-l-[6px] border-l-blue-500 border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-sm font-black text-slate-800 tracking-tighter">{trip.id}</span>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">En Route</p>
                                            </div>
                                            <Badge color="blue">DISPATCHED</Badge>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <IconVehicle />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-700 leading-none">{v?.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold">{v?.plate}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                    <IconDriver />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-700 leading-none">{d?.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">On Duty</p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <div className="text-center">
                                                    <p className="text-[9px] text-slate-400 font-black uppercase">Pickup</p>
                                                    <p className="text-[11px] font-bold text-slate-700">{trip.pickup}</p>
                                                </div>
                                                <div className="flex-1 px-4 text-center text-slate-300">→</div>
                                                <div className="text-center">
                                                    <p className="text-[9px] text-slate-400 font-black uppercase">Delivery</p>
                                                    <p className="text-[11px] font-bold text-slate-700">{trip.delivery}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAction(trip.id, 'Completed')}
                                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-100"
                                            >
                                                COMPLETE MISSION
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="col-span-full h-64 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest">No Active Missions Found</p>
                                    <button onClick={() => setActiveView('trips')} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Dispatch a new trip →</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'vehicles' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">License Plate</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Max Capacity (kg)</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Current Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {availableVehicles.map(v => (
                                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-black text-slate-700">{v.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold tracking-tighter border border-slate-200">{v.plate}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-xs font-bold text-slate-600">{v.capacity}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge color="green">{v.status}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                    {availableVehicles.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">All units are currently deployed or out of service</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeView === 'drivers' && (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">License Expiry</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Compliance Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {drivers.map(d => {
                                        const isExpired = new Date(d.licenseExpiry) < new Date();
                                        const isSuspended = d.status === 'Suspended';

                                        // Still show them but maybe with warnings if they are relevant to internal tracking, 
                                        // or just filtered as per prompt: "Only show drivers: License valid, Status !== "Suspended""
                                        // Actually prompt says "Only show drivers: License valid, Status !== "Suspended""
                                        // But then "Show red badge if license expired".
                                        // I'll show all but filter the ones used in "availableDrivers" dropdown.

                                        return (
                                            <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-black text-slate-700">{d.name}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-600">{d.licenseExpiry}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {isExpired ? (
                                                        <Badge color="red">LICENSE EXPIRED</Badge>
                                                    ) : isSuspended ? (
                                                        <Badge color="red">SUSPENDED</Badge>
                                                    ) : (
                                                        <Badge color="green">COMPLIANT</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Badge color={d.status === 'Available' ? 'green' : 'blue'}>{d.status}</Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
