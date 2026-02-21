import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { loginApi, signupApi, googleAuthApi } from './api/auth';

// ─── In-Memory User Store ────────────────────────────────────────────────────
const DEMO_USERS = [
    { id: 1, name: 'Raj Mehta', email: 'manager@fleet.com', password: 'fleet123', role: 'Fleet Manager', roleKey: 'manager', avatar: 'RM', avatarColor: '#374151' },
    { id: 2, name: 'Priya Sharma', email: 'dispatch@fleet.com', password: 'fleet123', role: 'Dispatcher', roleKey: 'dispatcher', avatar: 'PS', avatarColor: '#374151' },
    { id: 3, name: 'Arjun Verma', email: 'safety@fleet.com', password: 'fleet123', role: 'Safety Officer', roleKey: 'safety', avatar: 'AV', avatarColor: '#374151' },
    { id: 4, name: 'Sneha Patel', email: 'finance@fleet.com', password: 'fleet123', role: 'Financial Analyst', roleKey: 'finance', avatar: 'SP', avatarColor: '#374151' },
];

const ROLE_PERMISSIONS = {
    manager: { access: ['Vehicles', 'Trips', 'Maintenance', 'Drivers', 'Expenses', 'Analytics'], restricted: [] },
    dispatcher: { access: ['Trip Management', 'Vehicle View', 'Driver View'], restricted: ['Maintenance', 'Expenses', 'Analytics'] },
    safety: { access: ['Driver Profiles', 'Maintenance Logs'], restricted: ['Trips', 'Expenses', 'Financial Reports'] },
    finance: { access: ['Expense Logs', 'Fuel Tracking', 'Analytics'], restricted: ['Trip Dispatch', 'Maintenance', 'Drivers'] },
};

const ROLE_ACCENT = { manager: '#0F172A', dispatcher: '#1E293B', safety: '#374151', finance: '#4B5563' };
const ROLE_BRIGHT = { manager: '#111827', dispatcher: '#1F2937', safety: '#374151', finance: '#4B5563' };

// ─── Icons ───────────────────────────────────────────────────────────────────
const Ico = ({ d, cls = 'w-4 h-4 text-gray-400' }) => (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
);
const IconEmail = () => <Ico d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />;
const IconLock = () => <Ico d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />;
const IconUser = () => <Ico d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
const IconPhone = () => <Ico d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L8.5 10.5a11.037 11.037 0 005 5l1.113-1.724a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />;
const IconBuilding = () => <Ico d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />;
const IconEye = ({ off }) => off
    ? <Ico cls="w-4 h-4" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    : <Ico cls="w-4 h-4" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9 0c0 4.418 3.134 8 9 8s9-3.582 9-8-3.134-8-9-8-9 3.582-9 8z" />;
