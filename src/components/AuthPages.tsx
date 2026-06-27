import React, { useState } from 'react';
import { Hammer, Eye, EyeOff, BookOpen } from 'lucide-react';

interface AuthPagesProps {
  onLogin: (email: string, password: string) => Promise<any>;
  onRegisterRequest: (name: string, email: string, password: string, groupCode: string, department?: string, year?: string) => Promise<any>;
}

export default function AuthPages({ onLogin, onRegisterRequest }: AuthPagesProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('darshan.ar2024cce@sece.ac.in');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGroupCode, setRegGroupCode] = useState('');
  const [regDept, setRegDept] = useState('CCE');
  const [regYear, setRegYear] = useState('3rd');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) { setLoginError('Enter email and password.'); return; }
    try {
      setSubmitting(true); setLoginError('');
      await onLogin(loginEmail, loginPassword);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials.');
    } finally { setSubmitting(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regGroupCode.trim()) {
      setRegError('All fields are required.'); return;
    }
    if (regGroupCode.trim().toUpperCase() !== 'CCEWIN') {
      setRegError('Invalid Group Code. Contact your admin.'); return;
    }
    try {
      setSubmitting(true); setRegError('');
      await onRegisterRequest(regName, regEmail, regPassword, regGroupCode, regDept, regYear);
      setRegSuccess(true);
    } catch (err: any) {
      setRegError(err.message || 'Registration failed.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex flex-col items-center justify-center p-6" id="auth-container">
      {/* Brand */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <BookOpen size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">PrepForge</h1>
          <span className="text-[10px] text-indigo-500 font-semibold tracking-widest uppercase font-mono">Quiz & Learning Platform</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="auth-card">
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400" />

        <div className="p-8">
          {!isRegisterMode ? (
            /* === LOGIN === */
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
                <p className="text-slate-500 text-sm mt-0.5">Sign in to access your quizzes and results.</p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                    placeholder="email@college.edu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2.5 pr-10 text-sm rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <button
                  id="login-btn"
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
                >
                  {submitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500">
                New student?{' '}
                <button onClick={() => { setIsRegisterMode(true); setRegSuccess(false); }}
                  className="text-indigo-600 font-semibold hover:underline cursor-pointer">
                  Request Access
                </button>
              </p>

              {/* Demo hint */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700">Demo credentials</div>
                <div>Admin: <span className="font-mono text-slate-900">darshan.ar2024cce@sece.ac.in</span> / <span className="font-mono">admin123</span></div>
                <div>Student: <span className="font-mono text-slate-900">priya.patel@student.edu</span> / <span className="font-mono">password123</span></div>
              </div>
            </div>
          ) : (
            /* === REGISTER === */
            <div className="space-y-6">
              {!regSuccess ? (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Request Access</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Enter your details and department group code.</p>
                  </div>

                  {regError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                      {regError}
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Full Name</label>
                      <input id="reg-name" type="text" value={regName} onChange={e => setRegName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                        placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Email</label>
                      <input id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                        placeholder="name@college.edu" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Department</label>
                        <select value={regDept} onChange={e => setRegDept(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-indigo-500 transition">
                          <option>CCE</option><option>CSE</option><option>ECE</option><option>EEE</option><option>MECH</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Year</label>
                        <select value={regYear} onChange={e => setRegYear(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-indigo-500 transition">
                          <option>1st</option><option>2nd</option><option>3rd</option><option>4th</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Password</label>
                      <input id="reg-password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                        placeholder="Choose a strong password" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Group Code</label>
                      <input id="reg-groupcode" type="text" value={regGroupCode} onChange={e => setRegGroupCode(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition font-mono tracking-widest"
                        placeholder="e.g. CCEWIN" />
                    </div>
                    <button id="reg-btn" type="submit" disabled={submitting}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
                      {submitting ? 'Sending Request...' : 'Send Enrollment Request'}
                    </button>
                  </form>

                  <p className="text-center text-sm text-slate-500">
                    Already registered?{' '}
                    <button onClick={() => setIsRegisterMode(false)}
                      className="text-indigo-600 font-semibold hover:underline cursor-pointer">Sign In</button>
                  </p>
                </>
              ) : (
                /* Success */
                <div className="text-center py-4 space-y-5" id="reg-success">
                  <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-2xl">⏳</div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Request Submitted!</h3>
                    <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mt-1">Awaiting Admin Approval</p>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Hi <strong className="text-slate-900">{regName}</strong>, your request has been submitted.
                    An admin will review and approve your account. You'll be able to access quizzes once approved.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-500 text-left space-y-1.5">
                    <p className="font-semibold text-slate-700">What happens next?</p>
                    <p>1. Admin reviews your request in the Student Management panel.</p>
                    <p>2. Once approved, you'll receive access to all published quizzes.</p>
                    <p>3. Login with your registered email and password.</p>
                  </div>
                  <button onClick={() => setIsRegisterMode(false)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition cursor-pointer">
                    Return to Login
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
