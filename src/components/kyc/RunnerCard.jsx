// components/kyc/RunnerCard.jsx
import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import DocPill from './DocPill';

export default function RunnerCard({ runner, view, i, onReview }) {
  return (
    <div className="p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">

      {/* Name + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-orange/10 border border-orange/20 flex items-center justify-center text-[10px] font-bold text-orange shrink-0">
            {runner.firstName?.[0]}{runner.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white/80 font-medium truncate">
              {runner.firstName} {runner.lastName}
            </p>
            <p className="text-[9px] text-white/30 font-mono mt-0.5">{runner._id?.slice(-10)}</p>
          </div>
        </div>
        <StatusBadge status={runner.runnerStatus} />
      </div>

      {/* Contact */}
      <div className="mt-2.5 space-y-0.5">
        <p className="text-xs text-white/50 truncate">{runner.email}</p>
        <p className="text-[10px] text-white/30">{runner.phone}</p>
      </div>

      {/* Pending items */}
      {runner.pendingItems?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {runner.pendingItems.map((item, idx) => <DocPill key={idx} label={item} />)}
        </div>
      )}
      {!runner.pendingItems?.length && view === 'verified' && (
        <p className="mt-2 text-[10px] text-white/30">All verified</p>
      )}

      {/* Review button */}
      <button
        onClick={onReview}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-orange/10 border border-orange/20 text-orange text-xs font-bold hover:bg-orange/20 transition-all"
      >
        <Eye size={12} /> Review Runner
      </button>
    </div>
  );
}