const IconSpinner = () => (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

// ─── Fleet Illustration ───────────────────────────────────────────────────────
const FleetIllustration = () => (
    <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto opacity-90">
        <rect x="0" y="160" width="300" height="8" rx="4" fill="#374151" />
        <rect x="30" y="163" width="40" height="2" rx="1" fill="#4B5563" />
        <rect x="130" y="163" width="40" height="2" rx="1" fill="#4B5563" />
        <rect x="230" y="163" width="40" height="2" rx="1" fill="#4B5563" />
        <rect x="60" y="110" width="130" height="52" rx="6" fill="#111827" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="170" y="95" width="60" height="67" rx="6" fill="#111827" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="176" y="101" width="46" height="28" rx="3" fill="#1F2937" stroke="#374151" strokeWidth="1" />
        <rect x="226" y="148" width="10" height="5" rx="2" fill="#D1D5DB" />
        <circle cx="100" cy="163" r="13" fill="#1F2937" stroke="#E5E7EB" strokeWidth="2" />
        <circle cx="100" cy="163" r="6" fill="#374151" stroke="#4B5563" strokeWidth="1.5" />
        <circle cx="160" cy="163" r="13" fill="#1F2937" stroke="#E5E7EB" strokeWidth="2" />
        <circle cx="160" cy="163" r="6" fill="#374151" stroke="#4B5563" strokeWidth="1.5" />
        <circle cx="210" cy="163" r="13" fill="#1F2937" stroke="#9CA3AF" strokeWidth="2" />
        <circle cx="210" cy="163" r="6" fill="#374151" stroke="#6B7280" strokeWidth="1.5" />
        <line x1="240" y1="80" x2="270" y2="60" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
        <line x1="240" y1="70" x2="278" y2="70" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        <line x1="240" y1="60" x2="268" y2="42" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.3" />
        <circle cx="40" cy="70" r="18" fill="#374151" stroke="#4B5563" strokeWidth="1" />
        <text x="40" y="76" textAnchor="middle" fontSize="16">📍</text>
        <circle cx="265" cy="50" r="16" fill="#374151" stroke="#4B5563" strokeWidth="1" />
        <text x="265" y="56" textAnchor="middle" fontSize="14">📊</text>
        <circle cx="50" cy="130" r="14" fill="#374151" stroke="#4B5563" strokeWidth="1" />
        <text x="50" y="136" textAnchor="middle" fontSize="12">🛡️</text>
    </svg>
);

// ─── Left Branding Panel (dark grey) ─────────────────────────────────────────
const TESTIMONIALS = [
    { role: 'Fleet Manager', quote: '"Real-time visibility across 200+ vehicles has transformed how we operate."', name: 'Raj M.' },
    { role: 'Dispatcher', quote: '"Assigning trips and tracking drivers is now incredibly seamless."', name: 'Priya S.' },
    { role: 'Safety Officer', quote: '"Driver compliance monitoring keeps our fleet safe and audit-ready."', name: 'Arjun V.' },
    { role: 'Fin. Analyst', quote: '"Fuel and expense analytics have cut our operational costs by 18%."', name: 'Sneha P.' },
];

const LeftPanel = () => {
    const [tIdx, setTIdx] = useState(0);
    useEffect(() => { const t = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 4000); return () => clearInterval(t); }, []);
    const t = TESTIMONIALS[tIdx];
    return (
        <div className="hidden md:flex flex-col justify-between h-full p-10 relative overflow-hidden" style={{ background: '#1F2937' }}>
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#9CA3AF,transparent 70%)' }} />
            <div className="absolute -bottom-16 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#6B7280,transparent 70%)' }} />
            {/* Logo */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#374151,#111827)' }}>FF</div>
                    <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.04em' }}>Fleet<span className="text-gray-300">Flow</span></span>
                </div>
                <p className="text-gray-400 text-sm ml-1">Centralized Fleet Intelligence</p>
            </div>
            <div className="flex-1 flex items-center justify-center py-6"><FleetIllustration /></div>
            {/* Feature bullets */}
            <div className="space-y-3 mb-6">
                {[{ icon: '📍', label: 'Real-time vehicle tracking' }, { icon: '🛡️', label: 'Driver compliance monitoring' }, { icon: '📊', label: 'Financial performance analytics' }].map(f => (
                    <div key={f.label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>{f.icon}</div>
                        <span className="text-gray-300 text-sm">{f.label}</span>
                    </div>
                ))}
            </div>
            {/* Testimonial */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-gray-300 text-sm italic mb-2 leading-relaxed">{t.quote}</p>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-500 text-xs flex items-center justify-center font-semibold text-white">{t.name[0]}</div>
                    <span className="text-white text-xs font-medium">{t.name}</span>
                    <span className="text-gray-500 text-xs">· {t.role}</span>
                </div>
            </div>
        </div>
    );
};

// ─── Reusable Input ───────────────────────────────────────────────────────────
const inputBase = (err) =>
    `flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200 ${err ? 'border-red-400 bg-red-50' : 'border-[#D1D5DB] bg-[#F8FAFC] focus-within:border-[#374151] focus-within:shadow-[0_0_0_3px_rgba(55,65,81,0.12)]'
    }`;

const Input = ({ icon, rightElement, error, ...props }) => (
    <div>
        <div className={inputBase(error)}>
            <span className="shrink-0">{icon}</span>
            <input className="flex-1 bg-transparent text-gray-900 text-sm outline-none placeholder-gray-400 min-w-0" {...props} />
            {rightElement && <span className="shrink-0">{rightElement}</span>}
        </div>
        {error && <p className="text-red-500 text-xs mt-1 slide-down">⚠️ {error}</p>}
    </div>
);

// ─── Password strength ────────────────────────────────────────────────────────
const getStrength = pw => {
    if (!pw) return 0;
    if (pw.length >= 8 && /[0-9]/.test(pw) && /[A-Z]/.test(pw) && /[!@#$%^&*]/.test(pw)) return 4;
    if (pw.length >= 8 && /[0-9]/.test(pw)) return 3;
    if (pw.length >= 6) return 2;
    return 1;
};
const S_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const S_COLOR = ['', '#EF4444', '#F59E0B', '#6B7280', '#1A1A1A'];
const StrengthMeter = ({ password }) => {
    if (!password) return null;
    const s = getStrength(password);
    return (
        <div className="mt-2">
            <div className="flex items-center gap-2">
                <div className="flex gap-[3px] flex-1">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex-1 rounded-sm transition-all duration-200"
                            style={{ height: '3px', background: i <= s ? S_COLOR[s] : '#E5E7EB' }} />
                    ))}
                </div>
                <span className="text-[11px] font-medium shrink-0" style={{ color: S_COLOR[s], fontFamily: 'Inter,sans-serif' }}>{S_LABEL[s]}</span>
            </div>
        </div>
    );
};

// ─── Role configs ─────────────────────────────────────────────────────────────
const ROLES = [
    { key: 'manager', label: 'Fleet Manager', emoji: '🏢', desc: 'Full system access' },
    { key: 'dispatcher', label: 'Dispatcher', emoji: '🚚', desc: 'Trips & assignments' },
    { key: 'safety', label: 'Safety Officer', emoji: '🛡️', desc: 'Driver compliance' },
    { key: 'finance', label: 'Financial Analyst', emoji: '📊', desc: 'Costs & reports' },
];

const RoleCard = ({ role, selected, onClick }) => (
    <button type="button" onClick={onClick}
        className="relative p-3 rounded-xl border text-left transition-all duration-200"
        style={{ background: selected ? '#F1F5F9' : '#F8FAFC', borderColor: selected ? '#374151' : '#D1D5DB', boxShadow: selected ? '0 0 0 2px #374151' : 'none' }}
        onMouseEnter={e => { if (!selected) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#6B7280'; } }}
        onMouseLeave={e => { if (!selected) { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#D1D5DB'; } }}>
        {selected && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#1F2937' }}>
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
        )}
        <div className="text-xl mb-1">{role.emoji}</div>
        <div className="text-gray-900 text-xs font-semibold" style={{ fontFamily: 'Rajdhani,sans-serif' }}>{role.label}</div>
        <div className="text-gray-500 text-xs">{role.desc}</div>
    </button>
);

// ─── Demo role cards ──────────────────────────────────────────────────────────
const DEMO_CARDS = [
    { email: 'manager@fleet.com', role: 'Fleet Manager', emoji: '🏢' },
    { email: 'dispatch@fleet.com', role: 'Dispatcher', emoji: '🚚' },
    { email: 'safety@fleet.com', role: 'Safety Officer', emoji: '🛡️' },
    { email: 'finance@fleet.com', role: 'Financial Analyst', emoji: '📊' },
];

// ─── Google Button (real OAuth) ────────────────────────────────────────────
// Decodes JWT payload without a library (base64url → JSON)
const decodeJwt = (token) => {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(base64))
    } catch { return null }
}

const GoogleBtn = ({ label = 'Continue with Google', onLoginSuccess, onError }) => {
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // We send the access_token to the backend, which will verify it 
                // and return our own JWT + user profile.
                // NOTE: I'm updating the backend route logic to handle this.
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await res.json();

                // Instead of idToken, we'll send the profile for this demo 
                // to match the backend 'upsert' logic I already wrote.
                // In a real app, you'd send the idToken or Code.
                const result = await googleAuthApi(tokenResponse.access_token, profile);
                onLoginSuccess(result);
            } catch (err) {
                onError?.(err || 'Google sign-in failed');
            }
        },
        onError: () => onError?.('Google sign-in was cancelled or failed.'),
    });

    return (
        <button type="button" onClick={() => login()}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#D1D5DB] bg-white text-gray-700 text-sm font-medium transition-all duration-200 hover:bg-gray-50 hover:border-[#9CA3AF] hover:shadow-sm active:scale-[0.99]"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {label}
        </button>
    )
}

