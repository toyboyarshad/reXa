import React, { useState, useEffect } from 'react';
import { transactionApi } from '../services/api';
import toast from 'react-hot-toast';
import { Transaction } from '../types/transaction';

interface ActiveOrderProps {
    transaction: Transaction;
    onStatusChange: () => void;
}

export const ActiveOrder: React.FC<ActiveOrderProps> = ({ transaction, onStatusChange }) => {
    const [revealedCode, setRevealedCode] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [recordingStarted, setRecordingStarted] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [showDisputeForm, setShowDisputeForm] = useState(false);
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // @ts-ignore
        let timer: NodeJS.Timeout;
        if (timeLeft !== null && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
            }, 1000);
        } else if (timeLeft === 0) {
            // Timer expired logic if needed
        }
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleRevealCode = async () => {
        if (!recordingStarted) {
            toast('Please start your screen recording before revealing the code!', {
                icon: '📹',
                duration: 3000
            });
            return;
        }

        try {
            const response = await transactionApi.revealCode(transaction._id);
            setRevealedCode(response.data.code);
            setTimeLeft(600); // 10 minutes timer
            toast.success("Code Revealed! specific timer started.");
        } catch (error) {
            toast.error("Failed to reveal code");
        }
    };

    const handleConfirmDelivery = async () => {
        try {
            await transactionApi.confirmDelivery(transaction._id);
            toast.success("Transaction Completed! Funds released to seller.");
            onStatusChange();
        } catch (error) {
            toast.error("Failed to confirm delivery");
        }
    };

    const handleReportIssue = async () => {
        if (!disputeReason) return toast.error("Please provide a reason");
        if (!evidenceFile) return toast.error("Please upload video evidence");
        
        try {
            setUploading(true);
            
            // 1. Upload Evidence
            const formData = new FormData();
            formData.append('evidence', evidenceFile);
            
            const uploadResponse = await transactionApi.uploadEvidence(formData);
            const evidenceUrl = uploadResponse.data.url;

            // 2. Report Issue
            await transactionApi.reportIssue({
                transactionId: transaction._id,
                reason: disputeReason,
                evidenceUrl: evidenceUrl
            });
            
            toast.success("Dispute reported. Admin will review.");
            setShowDisputeForm(false);
            onStatusChange();
        } catch (error) {
            console.error(error);
            toast.error("Failed to report issue");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Active Order</h2>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    {transaction.escrowStatus.toUpperCase()}
                </span>
            </div>

            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <h3 className="text-lg font-semibold mb-2 dark:text-white">{transaction.reward.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">Amount Paid: ₹{transaction.amount}</p>
                <p className="text-gray-600 dark:text-gray-300">Transaction ID: {transaction._id}</p>
            </div>

            {/* Step 1: Trust Protocol Warning */}
            {!revealedCode && (
                <div className="mb-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-2xl">📹</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Trust Protocol:</strong> You MUST screen-record the entire process of revealing and redeeming this code.
                                    No refund will be processed without video evidence.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={recordingStarted} 
                                onChange={(e) => setRecordingStarted(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                            <span className="text-gray-700 dark:text-gray-300">I have started screen recording</span>
                        </label>
                        
                        <button
                            onClick={handleRevealCode}
                            disabled={!recordingStarted}
                            className={`px-4 py-2 rounded-md font-bold text-white ${
                                recordingStarted 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Reveal Code
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Code Revealed & Actions */}
            {revealedCode && (
                <div className="space-y-6">
                    <div className="p-6 bg-gray-900 rounded-lg text-center">
                        <p className="text-gray-400 text-sm mb-2">YOUR CODE</p>
                        <p className="text-3xl font-mono text-green-400 tracking-wider select-all">{revealedCode}</p>
                    </div>

                    <div className="text-center">
                         {timeLeft !== null && (
                            <p className="text-red-500 font-bold text-xl animate-pulse">
                                Time remaining to verify: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                            Please redeem this code on the respective platform immediately.
                        </p>
                    </div>

                    <div className="flex space-x-4 justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleConfirmDelivery}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transform transition hover:scale-105"
                        >
                            ✅ It Works!
                        </button>
                        
                        <button
                            onClick={() => setShowDisputeForm(true)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transform transition hover:scale-105"
                        >
                            ⚠️ Report Issue
                        </button>
                    </div>
                </div>
            )}

            {/* Dispute Form Modal */}
            {showDisputeForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4 dark:text-white">Report Issue</h3>
                        <textarea
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            placeholder="Describe what went wrong..."
                            className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:text-white"
                            rows={4}
                        />

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Upload Screen Recording (Max 50MB)
                            </label>
                            <input 
                                type="file" 
                                accept="video/*"
                                onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                        </div>

                        <div className="bg-yellow-50 p-3 mb-4 rounded text-sm text-yellow-800">
                            Note: A screen recording proving the code failed is MANDATORY for a refund.
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button 
                                onClick={() => setShowDisputeForm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleReportIssue}
                                disabled={uploading}
                                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {uploading ? 'Uploading...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
