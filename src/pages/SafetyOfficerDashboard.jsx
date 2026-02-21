import { useState, useEffect } from 'react';
import { getDrivers } from '../api/fleet';
import { updateDriverStatus, updateDriverSafetyScore, getIncidents, createIncident, updateIncident } from '../api/safety';

// ─── Utility Functions ───────────────────────────────────────────────────────

const isLicenseExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
};

const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
};

const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'Low Risk', color: 'green' };
    if (score >= 50) return { level: 'Medium Risk', color: 'yellow' };
    return { level: 'High Risk', color: 'red' };
};

const getComplianceStatus = (driver) => {
    if (isLicenseExpired(driver.licenseExpiry)) return { status: 'Expired', color: 'red' };
    if (isExpiringSoon(driver.licenseExpiry)) return { status: 'Expiring Soon', color: 'orange' };
    return { status: 'Valid', color: 'green' };
};

// ─── Reusable Components ─────────────────────────────────────────────────────

const Badge = ({ children, color }) => {
    const colors = {
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        yellow: 'bg-amber-50 text-amber-700 border-amber-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
        red: 'bg-rose-50 text-rose-700 border-rose-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        slate: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${colors[color] || colors.slate}`}>
            {children}
        </span>
    );
};

const KpiCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-emerald-500 to-emerald-600',
        red: 'from-rose-500 to-rose-600',
        orange: 'from-orange-500 to-orange-600',
        purple: 'from-purple-500 to-purple-600',
    };
    
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg`}>
                    {icon}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
                <p className="text-3xl font-black text-slate-800">{value}</p>
                {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
            </div>
        </div>
    );
};

const RiskIndicator = ({ score }) => {
    const risk = getRiskLevel(score);
    const percentage = score;
    
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Safety Score</span>
                <Badge color={risk.color}>{risk.level}</Badge>
            </div>
            <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                        risk.color === 'green' ? 'bg-emerald-500' :
                        risk.color === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between items-center">
                <span className="text-2xl font-black text-slate-800">{score}</span>
                <span className="text-xs text-slate-400 font-bold">/ 100</span>
            </div>
        </div>
    );
};

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconDriver = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const IconAlert = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const IconShield = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const IconBan = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);

const IconLogout = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const IconIncident = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconCalendar = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

// ─── Main Dashboard Component ────────────────────────────────────────────────

export default function SafetyOfficerDashboard({ user, onLogout }) {
    const [activeView, setActiveView] = useState('compliance');
    const [drivers, setDrivers] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCompliance, setFilterCompliance] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [showIncidentModal, setShowIncidentModal] = useState(false);

    const fetchData = async () => {
        try {
            const [driversData, incidentsData] = await Promise.all([
                getDrivers(),
                getIncidents()
            ]);
            setDrivers(driversData);
            setIncidents(incidentsData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Derived State - KPIs
    const totalDrivers = drivers.length;
    const expiredLicenses = drivers.filter(d => isLicenseExpired(d.licenseExpiry)).length;
    const suspendedDrivers = drivers.filter(d => d.status === 'Suspended').length;
    const avgSafetyScore = drivers.length > 0 
        ? Math.round(drivers.reduce((sum, d) => sum + d.safetyScore, 0) / drivers.length)
        : 0;

    // Filtered Drivers
    const filteredDrivers = drivers.filter(driver => {
        const compliance = getComplianceStatus(driver);
        const matchesCompliance = filterCompliance === 'all' || 
            (filterCompliance === 'valid' && compliance.status === 'Valid') ||
            (filterCompliance === 'expired' && compliance.status === 'Expired') ||
            (filterCompliance === 'expiring' && compliance.status === 'Expiring Soon');
        
        const matchesStatus = filterStatus === 'all' || driver.status === filterStatus;
        const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCompliance && matchesStatus && matchesSearch;
    });

    // License Expiry Tracking
    const expiringDrivers = drivers.filter(d => isExpiringSoon(d.licenseExpiry) || isLicenseExpired(d.licenseExpiry))
        .sort((a, b) => new Date(a.licenseExpiry) - new Date(b.licenseExpiry));

    const handleStatusChange = async (driverId, newStatus) => {
        try {
            await updateDriverStatus(driverId, newStatus);
            await fetchData();
        } catch (err) {
            alert('Failed to update driver status');
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Loading Safety Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col pt-8 border-r border-[#1E293B] shadow-2xl">
                <div className="px-8 flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#374151,#1F2937)' }}>
                        FF
                    </div>
                    <span className="text-white font-bold text-lg" style={{ fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.04em' }}>FleetFlow</span>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: 'compliance', label: 'Driver Compliance', icon: <IconShield /> },
                        { id: 'expiry', label: 'License Expiry Tracker', icon: <IconCalendar /> },
                        { id: 'safety', label: 'Safety Scores', icon: <IconDriver /> },
                        { id: 'incidents', label: 'Incident Reports', icon: <IconIncident /> },
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
                            {activeView === 'compliance' && 'Driver Compliance Dashboard'}
                            {activeView === 'expiry' && 'License Expiry Tracker'}
                            {activeView === 'safety' && 'Safety Scores'}
                            {activeView === 'incidents' && 'Incident Reports'}
                        </h1>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                            SAFETY OFFICER CONSOLE • COMPLIANCE MONITORING
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-slate-800 tracking-tighter">{user.name}</span>
                            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none">
                                {user.role}
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-orange-100 flex items-center justify-center font-black text-orange-700 bg-orange-50 shadow-inner">
                            {user.avatar}
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto">
                    {/* KPI Cards - Show on all views */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KpiCard
                            title="Total Drivers"
                            value={totalDrivers}
                            subtitle="Active in fleet"
                            icon={<IconDriver />}
                            color="blue"
                        />
                        <KpiCard
                            title="Expired Licenses"
                            value={expiredLicenses}
                            subtitle="Requires immediate action"
                            icon={<IconAlert />}
                            color="red"
                        />
                        <KpiCard
                            title="Suspended Drivers"
                            value={suspendedDrivers}
                            subtitle="Currently off duty"
                            icon={<IconBan />}
                            color="orange"
                        />
                        <KpiCard
                            title="Avg Safety Score"
                            value={avgSafetyScore}
                            subtitle="Fleet-wide average"
                            icon={<IconShield />}
                            color="green"
                        />
                    </div>

                    {/* Driver Compliance Dashboard */}
                    {activeView === 'compliance' && (
                        <div className="space-y-6">
                            {/* Filters */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                                            Compliance Status
                                        </label>
                                        <select
                                            value={filterCompliance}
                                            onChange={(e) => setFilterCompliance(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                                        >
                                            <option value="all">All Drivers</option>
                                            <option value="valid">Valid License</option>
                                            <option value="expiring">Expiring Soon</option>
                                            <option value="expired">Expired</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                                            Duty Status
                                        </label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="On Duty">On Duty</option>
                                            <option value="Off Duty">Off Duty</option>
                                            <option value="Suspended">Suspended</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                                            Search Driver
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Search by name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Driver Table */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver Name</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">License</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry Date</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Safety Score</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trip Rate</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredDrivers.map(driver => {
                                                const compliance = getComplianceStatus(driver);
                                                const risk = getRiskLevel(driver.safetyScore);
                                                return (
                                                    <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-slate-700">{driver.name}</span>
                                                                <span className="text-[10px] text-slate-400 font-bold">{driver.id}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-slate-700">{driver.licenseCategory}</span>
                                                                <span className="text-[10px] text-slate-400 font-mono">{driver.licenseNumber}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-bold text-slate-600">{driver.licenseExpiry}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge color={compliance.color}>{compliance.status}</Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-black text-slate-800">{driver.safetyScore}</span>
                                                                <Badge color={risk.color}>{risk.level}</Badge>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-bold text-slate-600">{driver.tripCompletionRate}%</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                value={driver.status}
                                                                onChange={(e) => handleStatusChange(driver.id, e.target.value)}
                                                                className="text-xs font-bold px-3 py-1 rounded-lg border-2 border-slate-200 focus:border-orange-500 outline-none"
                                                            >
                                                                <option value="On Duty">On Duty</option>
                                                                <option value="Off Duty">Off Duty</option>
                                                                <option value="Suspended">Suspended</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedDriver(driver);
                                                                    setShowScoreModal(true);
                                                                }}
                                                                className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-100 hover:bg-orange-600 hover:text-white transition-all"
                                                            >
                                                                Update Score
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* License Expiry Tracker */}
                    {activeView === 'expiry' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <h3 className="text-lg font-black text-slate-800 mb-4">License Expiration Timeline</h3>
                                <div className="space-y-4">
                                    {expiringDrivers.map(driver => {
                                        const compliance = getComplianceStatus(driver);
                                        const daysUntilExpiry = Math.ceil((new Date(driver.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24));
                                        
                                        return (
                                            <div key={driver.id} className={`p-4 rounded-xl border-l-4 ${
                                                compliance.color === 'red' ? 'border-l-rose-500 bg-rose-50' :
                                                compliance.color === 'orange' ? 'border-l-orange-500 bg-orange-50' :
                                                'border-l-emerald-500 bg-emerald-50'
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="text-sm font-black text-slate-800">{driver.name}</span>
                                                            <Badge color={compliance.color}>{compliance.status}</Badge>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4 text-xs">
                                                            <div>
                                                                <span className="text-slate-500 font-bold">License:</span>
                                                                <span className="ml-2 text-slate-700 font-black">{driver.licenseCategory}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-500 font-bold">Expiry:</span>
                                                                <span className="ml-2 text-slate-700 font-black">{driver.licenseExpiry}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-500 font-bold">Days:</span>
                                                                <span className={`ml-2 font-black ${
                                                                    daysUntilExpiry < 0 ? 'text-rose-700' :
                                                                    daysUntilExpiry <= 30 ? 'text-orange-700' :
                                                                    'text-emerald-700'
                                                                }`}>
                                                                    {daysUntilExpiry < 0 ? 'EXPIRED' : `${daysUntilExpiry} days`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs text-slate-500 font-bold">Contact:</span>
                                                        <p className="text-xs text-slate-700 font-black">{driver.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {expiringDrivers.length === 0 && (
                                        <div className="text-center py-12 text-slate-400">
                                            <IconShield />
                                            <p className="mt-4 font-bold uppercase tracking-widest">All licenses are valid</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Safety Scores */}
                    {activeView === 'safety' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {drivers.map(driver => {
                                const risk = getRiskLevel(driver.safetyScore);
                                return (
                                    <div key={driver.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="text-lg font-black text-slate-800">{driver.name}</h4>
                                                <p className="text-xs text-slate-500 font-bold">{driver.licenseCategory}</p>
                                            </div>
                                            <Badge color={driver.status === 'Suspended' ? 'red' : 'blue'}>
                                                {driver.status}
                                            </Badge>
                                        </div>
                                        
                                        <RiskIndicator score={driver.safetyScore} />
                                        
                                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-bold">Total Trips:</span>
                                                <span className="text-slate-800 font-black">{driver.totalTrips}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-bold">Completed:</span>
                                                <span className="text-slate-800 font-black">{driver.completedTrips}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-bold">Incidents:</span>
                                                <span className="text-rose-700 font-black">{driver.incidents}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-bold">Completion Rate:</span>
                                                <span className="text-emerald-700 font-black">{driver.tripCompletionRate}%</span>
                                            </div>
                                        </div>
                                        
                                        <button
                                            onClick={() => {
                                                setSelectedDriver(driver);
                                                setShowScoreModal(true);
                                            }}
                                            className="w-full mt-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-100"
                                        >
                                            Update Safety Score
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Incident Reports */}
                    {activeView === 'incidents' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-black text-slate-800">Recent Incidents</h3>
                                <button
                                    onClick={() => setShowIncidentModal(true)}
                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    + Report Incident
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                {incidents.map(incident => {
                                    const driver = drivers.find(d => d.id === incident.driverId);
                                    const severityColor = {
                                        'Low': 'blue',
                                        'Medium': 'orange',
                                        'High': 'red'
                                    };
                                    
                                    return (
                                        <div key={incident.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-sm font-black text-slate-800">{incident.id}</span>
                                                        <Badge color={severityColor[incident.severity]}>{incident.severity} Severity</Badge>
                                                        <Badge color={incident.resolved ? 'green' : 'red'}>
                                                            {incident.resolved ? 'Resolved' : 'Open'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-bold mb-3">
                                                        Driver: <span className="text-slate-800">{driver?.name || 'Unknown'}</span> • 
                                                        Date: <span className="text-slate-800">{incident.date}</span>
                                                    </p>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <span className="text-xs text-slate-500 font-bold">Type:</span>
                                                            <span className="ml-2 text-xs text-slate-800 font-black">{incident.type}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-slate-500 font-bold">Description:</span>
                                                            <p className="text-xs text-slate-700 mt-1">{incident.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {!incident.resolved && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await updateIncident(incident.id, { resolved: true });
                                                                await fetchData();
                                                            } catch (err) {
                                                                alert('Failed to update incident');
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {incidents.length === 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                                        <IconShield />
                                        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest">No incidents reported</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Safety Score Update Modal */}
            {showScoreModal && selectedDriver && (
                <ScoreUpdateModal
                    driver={selectedDriver}
                    onClose={() => {
                        setShowScoreModal(false);
                        setSelectedDriver(null);
                    }}
                    onUpdate={async (newScore, hasIncident) => {
                        try {
                            await updateDriverSafetyScore(selectedDriver.id, newScore, hasIncident);
                            await fetchData();
                            setShowScoreModal(false);
                            setSelectedDriver(null);
                        } catch (err) {
                            alert('Failed to update safety score');
                        }
                    }}
                />
            )}

            {/* Incident Report Modal */}
            {showIncidentModal && (
                <IncidentReportModal
                    drivers={drivers}
                    onClose={() => setShowIncidentModal(false)}
                    onSubmit={async (incidentData) => {
                        try {
                            await createIncident(incidentData);
                            await fetchData();
                            setShowIncidentModal(false);
                        } catch (err) {
                            alert('Failed to create incident report');
                        }
                    }}
                />
            )}
        </div>
    );
}

// ─── Score Update Modal ──────────────────────────────────────────────────────

function ScoreUpdateModal({ driver, onClose, onUpdate }) {
    const [newScore, setNewScore] = useState(driver.safetyScore);
    const [hasIncident, setHasIncident] = useState(false);
    const risk = getRiskLevel(newScore);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-2xl font-black text-slate-800 mb-6">Update Safety Score</h3>
                
                <div className="mb-6">
                    <p className="text-sm font-bold text-slate-600 mb-2">Driver: {driver.name}</p>
                    <p className="text-xs text-slate-500">Current Score: {driver.safetyScore}</p>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-black uppercase text-slate-400 mb-3 tracking-widest">
                        New Safety Score
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={newScore}
                        onChange={(e) => setNewScore(parseInt(e.target.value))}
                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-3xl font-black text-slate-800">{newScore}</span>
                        <Badge color={risk.color}>{risk.level}</Badge>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={hasIncident}
                            onChange={(e) => setHasIncident(e.target.checked)}
                            className="w-5 h-5 rounded accent-orange-600"
                        />
                        <span className="text-sm font-bold text-slate-700">
                            This update is due to a new incident
                        </span>
                    </label>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onUpdate(newScore, hasIncident)}
                        className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all"
                    >
                        Update Score
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Incident Report Modal ───────────────────────────────────────────────────

function IncidentReportModal({ drivers, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        driverId: '',
        type: '',
        severity: 'Medium',
        description: ''
    });

    const incidentTypes = [
        'Minor Collision',
        'Major Collision',
        'Traffic Violation',
        'Equipment Damage',
        'Safety Protocol Breach',
        'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.driverId || !formData.type || !formData.description) {
            alert('Please fill all required fields');
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-black text-slate-800 mb-6">Report New Incident</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                            Select Driver *
                        </label>
                        <select
                            value={formData.driverId}
                            onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                            required
                        >
                            <option value="">Choose a driver...</option>
                            {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.name} - {driver.licenseCategory}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                            Incident Type *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                            required
                        >
                            <option value="">Select type...</option>
                            {incidentTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                            Severity Level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Low', 'Medium', 'High'].map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, severity: level })}
                                    className={`py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        formData.severity === level
                                            ? level === 'Low' ? 'bg-blue-600 text-white' :
                                              level === 'Medium' ? 'bg-orange-600 text-white' :
                                              'bg-rose-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Provide detailed description of the incident..."
                            rows="4"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm transition-all"
                        >
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
