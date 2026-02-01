import React, { useState } from 'react';
import { mockRunners } from '../data';
import { ChevronLeft, Eye, Clock, UserCheck } from 'lucide-react';
import VerificationCard from '../components/VerificationCard';

export default function KycDashboard() {
    const [view, setView] = useState('pending');
    const [selectedRunner, setSelectedRunner] = useState(null);

    // Filter based on view
    const displayData = mockRunners.filter(r =>
        view === 'pending' ? r.runnerStatus === 'pending' : r.runnerStatus === 'verified'
    );

    return (
        <div className="min-h-screen bg-black-100 text-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Nav */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-black">SENDREY KYC DASHBOARD</h1>
                        <p className="text-gray-400 text-sm">Manage runner identity and document compliance</p>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button onClick={() => setView('pending')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${view === 'pending' ? 'bg-primary' : ''}`}>
                            <Clock size={16} /> Pending
                        </button>
                        <button onClick={() => setView('verified')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${view === 'verified' ? 'bg-primary' : ''}`}>
                            <UserCheck size={16} /> Verified
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs uppercase text-gray-400">
                            <tr>
                                <th className="p-4">Runner</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Document Provided</th>
                                <th className="p-4">Selfie</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayData.map(runner => {
                                // Detect which ID type is present
                                const hasNIN = runner.verificationDocuments?.nin && runner.verificationDocuments.nin.status !== 'not_submitted';
                                const docLabel = hasNIN ? "NIN" : "Driver's License";

                                return (
                                    <tr key={runner._id} className="hover:bg-white/5 transition">
                                        <td className="p-4">
                                            <div className="font-bold">{runner.firstName} {runner.lastName}</div>
                                            <div className="text-[10px] text-gray-500">{runner._id}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            <div>{runner.email}</div>
                                            <div>{runner.phone}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs">
                                                {docLabel}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                Selfie
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedRunner(runner)}
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
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRunner && (
                <RunnerDetailModal
                    runner={selectedRunner}
                    onClose={() => setSelectedRunner(null)}
                />
            )}
        </div>
    );
}

// Internal Detail Modal Component
function RunnerDetailModal({ runner, onClose }) {
    const idDoc = runner.verificationDocuments?.nin?.status !== 'not_submitted'
        ? { title: "NIN Document", data: runner.verificationDocuments.nin, type: 'id' }
        : { title: "Driver's License", data: runner.verificationDocuments.driverLicense, type: 'id' };

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
                            <p className="text-primary text-xs font-bold uppercase tracking-wider">
                                {idDoc.title} + Selfie Verification
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body - Now shows 2 cards side-by-side on larger screens */}
                <div className="p-6 overflow-y-auto bg-black-100">
                    <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
                        {/* 1. The ID Card */}
                        <VerificationCard
                            title={idDoc.title}
                            data={idDoc.data}
                            onApprove={() => console.log(`Approved ${idDoc.title}`)}
                        />

                        {/* 2. The Selfie Card */}
                        <VerificationCard
                            title="Selfie Image"
                            type="selfie"
                            data={runner.biometricVerification}
                            onApprove={() => console.log('Approve Selfie')}
                        />
                    </div>


                    {/* Rejection Reason Helper (Optional Tip) */}
                    <p className="mt-6 text-center text-gray-500 text-[10px] uppercase tracking-widest">
                        Compare ID photo with Selfie photo carefully
                    </p>


                    <div className="mt-4 flex justify-center">
                        <button className="px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-bold transition">
                            Approve All
                        </button>
                    </div>
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