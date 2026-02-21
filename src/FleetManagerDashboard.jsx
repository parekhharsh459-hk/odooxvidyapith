import { useState, useMemo, useEffect } from 'react'
import CommandCenter from './pages/CommandCenter'
import VehicleRegistry from './pages/VehicleRegistry'
import TripOversight from './pages/TripOversight'
import MaintenanceLogs from './pages/MaintenanceLogs'
import DriverProfiles from './pages/DriverProfiles'
import FuelExpenses from './pages/FuelExpenses'
import OperationalAnalytics from './pages/OperationalAnalytics'
import FinancialReports from './pages/FinancialReports'
import * as api from './api/fleet'

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function FleetManagerDashboard({ user, onLogout }) {
    const [page, setPage] = useState('command')
    const [collapsed, setCollapsed] = useState(false)
    const [vehicles, setVehicles] = useState([])
    const [drivers, setDrivers] = useState([])
    const [trips, setTrips] = useState([])
    const [maintenance, setMaintenance] = useState([])
    const [fuel, setFuel] = useState([])
    const [activity, setActivity] = useState([])
    const [loading, setLoading] = useState(true)

    const sidebarW = collapsed ? 64 : 220

    const refreshData = async () => {
        try {
            const [v, d, t, m, f, a] = await Promise.all([
                api.getVehicles(),
                api.getDrivers(),
                api.getTrips(),
                api.getMaintenance(),
                api.getFuel(),
                api.getActivities()
            ]);
            setVehicles(v);
            setDrivers(d);
            setTrips(t);
            setMaintenance(m);
            setFuel(f);
            setActivity(a);
        } catch (err) {
            console.error('Failed to refresh fleet data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const addActivity = async (msg, type = 'info') => {
        // In this implementation, the backend handles activity logging on specific actions (like add vehicle)
        // For UI feedback, we can refresh data to see the new activity
        refreshData();
    }

    // Shared state and mutation wrappers
    const pageProps = {
        vehicles, setVehicles: async (newV) => {
            // This is a bit of a hack to support the existing component architecture 
            // which expects a setter. In a real app we'd call specific API methods.
            refreshData();
        },
        drivers, setDrivers: refreshData,
        trips, setTrips: refreshData,
        maintenance, setMaintenance: refreshData,
        fuel, setFuel: refreshData,
        activity, addActivity,
        onMutation: refreshData // Tell components to refresh after an API call
    }

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-bold text-gray-400">Syncing with FleetFlow Cloud...</div>

    return (
        <div style={{ '--sidebar-w': `${sidebarW}px` }}>
            <Sidebar active={page} onNav={setPage} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
            <TopNav user={user} page={page} onLogout={onLogout} sidebarW={sidebarW} />
            <main className="transition-all duration-300 pt-[60px] min-h-screen bg-gray-50"
                style={{ marginLeft: `${sidebarW}px` }}>
                <div className="p-6">
                    {page === 'command' && <CommandCenter     {...pageProps} />}
                    {page === 'vehicles' && <VehicleRegistry   {...pageProps} />}
                    {page === 'trips' && <TripOversight     {...pageProps} />}
                    {page === 'maintenance' && <MaintenanceLogs   {...pageProps} />}
                    {page === 'drivers' && <DriverProfiles    {...pageProps} />}
                    {page === 'fuel' && <FuelExpenses       {...pageProps} />}
                    {page === 'analytics' && <OperationalAnalytics {...pageProps} />}
                    {page === 'financial' && <FinancialReports  {...pageProps} />}
                </div>
            </main>
        </div>
    )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
    { key: 'command', icon: '⚡', label: 'Command Center' },
    { key: 'vehicles', icon: '🚛', label: 'Vehicle Registry' },
    { key: 'trips', icon: '🗺️', label: 'Trip Oversight' },
    { key: 'maintenance', icon: '🔧', label: 'Maintenance Logs' },
    { key: 'drivers', icon: '👤', label: 'Driver Profiles' },
    { key: 'fuel', icon: '⛽', label: 'Fuel & Expenses' },
    { key: 'analytics', icon: '📊', label: 'Operational Analytics' },
    { key: 'financial', icon: '💰', label: 'Financial Reports' },
]

const Sidebar = ({ active, onNav, collapsed, onToggle }) => (
    <aside className="fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300"
        style={{ width: collapsed ? '64px' : '220px', background: '#0F172A', borderRight: '1px solid #1E293B' }}>
        <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: '#1E293B', minHeight: '60px' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#374151,#1F2937)' }}>FF</div>
            {!collapsed && <span className="text-white font-bold text-lg" style={{ fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.04em' }}>FleetFlow</span>}
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
            {NAV.map(item => {
                const isActive = active === item.key
                return (
                    <button key={item.key} onClick={() => onNav(item.key)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 relative"
                        style={{
                            background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                            color: isActive ? '#A5B4FC' : '#94A3B8',
                            borderLeft: isActive ? '3px solid #818CF8' : '3px solid transparent',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                        <span className="text-lg shrink-0">{item.icon}</span>
                        {!collapsed && <span className="text-sm font-medium" style={{ fontFamily: 'DM Sans,sans-serif' }}>{item.label}</span>}
                    </button>
                )
            })}
        </nav>
        <button onClick={onToggle} className="flex items-center justify-center py-3 border-t" style={{ borderColor: '#1E293B', color: '#475569' }}>
            <span className="text-lg">{collapsed ? '→' : '←'}</span>
        </button>
    </aside>
)

const TopNav = ({ user, page, onLogout, sidebarW }) => {
    const pageLabel = NAV.find(n => n.key === page)
    return (
        <header className="fixed top-0 right-0 z-20 flex items-center justify-between px-6"
            style={{ height: '60px', background: '#FFFFFF', borderBottom: '1px solid #E5E7EB', left: `${sidebarW}px`, transition: 'left 0.3s' }}>
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0 leading-none">{pageLabel?.icon}</span>
                <h2 className="font-bold text-gray-800 text-sm truncate" style={{ fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.05em' }}>{pageLabel?.label}</h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">{user.name}</p>
                    <p className="text-xs text-gray-400 whitespace-nowrap">{user.role}</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg,#374151,#111827)' }}>{user.avatar}</div>
                <button onClick={onLogout} title="Logout" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all text-sm shrink-0">⎋</button>
            </div>
        </header>
    )
}
