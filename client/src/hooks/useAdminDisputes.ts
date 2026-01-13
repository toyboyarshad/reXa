import { useState } from 'react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

export const useAdminDisputes = () => {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const resolveDispute = async (transactionId: string, resolution: 'refund_buyer' | 'release_to_seller', note: string) => {
        try {
            await api.post('/transactions/admin/resolve-dispute', {
                transactionId,
                resolution, 
                adminNote: note
            });
            
            toast.success(`Dispute resolved: ${resolution}`);
            // Remove from local list
            setDisputes(prev => prev.filter(d => d._id !== transactionId));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Resolution failed');
        }
    };

    return { disputes, setDisputes, loading, setLoading, resolveDispute };
};


