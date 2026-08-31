/* Prototype authentication/storage only. Production deployment requires secure departmental identity, encryption, access control and audit logging. */

import React, { useState } from 'react';
import { Logo } from './Logo';
import { Lock, Mail, KeyRound, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { DEMO_INVESTIGATOR } from '../data/mockInvestigator';

interface LoginScreenProps {
  onLogin: (email: string, name?: string) => void;
  onContinueDemo: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onContinueDemo,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin(email.trim());
    } else {
      // Default to demo if empty
      onContinueDemo();
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-[#0d0d14] p-6 sm:p-8 space-y-6 shadow-2xl shadow-purple-950/20">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 pb-2">
          <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner mb-1">
            <Logo size="md" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white uppercase">
            WELCOME BACK
          </h2>
          <p className="text-xs font-mono text-zinc-400">
            Authorised Investigator Access Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wide">
              Official Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                id="input-official-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@agency.gov.int"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                id="input-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono placeholder:text-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-signin"
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-950/40"
          >
            <span>SIGN IN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-[#0d0d14] px-3 text-[10px] font-mono text-zinc-500 uppercase">
            or quick demo access
          </span>
        </div>

        {/* Demo Option Button */}
        <button
          onClick={onContinueDemo}
          id="btn-demo-investigator"
          type="button"
          className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:border-purple-400"
        >
          <UserCheck className="w-4 h-4 text-purple-400" />
          <span>CONTINUE AS DEMO INVESTIGATOR</span>
        </button>

        {/* Prototype Notice */}
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[10px] font-mono text-zinc-400 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-zinc-400">
            <Lock className="w-3 h-3 text-purple-400" />
            <span>Prototype authentication — production deployment would use authorised departmental identity systems.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
