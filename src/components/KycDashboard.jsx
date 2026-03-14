// admin-dashboard/src/pages/KycDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, Eye, Clock, UserCheck, RefreshCw } from 'lucide-react';
import VerificationCard from './VerificationCard';

// Import admin KYC actions
import {
    getPendingKYC,
    getRunnerKYCDetails,
    approveDocument,
    rejectDocument,
    approveSelfie,
    rejectSelfie,
    clearSelectedRunner,
    getVerifiedRunners
} from '../Redux/kycSlice'; // Make sure to import the correct slice

export default function KycDashboard() {
    const [view, setView] = useState('pending');
    const [selectedRunner, setSelectedRunner] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const dispatch = useDispatch();

    // Get state from admin KYC slice
    const {
        pendingRunners,
        totalPending,
        verifiedRunners,
        selectedRunner: detailedRunner,
        status,
        error
    } = useSelector(state => state.adminKyc); // Make sure this matches your slice name

    // Fetch pending runners on mount
    useEffect(() => {
        dispatch(getPendingKYC());
        dispatch(getVerifiedRunners());
    }, [dispatch]);

    // Handle approve document
    const handleApproveDocument = (runnerId, documentType) => {
        dispatch(approveDocument({ runnerId, documentType }));
    };


    const handleRejectDocument = (runnerId, documentType) => {
        if (!rejectReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        dispatch(rejectDocument({ runnerId, documentType, reason: rejectReason }));
        setRejectReason('');
    };

    // Handle approve selfie
    const handleApproveSelfie = (runnerId) => {
        dispatch(approveSelfie(runnerId));
    };

    // Handle reject selfie
    const handleRejectSelfie = (runnerId) => {
        if (!rejectReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }
        dispatch(rejectSelfie({ runnerId, reason: rejectReason }));
        setRejectReason('');
    };

    // Handle reviewing a runner
    const handleReviewRunner = async (runner) => {
        setSelectedRunner(runner);
        await dispatch(getRunnerKYCDetails(runner.id));
    };


    const displayData = useMemo(() => {
        return view === 'pending'
            ? pendingRunners
            : verifiedRunners || [];
    }, [view, pendingRunners, verifiedRunners]);

    // Count verified runners
    const verifiedCount = (verifiedRunners || []).length;

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(getPendingKYC());
            await dispatch(getVerifiedRunners());
        } finally {
            setRefreshing(false);
        }
    };

    // Debug: Log the data
    useEffect(() => {
        console.log('Pending Runners:', pendingRunners);
        console.log('Display Data:', displayData);
    }, [pendingRunners, displayData]);

    return (
        <div className="min-h-screen bg-black-100 text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Nav */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <p className="text-gray-400 text-sm">Manage runner identity and document compliance</p>
                        <div className="mt-2">
                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs">
                                Total Pending: {totalPending}
                            </span>
                            {status === 'loading' && (
                                <span className="ml-2 text-yellow-400">Loading...</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-5">
                            {/* Add Refresh Button Here */}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing || status === 'loading'}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-bold disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setView('pending')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${view === 'pending' ? 'bg-primary' : ''}`}
                        >
                            <Clock size={16} /> Pending ({totalPending})
                        </button>
                        <button
                            onClick={() => setView('verified')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${view === 'verified' ? 'bg-primary' : ''}`}
                        >
                            <UserCheck size={16} /> Verified ({verifiedCount})
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
                        Error: {error}
                    </div>
                )}

                {/* Table Area */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs uppercase text-gray-400">
                            <tr>
                                <th className="p-4">Runner</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Pending Items</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayData.map(runner => {
                                return (
                                    <tr key={runner.id} className="hover:bg-white/5 transition">
                                        <td className="p-4">
                                            <div className="font-bold">{runner.firstName} {runner.lastName}</div>
                                            <div className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                                {runner.id}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            <div>{runner.email}</div>
                                            <div>{runner.phone}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {runner.pendingItems && runner.pendingItems.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {runner.pendingItems.map((item, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded text-xs">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-xs">
                                                    {view === 'verified' ? 'All Verified' : 'None'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${runner.runnerStatus === 'pending_verification'
                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                : runner.runnerStatus === 'approved_full'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : runner.runnerStatus === 'approved_limited'
                                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                }`}>
                                                {runner.runnerStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleReviewRunner(runner)}
                                                className="bg-primary px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 hover:opacity-90 transition"
                                            >
                                                <Eye size={14} /> Review
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {displayData.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            {status === 'loading' ? (
                                <div>Loading runners...</div>
                            ) : (
                                <div>No runners found for "{view}" status</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {detailedRunner && (
                <RunnerDetailModal
                    runner={detailedRunner}
                    onClose={() => {
                        setSelectedRunner(null);
                        dispatch(clearSelectedRunner())
                    }}
                    onApproveDocument={handleApproveDocument}
                    onRejectDocument={handleRejectDocument}
                    onApproveSelfie={handleApproveSelfie}
                    onRejectSelfie={handleRejectSelfie}
                    rejectReason={rejectReason}
                    setRejectReason={setRejectReason}
                />
            )}
        </div>
    );
}

// Enhanced Detail Modal Component
function RunnerDetailModal({
    runner,
    onClose,
    onApproveDocument,
    onRejectDocument,
    onApproveSelfie,
    onRejectSelfie,
    rejectReason,
    setRejectReason
}) {
    const verificationDocs = runner.documents || runner.verificationDocuments || {};
    const biometricData = runner.biometrics || runner.biometricVerification || {};

    // Determine which document to show
    let idDoc = null;

    const documentTypes = ['nin', 'driverLicense'];

    for (const docType of documentTypes) {
        const doc = verificationDocs[docType];
        if (doc && doc.status === 'pending_review') {
            idDoc = {
                title: docType === 'nin' ? "NIN Document" :
                    docType === 'driverLicense' ? "Driver's License" : null,
                data: doc,
                type: 'id',
                documentType: docType
            };
            break;
        }
    }

    if (!idDoc) {
        for (const docType of documentTypes) {
            const doc = verificationDocs[docType];
            if (doc) {
                idDoc = {
                    title: docType === 'nin' ? "NIN Document" :
                        docType === 'driverLicense' ? "Driver's License" : null,
                    data: doc,
                    type: 'id',
                    documentType: docType
                };
                break;
            }
        }
    }

    const selfieDoc = (biometricData && biometricData.status !== 'not_submitted') ? {
        title: "Selfie Image",
        type: "selfie",
        data: biometricData
    } : null;

    const handleApproveAll = () => {
        // Only approve if status is pending_review
        if (idDoc && idDoc.data.status === 'pending_review') {
            onApproveDocument(runner.id, idDoc.documentType);
        }
        if (selfieDoc && selfieDoc.data.status === 'pending_review') {
            onApproveSelfie(runner.id);
        }
    };

    const hasPendingItems = (idDoc?.data.status === 'pending_review') || (selfieDoc?.data.status === 'pending_review');

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black-200 w-full max-w-2xl max-h-[85vh] border border-white/10 shadow-2xl rounded-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black-200">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition text-gray-400">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-black">{runner.firstName} {runner.lastName}</h2>
                            <div className="flex gap-1 justify-center mt-1">
                                <p className='text-md text-gray-100'>status:</p>
                                <span className={`text-xs px-2 py-1 rounded ${runner.runnerStatus === 'pending_verification'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-green-500/20 text-green-400'
                                    }`}>
                                    {runner.runnerStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">{runner.email}</div>
                        <div className="text-sm text-gray-400 flex gap-2"><span className='text-gray-100'>Phone:</span>{runner.phone}</div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto bg-black-100">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ID Card */}
                        {idDoc && (
                            <VerificationCard
                                title={idDoc.title}
                                data={idDoc.data}
                                type="id"
                                onApprove={() => onApproveDocument(runner.id, idDoc.documentType)}
                                onReject={() => onRejectDocument(runner.id, idDoc.documentType)}
                            />
                        )}

                        {/* Selfie Card */}
                        {selfieDoc && (
                            <VerificationCard
                                title={selfieDoc.title}
                                type="selfie"
                                data={selfieDoc.data}
                                onApprove={() => onApproveSelfie(runner.id)}
                                onReject={() => onRejectSelfie(runner.id)}
                            />
                        )}
                    </div>

                    {/* Info if no pending items */}
                    {!idDoc && !selfieDoc && (
                        <div className="text-center py-8 text-gray-500">
                            No pending verifications for this runner
                        </div>
                    )}

                    {/* Action Buttons */}
                    {hasPendingItems && (
                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={handleApproveAll}
                                className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-bold transition"
                            >
                                Approve All ({(idDoc?.data.status === 'pending_review' ? 1 : 0) + (selfieDoc?.data.status === 'pending_review' ? 1 : 0)})
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold transition border border-white/10"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}