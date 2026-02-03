import { FileText, Camera, CheckCircle, XCircle, ZoomIn, X } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useState, useRef } from 'react';

const VerificationCard = ({ title, type, data, onApprove, onReject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const errorCountRef = useRef(0);

  if (!data || data.status === 'not_submitted') return null;

  const documentData = data.data || data;

  const rawImageUrl = type === 'selfie'
    ? (documentData.selfieImage || documentData.selfieUrl || documentData.faceImage || documentData.imageUrl || data.selfieImage)
    : (documentData.documentPath || documentData.documentUrl || documentData.frontImage || documentData.imageUrl || data.documentPath);

  const API_BASE_URL = 'http://localhost:4000';

  const getFullImageUrl = (path) => {
    if (!path) return null;

    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // If it starts with a slash, append to base URL
    if (path.startsWith('/')) {
      return `${API_BASE_URL}${path}`;
    }

    // Otherwise, construct the full path
    return `${API_BASE_URL}/${path}`;
  };

  const imageUrl = getFullImageUrl(rawImageUrl);
  console.log('image url', imageUrl)


  const handleImageError = (e) => {
    errorCountRef.current += 1;

    // Stop trying after 1 error
    if (errorCountRef.current > 1) {
      console.error(`Stopped retrying image after multiple failures: ${imageUrl}`);
      return;
    }

    console.error(`Failed to load image: ${imageUrl}`);
    setImageError(true);

    // Prevent further error events
    e.target.onerror = null;
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="flex items-center gap-2 font-bold text-sm">
          {type === 'selfie'
            ? <Camera size={16} className="text-primary" />
            : <FileText size={16} className="text-primary" />
          }
          {title}
        </h3>

        <StatusBadge status={data.status} />
      </div>

      {/* Image Display */}
      {imageUrl ? (
        <div className="mb-4 flex-1 relative group">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover rounded-lg border border-white/10 cursor-pointer hover:opacity-90 transition"
            onClick={() => setIsModalOpen(true)}
            onError={handleImageError}
          />
          {/* Zoom overlay */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            <ZoomIn size={32} className="text-white" />
          </div>
        </div>
      ) : (
        <div className="mb-4 flex-1 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
          <div className="text-center text-gray-500 p-8">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">No image available</p>
          </div>
        </div>
      )}

      {/* Document Info */}
      {data.submittedAt && (
        <div className="mb-4 text-xs text-gray-400">
          <p>Submitted: {new Date(data.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      )}

      {/* Rejection Reason if rejected */}
      {data.status === 'rejected' && data.rejectionReason && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs font-bold text-red-400 mb-1">Rejection Reason:</p>
          <p className="text-xs text-red-300">{data.rejectionReason}</p>
        </div>
      )}


      {/* Action Buttons */}
      {data.status === 'pending_review' && (
        <div className="flex gap-2 mt-auto">
          <button
            onClick={onApprove}
            className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary/80 transition"
          >
            <CheckCircle size={14} /> Approve
          </button>
          <button
            onClick={onReject}
            className="flex-1 border border-red-500 text-red-400 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-500/10 transition"
          >
            <XCircle size={14} /> Reject
          </button>
        </div>
      )}


      {isModalOpen && imageUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition z-10"
          >
            <X size={24} className="text-white" />
          </button>

          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-black-200 p-4 rounded-t-xl border border-white/10">
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-sm text-gray-400">Click outside to close</p>
            </div>
            <div className="bg-black-100 p-4 rounded-b-xl border border-t-0 border-white/10">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationCard;