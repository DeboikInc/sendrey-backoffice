// components/kyc/RunnerRow.jsx
import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import DocPill from './DocPill';

export default function RunnerRow({ runner, view, i, onReview }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange/10 border border-orange/20 flex items-center justify-center text-[10px] font-bold text-orange shrink-0">
            {runner.firstName?.[0]}{runner.lastName?.[0]}
          </div>
          <div>
            <p className="text-sm text-white/80 font-medium">
              {runner.firstName} {runner.lastName}
            </p>
            <p className="text-[9px] text-white/30 mt-0.5 font-mono">{runner._id?.slice(-10)}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <p className="text-xs text-white/60">{runner.email}</p>
        <p className="text-[10px] text-white/30 mt-0.5">{runner.phone}</p>
      </td>
      <td className="px-5 py-3.5">
        {runner.pendingItems?.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {runner.pendingItems.map((item, idx) => <DocPill key={idx} label={item} />)}
          </div>
        ) : (
          <span className="text-[10px] text-white/30">
            {view === 'verified' ? 'All verified' : '—'}
          </span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <StatusBadge status={runner.runnerStatus} />
      </td>
      <td className="px-5 py-3.5 text-right">
        <button
          onClick={onReview}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange/10 border border-orange/20 text-orange text-[10px] font-bold hover:bg-orange/20 transition-all"
        >
          <Eye size={11} /> Review
        </button>
      </td>
    </tr>
  );
}