// ─── OR Divider ────────────────────────────────────────────────────────
const OrDivider = ({ label = 'or' }) => (
    <div className="flex items-center gap-3 my-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-gray-400 text-xs">{label}</span>
        <div className="flex-1 h-px bg-gray-200" />
    </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className="fixed top-5 right-5 z-50 toast-in">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium bg-white text-gray-800 border border-gray-200">
                {message}<button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-700 text-xs">✕</button>
            </div>
        </div>
    );
};

// ─── Dark grey button ─────────────────────────────────────────────────────────
const DarkBtn = ({ children, disabled, loading, onClick, type = 'submit' }) => (
    <button type={type} onClick={onClick} disabled={disabled}
        className="w-full py-3 rounded-xl text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.08em', background: disabled && !loading ? '#E5E7EB' : 'linear-gradient(135deg,#374151,#111827)', color: disabled && !loading ? '#9CA3AF' : '#FFFFFF' }}>
        {children}
    </button>
);

// ─── Post-Signup Success ──────────────────────────────────────────────────────
const SignupSuccess = ({ user, onProceed }) => (
    <div className="flex flex-col items-center text-center py-4 fade-slide-right">
        <div className="mb-5 pulse-in">
            <svg viewBox="0 0 100 100" className="w-24 h-24">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                <circle cx="50" cy="50" r="45" className="draw-check" fill="none" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" />
                <path className="draw-check" fill="none" stroke="#1F2937" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" d="M28 52l14 14 30-28" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Rajdhani,sans-serif' }}>Account Created Successfully!</h2>
        <p className="text-gray-500 mb-3">Welcome to FleetFlow, <span className="text-gray-900 font-semibold">{user.name}</span></p>
        <div className="px-4 py-1.5 rounded-full text-sm font-semibold mb-1 bg-gray-100 text-gray-700 border border-gray-200">{user.role}</div>
        <p className="text-gray-400 text-sm mb-6">Registered as a <span className="text-gray-700 font-medium">{user.role}</span></p>
        <DarkBtn onClick={onProceed} type="button">PROCEED TO LOGIN</DarkBtn>
    </div>
);

