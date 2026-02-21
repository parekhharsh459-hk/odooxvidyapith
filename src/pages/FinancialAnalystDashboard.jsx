import { useState, useEffect } from 'react';
import { getVehicles } from '../api/fleet';
import { 
    getFinancialAnalytics, 
    getFuelLogs, 
    getMaintenanceLogs, 
    createFuelLog, 
    createMaintenanceLog,
    exportToCSV 
} from '../api/financial';

// ─── Utility Functions ───────────────────────────────────────────────────────

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
};

// ─── Reusable Components ─────────────────────────────────────────────────────

const KpiCard = ({ title, value, subtitle, icon, color = 'blue', trend }) => {
    const colors = {
        blue: 'from-blue-600 to-blue-700',
        green: 'from-emerald-600 to-emerald-700',
        red: 'from-rose-600 to-rose-700',
        orange: 'from-orange-600 to-orange-700',
        purple: 'from-purple-600 to-purple-700',
        indigo: 'from-indigo-600 to-indigo-700',
    };
    
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        trend > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{title}</p>
                <p className="text-3xl font-black text-slate-800">{value}</p>
                {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
            </div>
        </div>
    );
};

const Badge = ({ children, color }) => {
    const colors = {
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        red: 'bg-rose-50 text-rose-700 border-rose-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
        slate: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${colors[color] || colors.slate}`}>
            {children}
        </span>
    );
};

// ─── Icons ───────────────────────────────────────────────────────────────────

const IconMoney = () => (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconTool = () => (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconChart = () => (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const IconCash = () => (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const IconFuel = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const IconDownload = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const IconLogout = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

// ─── Main Dashboard Component ────────────────────────────────────────────────

export default function FinancialAnalystDashboard({ user, onLogout }) {
    const [activeView, setActiveView] = useState('overview');
    const [vehicles, setVehicles] = useState([]);
    const [fuelLogs, setFuelLogs] = useState([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFuelModal, setShowFuelModal] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

    const fetchData = async () => {
        try {
            const [vehiclesData, fuelData, maintenanceData, analyticsData] = await Promise.all([
                getVehicles(),
                getFuelLogs(),
                getMaintenanceLogs(),
                getFinancialAnalytics()
            ]);
            setVehicles(vehiclesData);
            setFuelLogs(fuelData);
            setMaintenanceLogs(maintenanceData);
            setAnalytics(analyticsData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExportCSV = (data, filename) => {
        exportToCSV(data, filename);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-sm">Loading Financial Dashboard...</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return <div className="h-screen flex items-center justify-center">Error loading analytics</div>;
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
                        { id: 'overview', label: 'Financial Overview', icon: <IconChart /> },
                        { id: 'fuel', label: 'Fuel Logs', icon: <IconFuel /> },
                        { id: 'maintenance', label: 'Maintenance Costs', icon: <IconTool /> },
                        { id: 'analytics', label: 'Operational Analytics', icon: <IconMoney /> },
                        { id: 'roi', label: 'ROI Reports', icon: <IconCash /> },
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
                            {activeView === 'overview' && 'Financial Overview'}
                            {activeView === 'fuel' && 'Fuel Logs'}
                            {activeView === 'maintenance' && 'Maintenance Costs'}
                            {activeView === 'analytics' && 'Operational Analytics'}
                            {activeView === 'roi' && 'ROI Reports'}
                        </h1>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                            FINANCIAL ANALYST CONSOLE • COST AUDIT SYSTEM
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-slate-800 tracking-tighter">{user.name}</span>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">
                                {user.role}
                            </span>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-indigo-100 flex items-center justify-center font-black text-indigo-700 bg-indigo-50 shadow-inner">
                            {user.avatar}
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-7xl mx-auto">
                    {/* KPI Cards - Show on all views */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KpiCard
                            title="Total Fuel Cost"
                            value={formatCurrency(analytics.summary.totalFuelCost)}
                            subtitle="All vehicles combined"
                            icon={<IconFuel />}
                            color="blue"
                        />
                        <KpiCard
                            title="Maintenance Cost"
                            value={formatCurrency(analytics.summary.totalMaintenanceCost)}
                            subtitle="Service & repairs"
                            icon={<IconTool />}
                            color="orange"
                        />
                        <KpiCard
                            title="Operational Cost"
                            value={formatCurrency(analytics.summary.totalOperationalCost)}
                            subtitle="Fuel + Maintenance"
                            icon={<IconMoney />}
                            color="purple"
                        />
                        <KpiCard
                            title="Avg Cost/Vehicle"
                            value={formatCurrency(analytics.summary.avgCostPerVehicle)}
                            subtitle="Per vehicle average"
                            icon={<IconChart />}
                            color="indigo"
                        />
                    </div>

                    {/* Financial Overview */}
                    {activeView === 'overview' && (
                        <FinancialOverview 
                            analytics={analytics} 
                            vehicles={vehicles}
                            formatCurrency={formatCurrency}
                        />
                    )}

                    {/* Fuel Logs */}
                    {activeView === 'fuel' && (
                        <FuelLogsView 
                            fuelLogs={fuelLogs}
                            vehicles={vehicles}
                            onAddFuel={() => setShowFuelModal(true)}
                            onRefresh={fetchData}
                            formatCurrency={formatCurrency}
                            handleExportCSV={handleExportCSV}
                        />
                    )}

                    {/* Maintenance Costs */}
                    {activeView === 'maintenance' && (
                        <MaintenanceView 
                            maintenanceLogs={maintenanceLogs}
                            vehicles={vehicles}
                            onAddMaintenance={() => setShowMaintenanceModal(true)}
                            onRefresh={fetchData}
                            formatCurrency={formatCurrency}
                            handleExportCSV={handleExportCSV}
                        />
                    )}

                    {/* Operational Analytics */}
                    {activeView === 'analytics' && (
                        <AnalyticsView 
                            analytics={analytics}
                            formatCurrency={formatCurrency}
                            formatNumber={formatNumber}
                        />
                    )}

                    {/* ROI Reports */}
                    {activeView === 'roi' && (
                        <ROIView 
                            analytics={analytics}
                            formatCurrency={formatCurrency}
                            handleExportCSV={handleExportCSV}
                        />
                    )}
                </div>
            </main>

            {/* Modals */}
            {showFuelModal && (
                <FuelModal
                    vehicles={vehicles}
                    onClose={() => setShowFuelModal(false)}
                    onSubmit={async (data) => {
                        try {
                            await createFuelLog(data);
                            await fetchData();
                            setShowFuelModal(false);
                        } catch (err) {
                            alert('Failed to add fuel log');
                        }
                    }}
                />
            )}

            {showMaintenanceModal && (
                <MaintenanceModal
                    vehicles={vehicles}
                    onClose={() => setShowMaintenanceModal(false)}
                    onSubmit={async (data) => {
                        try {
                            await createMaintenanceLog(data);
                            await fetchData();
                            setShowMaintenanceModal(false);
                        } catch (err) {
                            alert('Failed to add maintenance log');
                        }
                    }}
                />
            )}
        </div>
    );
}

// ─── View Components ─────────────────────────────────────────────────────────

function FinancialOverview({ analytics, vehicles, formatCurrency }) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-black text-slate-800 mb-4">Revenue vs Expenses</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Total Revenue</p>
                        <p className="text-3xl font-black text-emerald-700">{formatCurrency(analytics.summary.totalRevenue)}</p>
                    </div>
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                        <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-2">Total Expenses</p>
                        <p className="text-3xl font-black text-rose-700">{formatCurrency(analytics.summary.totalOperationalCost)}</p>
                    </div>
                </div>
                <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Net Profit</p>
                    <p className="text-3xl font-black text-indigo-700">
                        {formatCurrency(analytics.summary.totalRevenue - analytics.summary.totalOperationalCost)}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-800">Cost Breakdown by Vehicle</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fuel Cost</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Maintenance</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Cost</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {analytics.vehicleAnalytics.map(va => (
                                <tr key={va.vehicleId} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-black text-slate-700">{va.vehicleName}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600 text-right">{formatCurrency(va.fuelCost)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600 text-right">{formatCurrency(va.maintenanceCost)}</td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-800 text-right">{formatCurrency(va.totalCost)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">{formatCurrency(va.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function FuelLogsView({ fuelLogs, vehicles, onAddFuel, formatCurrency, handleExportCSV }) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800">Fuel Transaction History</h3>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleExportCSV(fuelLogs, 'fuel-logs.csv')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <IconDownload />
                        Export CSV
                    </button>
                    <button
                        onClick={onAddFuel}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                        + Add Fuel Log
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Liters</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cost</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">₹/Liter</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Odometer</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {fuelLogs.map(log => {
                                const vehicle = vehicles.find(v => v.id === log.vehicleId);
                                return (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-600">{log.date}</td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-700">{vehicle?.name || log.vehicleId}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-600 text-right">{log.liters}L</td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-800 text-right">{formatCurrency(log.cost)}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500 text-right">₹{log.costPerLiter}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500 text-right">{log.odometerReading?.toLocaleString()} km</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MaintenanceView({ maintenanceLogs, vehicles, onAddMaintenance, formatCurrency, handleExportCSV }) {
    // Calculate per-vehicle maintenance costs
    const vehicleMaintenanceCosts = vehicles.map(v => {
        const logs = maintenanceLogs.filter(m => m.vehicleId === v.id);
        const totalCost = logs.reduce((sum, m) => sum + m.cost, 0);
        return { vehicle: v, totalCost, count: logs.length };
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800">Maintenance Cost Analysis</h3>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleExportCSV(maintenanceLogs, 'maintenance-logs.csv')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <IconDownload />
                        Export CSV
                    </button>
                    <button
                        onClick={onAddMaintenance}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                        + Add Maintenance Log
                    </button>
                </div>
            </div>

            {/* Per-Vehicle Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicleMaintenanceCosts.map(({ vehicle, totalCost, count }) => (
                    <div key={vehicle.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <h4 className="text-sm font-black text-slate-800 mb-2">{vehicle.name}</h4>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500 font-bold">Total Cost:</span>
                                <span className="text-slate-800 font-black">{formatCurrency(totalCost)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500 font-bold">Services:</span>
                                <span className="text-slate-800 font-black">{count}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Maintenance Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Type</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cost</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {maintenanceLogs.map(log => {
                                const vehicle = vehicles.find(v => v.id === log.vehicleId);
                                return (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-slate-600">{log.date}</td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-700">{vehicle?.name || log.vehicleId}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{log.serviceType}</td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-800 text-right">{formatCurrency(log.cost)}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">{log.notes}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function AnalyticsView({ analytics, formatCurrency, formatNumber }) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-black text-slate-800 mb-6">Vehicle Performance Metrics</h3>
                <div className="space-y-4">
                    {analytics.vehicleAnalytics.map(va => (
                        <div key={va.vehicleId} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-black text-slate-800">{va.vehicleName}</h4>
                                <Badge color={va.roi > 0 ? 'green' : 'red'}>
                                    ROI: {va.roi}%
                                </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-xs">
                                <div>
                                    <p className="text-slate-500 font-bold mb-1">Fuel Efficiency</p>
                                    <p className="text-slate-800 font-black">{va.fuelEfficiency} km/L</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 font-bold mb-1">Total Cost</p>
                                    <p className="text-slate-800 font-black">{formatCurrency(va.totalCost)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 font-bold mb-1">Revenue</p>
                                    <p className="text-emerald-700 font-black">{formatCurrency(va.revenue)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 font-bold mb-1">Profit</p>
                                    <p className={`font-black ${va.revenue - va.totalCost > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {formatCurrency(va.revenue - va.totalCost)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ROIView({ analytics, formatCurrency, handleExportCSV }) {
    const sortedByROI = [...analytics.vehicleAnalytics].sort((a, b) => b.roi - a.roi);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800">Return on Investment Analysis</h3>
                <button
                    onClick={() => handleExportCSV(sortedByROI, 'roi-report.csv')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2"
                >
                    <IconDownload />
                    Export ROI Report
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acquisition Cost</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Expenses</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Profit</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">ROI %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sortedByROI.map(va => {
                                const netProfit = va.revenue - va.totalCost;
                                return (
                                    <tr key={va.vehicleId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-black text-slate-700">{va.vehicleName}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-600 text-right">{formatCurrency(va.acquisitionCost)}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">{formatCurrency(va.revenue)}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-rose-600 text-right">{formatCurrency(va.totalCost)}</td>
                                        <td className={`px-6 py-4 text-sm font-black text-right ${netProfit > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                            {formatCurrency(netProfit)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Badge color={va.roi > 0 ? 'green' : 'red'}>
                                                {va.roi > 0 ? '+' : ''}{va.roi}%
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Modal Components ────────────────────────────────────────────────────────

function FuelModal({ vehicles, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        vehicleId: '',
        liters: '',
        cost: '',
        odometerReading: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.vehicleId || !formData.liters || !formData.cost) {
            alert('Please fill all required fields');
            return;
        }
        onSubmit({
            ...formData,
            liters: parseFloat(formData.liters),
            cost: parseFloat(formData.cost),
            odometerReading: parseInt(formData.odometerReading) || 0
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <h3 className="text-2xl font-black text-slate-800 mb-6">Add Fuel Log</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                            Vehicle *
                        </label>
                        <select
                            value={formData.vehicleId}
                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        >
                            <option value="">Select vehicle...</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.name} - {v.plate}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                                Liters *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.liters}
                                onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                                Cost (₹) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.cost}
                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                                Odometer (km)
                            </label>
                            <input
                                type="number"
                                value={formData.odometerReading}
                                onChange={(e) => setFormData({ ...formData, odometerReading: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                                Date
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
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
                            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all"
                        >
                            Add Fuel Log
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function MaintenanceModal({ vehicles, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        vehicleId: '',
        serviceType: '',
        cost: '',
        odometerReading: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    const serviceTypes = [
        'Oil Change',
        'Tire Replacement',
        'Brake Service',
        'Engine Overhaul',
        'Transmission Repair',
        'AC Repair',
        'Suspension Work',
        'Battery Replacement',
        'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.vehicleId || !formData.serviceType || !formData.cost) {
            alert('Please fill all required fields');
            return;
        }
        onSubmit({
            ...formData,
            cost: parseFloat(formData.cost),
            odometerReading: parseInt(formData.odometerReading) || 0
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-black text-slate-800 mb-6">Add Maintenance Log</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                            Vehicle *
                        </label>
                        <select
                            value={formData.vehicleId}
                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        >
                            <option value="">Select vehicle...</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.name} - {v.plate}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                            Service Type *
                        </label>
                        <select
                            value={formData.serviceType}
                            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        >
                            <option value="">Select service type...</option>
                            {serviceTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                                Cost (₹) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.cost}
                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                                Odometer (km)
                            </label>
                            <input
                                type="number"
                                value={formData.odometerReading}
                                onChange={(e) => setFormData({ ...formData, odometerReading: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                            Date
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="3"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="Additional details..."
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
                            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all"
                        >
                            Add Maintenance Log
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
