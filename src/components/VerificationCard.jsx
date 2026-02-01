import { FileText, Camera, CheckCircle, XCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

const VerificationCard = ({ title, type, data, onApprove, onReject }) => {
  if (!data || data.status === 'not_submitted') return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="flex items-center gap-2 font-bold text-sm">
          {type === 'selfie' ? <Camera size={16} className="text-primary"/> : <FileText size={16} className="text-primary"/>}
          {title}
        </h3>
        <StatusBadge status={data.status} />
      </div>

      <img 
        src={type === 'selfie' ? data.selfieImage : data.documentPath} 
        className="w-full aspect-video object-cover rounded-lg mb-4 cursor-pointer hover:opacity-80 transition"
        onClick={() => window.open(type === 'selfie' ? data.selfieImage : data.documentPath, '_blank')}
        alt={title}
      />

      {data.status === 'pending_review' && (
        <div className="flex gap-2 mt-auto">
          <button onClick={onApprove} className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
            <CheckCircle size={14}/> Approve
          </button>
          <button onClick={onReject} className="flex-1 border border-secondary text-secondary py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-secondary/10">
            <XCircle size={14}/> Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default VerificationCard;