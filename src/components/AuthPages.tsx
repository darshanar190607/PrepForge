import React, { useState } from 'react';
import { Hammer } from 'lucide-react';
import { User } from '../types';

interface AuthPagesProps {
  onLogin: (email: string, password: string) => Promise<any>;
  onRegisterRequest: (name: string, email: string, password: string, groupCode: string) => Promise<any>;
}

export default function AuthPages({ onLogin, onRegisterRequest }: AuthPagesProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('darshan.ar2024cce@sece.ac.in'); // Pre-fill with requested admin
  const [loginPassword, setLoginPassword] = useState('admin123'); // Default seeded admin password
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGroupCode, setRegGroupCode] = useState('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setLoginError('');
      await onLogin(loginEmail, loginPassword);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regGroupCode.trim()) {
      setRegisterError('All fields including Group Code are strictly required.');
      return;
    }

    if (regGroupCode.trim() !== 'CCEWIN') {
      setRegisterError('Invalid Group Code. Please check with your coordinator.');
      return;
    }

    try {
      setIsSubmitting(true);
      setRegisterError('');
      await onRegisterRequest(regName, regEmail, regPassword, regGroupCode);
      setIsSubmittedSuccess(true);
    } catch (err: any) {
      setRegisterError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6 relative select-none font-sans" id="auth-pages-container">
      {/* Visual Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#5C6FFF] rounded-lg flex items-center justify-center font-bold text-white shadow-sm">
          <Hammer size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-[#111111] tracking-tight">PrepForge</h1>
          <span className="text-[10px] text-[#888888] font-mono tracking-widest uppercase font-bold">Placement Preparation Platform</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E2E2] rounded-lg p-8 shadow-sm" id="auth-card">
        {!isRegisterMode ? (
          /* LOGIN MODE */
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-display font-bold text-[#111111]">Welcome Back</h2>
              <p className="text-[#888888] text-xs">Sign in to sync your challenges, streaks, and peer reviews.</p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-[#EF4444] text-xs font-mono rounded-lg">
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#111111] uppercase tracking-wider block font-mono">Email Address</label>
                <input
                  type="email"
                  placeholder="name@college.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-[#111111] px-3 py-2 text-xs rounded outline-none focus:border-[#5C6FFF] transition font-sans"
                  id="login-email-input"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-[#111111] uppercase tracking-wider block font-mono">Password</label>
                  <span className="text-[10px] text-[#888888] hover:underline cursor-pointer">Forgot Password?</span>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-[#111111] px-3 py-2 text-xs rounded outline-none focus:border-[#5C6FFF] transition font-sans"
                  id="login-password-input"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-[#5C6FFF] hover:bg-[#5C6FFF]/90 text-white text-xs font-bold rounded tracking-wide transition cursor-pointer"
                id="login-submit-btn"
              >
                Login
              </button>
            </form>

            <div className="pt-2 text-center text-xs">
              <span className="text-[#888888]">New to the platform? </span>
              <button
                onClick={() => {
                  setIsRegisterMode(true);
                  setIsSubmittedSuccess(false);
                }}
                className="text-[#5C6FFF] font-bold hover:underline cursor-pointer"
              >
                Join a Group
              </button>
            </div>
          </div>
        ) : (
          /* REGISTER / JOIN MODE */
          <div className="space-y-6">
            {!isSubmittedSuccess ? (
              <>
                <div className="space-y-1">
                  <h2 className="text-lg font-display font-bold text-[#111111]">Join Placement Group</h2>
                  <p className="text-[#888888] text-xs">Create your student record and provide your group join code.</p>
                </div>

                {registerError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-[#EF4444] text-xs font-mono rounded-lg">
                    ⚠️ {registerError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#111111] uppercase tracking-wider block font-mono">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Devendra Singh"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-[#111111] px-3 py-2 text-xs rounded outline-none focus:border-[#5C6FFF] transition font-sans"
                      id="register-name-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#111111] uppercase tracking-wider block font-mono">Email Address</label>
                    <input
                      type="email"
                      placeholder="dev.singh@student.edu"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-[#111111] px-3 py-2 text-xs rounded outline-none focus:border-[#5C6FFF] transition font-sans"
                      id="register-email-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#111111] uppercase tracking-wider block font-mono">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-[#111111] px-3 py-2 text-xs rounded outline-none focus:border-[#5C6FFF] transition font-sans"
                      id="register-password-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#111111] uppercase tracking-wider block font-mono">Group Code</label>
                    <input
                      type="text"
                      placeholder="e.g. CCEWIN"
                      value={regGroupCode}
                      onChange={(e) => setRegGroupCode(e.target.value)}
                      className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-[#111111] px-3 py-2 text-xs rounded outline-none focus:border-[#5C6FFF] transition font-sans"
                      id="register-groupcode-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-[#5C6FFF] hover:bg-[#5C6FFF]/90 text-white text-xs font-bold rounded tracking-wide transition cursor-pointer"
                    id="register-submit-btn"
                  >
                    Send Enrollment Request
                  </button>
                </form>

                <div className="pt-2 text-center text-xs">
                  <span className="text-[#888888]">Already requested? </span>
                  <button
                    onClick={() => setIsRegisterMode(false)}
                    className="text-[#5C6FFF] font-bold hover:underline cursor-pointer"
                  >
                    Go to Login
                  </button>
                </div>
              </>
            ) : (
              /* REGISTER SUCCESS STATE */
              <div className="text-center space-y-5 py-4" id="register-success-state">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  ⏳
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-base font-display font-bold text-[#111111]">Request Sent Successfully</h3>
                  <p className="text-[#EF4444] text-xs font-semibold uppercase font-mono tracking-wider">Waiting for Admin Approval</p>
                </div>
                
                <p className="text-xs text-[#888888] leading-relaxed">
                  Hi <strong>{regName}</strong>, your enrollment request has been registered under <strong>{regGroupCode}</strong>. Once the placement administrator reviews and approves, your account will become active.
                </p>

                 <div className="bg-slate-50 p-3.5 rounded border border-[#E2E2E2] text-left text-xs space-y-1 text-[#888888]">
                  <div className="font-bold text-[#111111] mb-1">How to test approval:</div>
                  <div>1. Log in using the admin account: <strong className="text-[#111111]">darshan.ar2024cce@sece.ac.in</strong> (password: <strong className="text-[#111111]">admin123</strong>)</div>
                  <div>2. Open the <strong>Cohort Management (Manage Cohort)</strong> page in the sidebar.</div>
                  <div>3. Click the <strong>Join Requests</strong> tab and approve your user!</div>
                </div>

                <button
                  onClick={() => setIsRegisterMode(false)}
                  className="w-full py-2 bg-[#111111] hover:bg-[#111111]/90 text-white text-xs font-bold rounded transition cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simulator Guidance Footer */}
      <div className="mt-8 text-[11px] text-[#888888] text-center max-w-sm leading-relaxed" id="auth-hint">
        <span className="font-bold text-[#111111]">Demo tip:</span> You can login with admin credentials <strong className="text-[#111111]">darshan.ar2024cce@sece.ac.in</strong> / <strong className="text-[#111111]">admin123</strong>, or classmate email <strong className="text-[#111111]">priya.patel@student.edu</strong> / <strong className="text-[#111111]">password123</strong>.
      </div>
    </div>
  );
}
