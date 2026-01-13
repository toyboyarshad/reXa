import { useEffect, useState } from 'react';
import { useAdminDisputes } from '../hooks/useAdminDisputes';
import { api } from '../services/api';

export const AdminDisputeDashboard = () => {
    const { disputes, setDisputes, resolveDispute, loading, setLoading } = useAdminDisputes();
    const [adminNote, setAdminNote] = useState('');

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            // MVP Hack: Fetching ALL transactions and filtering for 'disputed'.
            // In Prod: Create GET /admin/disputes
            const res = await api.get('/transactions/history');
            const disputed = res.data.filter((t: any) => t.escrowStatus === 'disputed');
            setDisputes(disputed);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading Disputes...</div>;

    if (disputes.length === 0) return (
        <div className="p-8 text-center text-gray-400">
            <h2 className="text-2xl font-bold mb-4">⚖️ The Court is Empty</h2>
            <p>No active disputes found.</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6 text-white">
            <h1 className="text-3xl font-bold mb-8 text-red-500">⚖️ Dispute Resolution Court</h1>
            
            <div className="grid gap-6">
                {disputes.map((dispute) => (
                    <div key={dispute._id} className="bg-gray-800 border-l-4 border-red-500 p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                    Txn: {dispute._id}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Amount: <span className="text-green-400">₹{dispute.amount}</span>
                                </p>
                                <p className="text-sm text-gray-400">
                                    Buyer: {dispute.fromUser?.email} | Seller: {dispute.toUser?.email}
                                </p>
                            </div>
                            <span className="bg-red-900 text-red-100 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                Disputed
                            </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-6">
                            {/* Dispute Details */}
                            <div className="bg-gray-900 p-4 rounded text-sm">
                                <h4 className="border-b border-gray-700 pb-2 mb-2 font-semibold text-gray-300">DETAILS</h4>
                                <p className="mb-2"><span className="text-gray-500">Reason:</span> {dispute.disputeReason}</p>
                                <p className="text-xs text-gray-600">Opened: {new Date(dispute.updatedAt).toLocaleDateString()}</p>
                            </div>

                            {/* Evidence Viewer */}
                            <div className="bg-gray-900 p-4 rounded">
                                <h4 className="border-b border-gray-700 pb-2 mb-2 font-semibold text-gray-300">EVIDENCE</h4>
                                {dispute.disputeEvidenceUrl ? (
                                    <video 
                                        src={dispute.disputeEvidenceUrl} 
                                        controls 
                                        className="w-full h-48 object-cover rounded bg-black"
                                    />
                                ) : (
                                    <p className="text-gray-500 italic">No video evidence uploaded.</p>
                                )}
                            </div>
                        </div>

                        {/* Judgment Controls */}
                        <div className="flex flex-col md:flex-row items-end gap-4 border-t border-gray-700 pt-4">
                            <div className="flex-1 w-full">
                                <label className="block text-xs text-gray-500 mb-1">JUDGE'S NOTE (REQUIRED)</label>
                                <input 
                                    type="text" 
                                    placeholder="Reason for decision..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    onChange={(e) => setAdminNote(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => resolveDispute(dispute._id, 'refund_buyer', adminNote)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded shadow transition-colors"
                                >
                                    Refund Buyer 🛡️
                                </button>
                                <button
                                    onClick={() => resolveDispute(dispute._id, 'release_to_seller', adminNote)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow transition-colors"
                                >
                                    Release to Seller 💸
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
