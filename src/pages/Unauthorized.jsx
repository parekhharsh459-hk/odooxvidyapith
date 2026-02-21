export default function Unauthorized({ user, onLogout }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto p-8">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Access Denied</h1>
                <p className="text-gray-500 mb-1">
                    Your role — <span className="font-semibold text-gray-700">{user?.role}</span> — does not have access to this section.
                </p>
                <p className="text-gray-400 text-sm mb-6">Please contact your administrator if you believe this is an error.</p>
                <button
                    onClick={onLogout}
                    className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg,#374151,#111827)', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.06em' }}>
                    ← Back to Login
                </button>
            </div>
        </div>
    )
}