// ─── Post-Login Success ───────────────────────────────────────────────────────
const LoginSuccess = ({ user, onLogout }) => {
    const perms = ROLE_PERMISSIONS[user.roleKey] || { access: [], restricted: [] };
    return (
        <div className="flex flex-col items-center text-center py-2 fade-slide-right">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 pulse-in"
                style={{ background: 'linear-gradient(135deg,#374151,#111827)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                {user.avatar}
            </div>
            <p className="text-gray-500 text-sm mb-1">Welcome back!</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Rajdhani,sans-serif' }}>{user.name}</h2>
            <div className="px-4 py-1.5 rounded-full text-sm font-semibold mb-4 bg-gray-100 text-gray-700 border border-gray-200">{user.role}</div>
            <div className="w-full rounded-xl p-4 text-left mb-5 space-y-2 bg-gray-50 border border-gray-200">
                {perms.access.map(p => <div key={p} className="flex items-center gap-2 text-sm text-green-700"><span>✅</span><span>{p}</span></div>)}
                {perms.restricted.map(p => <div key={p} className="flex items-center gap-2 text-sm text-gray-400"><span>❌</span><span>{p}</span></div>)}
            </div>
            <DarkBtn type="button">ENTER DASHBOARD →</DarkBtn>
            <button onClick={onLogout} className="text-gray-400 text-sm hover:text-gray-700 transition-colors mt-3">← Sign in as different user</button>
        </div>
    );
};

// ─── Login Form ───────────────────────────────────────────────────────────────
const LoginForm = ({ users, onSuccess, prefillEmail, setPrefillEmail }) => {
    const [email, setEmail] = useState(prefillEmail || '');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [banner, setBanner] = useState(null);
    const [shake, setShake] = useState(false);
    const [selCard, setSelCard] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => { if (prefillEmail) { setEmail(prefillEmail); setPrefillEmail(''); } }, [prefillEmail]);

    const fillDemo = (card) => { setEmail(card.email); setSelCard(card.email); setErrors({}); setBanner(null); };

    const validate = () => {
        const e = {};
        if (!email.trim()) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
        if (!password) e.password = 'Password is required';
        return e;
    };

    const handleSubmit = async ev => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true); setBanner(null);
        try {
            const data = await loginApi(email, password);
            setBanner({ type: 'success', msg: `✅ Welcome back, ${data.user.name}!` });
            setTimeout(() => onSuccess(data), 1000);
        } catch (err) {
            setShake(true);
            setBanner({ type: 'error', msg: `❌ ${err || 'Login failed'}` });
            setTimeout(() => setShake(false), 600);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {toast && <Toast message={toast} onClose={() => setToast(null)} />}
            <form onSubmit={handleSubmit} className={shake ? 'shake' : ''}>
                {banner && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium slide-down border ${banner.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {banner.msg}
                    </div>
                )}
                <div className="space-y-3 mb-4">
                    <Input type="email" placeholder="Enter your email" icon={<IconEmail />}
                        value={email} onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: '' })); }} error={errors.email} autoComplete="email" />
                    <div>
                        <div className={inputBase(errors.password)}>
                            <IconLock />
                            <input type={showPw ? 'text' : 'password'} placeholder="Enter your password" value={password}
                                onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: '' })); }}
                                className="flex-1 bg-transparent text-gray-900 text-sm outline-none placeholder-gray-400" autoComplete="current-password" />
                            <button type="button" onClick={() => setShowPw(s => !s)} className="text-gray-400 hover:text-gray-700 transition-colors"><IconEye off={showPw} /></button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 slide-down">⚠️ {errors.password}</p>}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded accent-gray-700" />
                        <span className="text-gray-500 text-xs">Remember me</span>
                    </label>
                    <button type="button" onClick={() => setToast('📧 Password reset link sent to your email!')} className="text-xs text-gray-600 hover:text-gray-900 hover:underline transition-colors">Forgot Password?</button>
                </div>

                <DarkBtn loading={loading} disabled={loading}>{loading ? <><IconSpinner />AUTHENTICATING...</> : 'LOGIN'}</DarkBtn>

                <OrDivider />
                <GoogleBtn label="Continue with Google" onLoginSuccess={onSuccess} onError={(msg) => setBanner({ type: 'error', msg })} />

                <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-gray-200" /><span className="text-gray-400 text-xs whitespace-nowrap">— OR CONTINUE AS DEMO —</span><div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {DEMO_CARDS.map(card => {
                        const isSel = selCard === card.email;
                        return (
                            <button key={card.email} type="button" onClick={() => fillDemo(card)}
                                className="group relative p-3 rounded-xl text-left transition-all duration-200 border overflow-hidden"
                                style={{ background: isSel ? '#F1F5F9' : '#F8FAFC', borderColor: isSel ? '#374151' : '#D1D5DB', borderLeftWidth: '3px', boxShadow: isSel ? '0 0 0 2px #37415122' : '' }}
                                onMouseEnter={e => { if (!isSel) { e.currentTarget.style.borderColor = '#6B7280'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                onMouseLeave={e => { if (!isSel) { e.currentTarget.style.borderColor = isSel ? '#374151' : '#D1D5DB'; e.currentTarget.style.transform = ''; } }}>
                                {/* Hover badge */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-1.5 py-0.5 rounded text-[10px] font-medium text-white" style={{ background: '#1A1A1A' }}>Auto-fill →</div>
                                <div className="text-base mb-0.5">{card.emoji} <span className="text-gray-800 text-xs font-semibold ml-1" style={{ fontFamily: 'Rajdhani,sans-serif' }}>{card.role}</span></div>
                                <div className="text-gray-500 text-[10px] mb-1">{card.email}</div>
                                <div className="text-[11px] italic text-gray-400">↑ Click to auto-fill credentials</div>
                            </button>
                        );
                    })}
                </div>
            </form>
        </>
    );
};

