/* Prototype authentication/storage only. Production deployment requires secure departmental identity, encryption, access control and audit logging. */

import React from 'react';
import {
  User,
  Mail,
  Building2,
  FolderLock,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Activity,
  PlusCircle,
} from 'lucide-react';
import { InvestigatorProfile, SavedCase } from '../types';

interface InvestigatorProfileViewProps {
  investigator: InvestigatorProfile;
  cases: SavedCase[];
  onBackToCases: () => void;
  onNewInvestigation: () => void;
  onOpenCase: (sc: SavedCase) => void;
}

export const InvestigatorProfileView: React.FC<InvestigatorProfileViewProps> = ({
  investigator,
  cases,
  onBackToCases,
  onNewInvestigation,
  onOpenCase,
}) => {
  const activeCases = cases.filter((c) => !c.status.includes('Completed'));
  const completedCases = cases.filter((c) => c.status.includes('Completed'));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb / Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToCases}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← BACK TO MY CASES</span>
        </button>

        <button
          onClick={onNewInvestigation}
          className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ NEW INVESTIGATION</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-900 to-zinc-900 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
              <User className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 block">
                AUTHORIZED INVESTIGATOR
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-mono text-white tracking-wide">
                {investigator.name}
              </h2>
              <span className="text-xs font-mono text-zinc-400">ID: {investigator.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active Session • Verified Identity</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-zinc-500" />
              <span>Official Email</span>
            </span>
            <p className="font-mono text-xs font-bold text-zinc-200">{investigator.officialEmail}</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-zinc-500" />
              <span>Department / Unit</span>
            </span>
            <p className="font-mono text-xs font-bold text-zinc-200">{investigator.departmentUnit}</p>
          </div>
        </div>

        {/* Case Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-purple-900/30 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Active Cases
              </span>
              <span className="text-2xl font-black font-mono text-purple-300">
                {activeCases.length}
              </span>
            </div>
            <FolderLock className="w-8 h-8 text-purple-500/40" />
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-emerald-900/30 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                Completed Cases
              </span>
              <span className="text-2xl font-black font-mono text-emerald-300">
                {completedCases.length}
              </span>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0d0d14] p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>RECENT ACTIVITY</span>
        </h3>

        <div className="divide-y divide-zinc-800/80">
          {investigator.recentActivity.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
              <div className="space-y-0.5">
                <p className="text-xs font-mono font-medium text-zinc-200">
                  {act.description}
                </p>
                <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{act.timestamp}</span>
                </span>
              </div>

              {cases.find((c) => c.id === act.caseId) && (
                <button
                  onClick={() => {
                    const match = cases.find((c) => c.id === act.caseId);
                    if (match) onOpenCase(match);
                  }}
                  className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-zinc-700 font-mono text-[11px] font-bold cursor-pointer shrink-0"
                >
                  View Case
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