// ─── Signup Form ──────────────────────────────────────────────────────────────
const SignupForm = ({ users, setUsers, onSuccess, onGoogleSuccess }) => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '', company: '' });
    const [role, setRole] = useState('');
    const [terms, setTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [showPw2, setShowPw2] = useState(false);
    const [banner, setBanner] = useState(null);

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };
    const pwMatch = form.confirm && form.password === form.confirm;
    const pwMismatch = form.confirm && form.password !== form.confirm;
    const isValid = form.name && form.email && form.password.length >= 8 && pwMatch && role && terms;

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Full name is required';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address';
        else if (users.find(u => u.email === form.email)) e.email = 'This email is already registered. Try logging in.';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
        if (!form.confirm) e.confirm = 'Please confirm your password';
        else if (!pwMatch) e.confirm = 'Passwords do not match';
        if (!role) e.role = 'Please select your role to continue';
        if (!terms) e.terms = 'You must accept the terms to continue';
        return e;
    };

    const handleSubmit = async ev => {
        ev.preventDefault();
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true); setBanner(null);
        try {
            const result = await signupApi({ ...form, role, roleKey: role });
            onSuccess(result.user);
        } catch (err) {
            setBanner({ type: 'error', msg: `❌ ${err || 'Signup failed'}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Input type="text" placeholder="John Smith" icon={<IconUser />} value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} />
            <Input type="email" placeholder="john@company.com" icon={<IconEmail />} value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} />

            <div>
                <div className={inputBase(errors.password)}>
                    <IconLock />
                    <input type={showPw ? 'text' : 'password'} placeholder="Create a password" value={form.password}
                        onChange={e => set('password', e.target.value)} className="flex-1 bg-transparent text-gray-900 text-sm outline-none placeholder-gray-400" />
                    <button type="button" onClick={() => setShowPw(s => !s)} className="text-gray-400 hover:text-gray-700 transition-colors"><IconEye off={showPw} /></button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 slide-down">⚠️ {errors.password}</p>}
                <StrengthMeter password={form.password} />
            </div>

            <div>
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-150"
                    style={{
                        background: pwMismatch ? '#FEF2F2' : pwMatch ? '#F0FDF4' : '#F8FAFC',
                        borderColor: pwMismatch ? '#EF4444' : pwMatch ? '#16A34A' : errors.confirm ? '#EF4444' : '#D1D5DB',
                        boxShadow: pwMatch ? '0 0 0 3px rgba(22,163,74,0.1)' : pwMismatch ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
                    }}>
                    <IconLock />
                    <input type={showPw2 ? 'text' : 'password'} placeholder="Repeat your password" value={form.confirm}
                        onChange={e => set('confirm', e.target.value)} className="flex-1 bg-transparent text-gray-900 text-sm outline-none placeholder-gray-400" />
                    <div className="flex items-center gap-1">
                        {form.confirm && pwMatch && (
                            <svg className="w-4 h-4 transition-all duration-150" style={{ color: '#16A34A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {form.confirm && pwMismatch && (
                            <svg className="w-4 h-4 transition-all duration-150" style={{ color: '#EF4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        <button type="button" onClick={() => setShowPw2(s => !s)} className="text-gray-400 hover:text-gray-700 transition-colors ml-1"><IconEye off={showPw2} /></button>
                    </div>
                </div>
                {form.confirm && pwMismatch && <p className="text-[11px] mt-1 slide-down font-medium" style={{ color: '#EF4444' }}>Passwords do not match</p>}
                {form.confirm && pwMatch && <p className="text-[11px] mt-1 slide-down font-medium" style={{ color: '#16A34A' }}>Passwords match</p>}
                {errors.confirm && !form.confirm && <p className="text-red-500 text-xs mt-1 slide-down">⚠️ {errors.confirm}</p>}
            </div>

            <div>
                <p className="text-gray-600 text-xs mb-2 font-medium">Select Your Role <span className="text-red-500">*</span></p>
                <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(r => <RoleCard key={r.key} role={r} selected={role === r.key} onClick={() => { setRole(r.key); setErrors(e => ({ ...e, role: '' })); }} />)}
                </div>
                {errors.role && <p className="text-red-500 text-xs mt-1 slide-down">⚠️ {errors.role}</p>}
            </div>

            <Input type="tel" placeholder="+91 98765 43210" icon={<IconPhone />} value={form.phone} onChange={e => set('phone', e.target.value)} />
            <Input type="text" placeholder="ABC Logistics Pvt. Ltd." icon={<IconBuilding />} value={form.company} onChange={e => set('company', e.target.value)} />

            <div>
                <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); setErrors(er => ({ ...er, terms: '' })); }} className="w-4 h-4 rounded accent-gray-700 mt-0.5 shrink-0" />
                    <span className="text-gray-500 text-xs leading-relaxed">
                        I agree to the <span className="text-gray-900 font-medium cursor-pointer hover:underline">Terms of Service</span> and <span className="text-gray-900 font-medium cursor-pointer hover:underline">Privacy Policy</span>
                    </span>
                </label>
                {errors.terms && <p className="text-red-500 text-xs mt-1 slide-down">⚠️ {errors.terms}</p>}
            </div>

            <DarkBtn disabled={!isValid || loading} loading={loading}>{loading ? <><IconSpinner />CREATING ACCOUNT...</> : 'CREATE ACCOUNT'}</DarkBtn>

            <OrDivider />
            <GoogleBtn label="Sign up with Google" onLoginSuccess={onGoogleSuccess} onError={(msg) => setBanner({ type: 'error', msg: msg })} />
        </form>
    );
};

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function FleetFlowAuth({ onLoginSuccess }) {
    const [users, setUsers] = useState(DEMO_USERS);
    const [tab, setTab] = useState('login');
    const [prevTab, setPrevTab] = useState('login');
    const [loggedInUser, setLoggedIn] = useState(null);
    const [signupDone, setSignupDone] = useState(null);
    const [prefillEmail, setPrefill] = useState('');

    const switchTab = t => { setPrevTab(tab); setTab(t); };
    const slideClass = tab === 'signup' && prevTab === 'login' ? 'fade-slide-right' : 'fade-slide-left';

    const handleProceed = () => { setPrefill(signupDone.email); setSignupDone(null); setTab('login'); };

    // If onLoginSuccess prop provided, hand off to parent (App router);
    // otherwise show internal success screen as before.
    const handleLoginSuccess = (user) => {
        if (onLoginSuccess) {
            onLoginSuccess(user);
        } else {
            setLoggedIn(user);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#F1F5F9' }}>
            {/* Animated dot grid */}
            <div className="fixed inset-0 dot-grid pointer-events-none" style={{ zIndex: 0 }} />
            {/* Orbs */}
            <div className="fixed pointer-events-none" style={{ top: '-10%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(55,65,81,0.07) 0%,transparent 70%)', zIndex: 0 }} />
            <div className="fixed pointer-events-none" style={{ bottom: '-15%', right: '-5%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(107,114,128,0.05) 0%,transparent 70%)', zIndex: 0 }} />

            {/* Main card */}
            <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden z-10"
                style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 20px 60px rgba(0,0,0,0.08),0 4px 20px rgba(0,0,0,0.04)', minHeight: '600px' }}>
                <div className="flex h-full">
                    {/* Left dark panel */}
                    <div className="hidden md:block" style={{ width: '45%', borderRight: '1px solid #E5E7EB' }}>
                        <LeftPanel />
                    </div>

                    {/* Right white panel */}
                    <div className="flex-1 flex flex-col" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="p-8">
                            {/* Mobile logo */}
                            <div className="md:hidden flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#374151,#111827)' }}>FF</div>
                                <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Rajdhani,sans-serif' }}>Fleet<span className="text-gray-500">Flow</span></span>
                            </div>

                            {loggedInUser ? (
                                <LoginSuccess user={loggedInUser} onLogout={() => { setLoggedIn(null); setTab('login'); }} />
                            ) : signupDone ? (
                                <SignupSuccess user={signupDone} onProceed={handleProceed} />
                            ) : (
                                <>
                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className="hidden md:flex items-center gap-2 mb-1">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#374151,#111827)' }}>FF</div>
                                            <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Rajdhani,sans-serif' }}>Fleet<span className="text-gray-500">Flow</span></span>
                                        </div>
                                        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Rajdhani,sans-serif' }}>
                                            {tab === 'login' ? 'Sign In to Your Account' : 'Create Your Account'}
                                        </h1>
                                        <p className="text-gray-400 text-sm">{tab === 'login' ? 'Access your fleet management dashboard' : 'Join the FleetFlow platform today'}</p>
                                    </div>

                                    {/* Tab switcher */}
                                    <div className="flex p-1 rounded-xl mb-6" style={{ background: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                                        {['login', 'signup'].map(t => (
                                            <button key={t} onClick={() => switchTab(t)}
                                                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                                                style={{ fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.05em', background: tab === t ? 'linear-gradient(135deg,#374151,#111827)' : 'transparent', color: tab === t ? '#FFFFFF' : '#6B7280' }}>
                                                {t === 'login' ? 'Login' : 'Sign Up'}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Form */}
                                    <div key={tab} className={slideClass}>
                                        {tab === 'login'
                                            ? <LoginForm users={users} onSuccess={handleLoginSuccess} prefillEmail={prefillEmail} setPrefillEmail={setPrefill} />
                                            : <SignupForm users={users} setUsers={setUsers} onSuccess={setSignupDone} onGoogleSuccess={handleLoginSuccess} />
                                        }
                                    </div>

                                    <p className="text-center text-gray-400 text-sm mt-4">
                                        {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                                        <button onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')} className="font-medium text-gray-700 hover:text-gray-900 hover:underline transition-colors">
                                            {tab === 'login' ? 'Sign Up' : 'Login'}
                                        </button>
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
