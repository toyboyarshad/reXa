import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionApi } from '../services/api';
import { ActiveOrder } from '../components/ActiveOrder';
import { Transaction } from '../types/transaction';
import { Navbar } from '../components/Navbar';
// import { Sidebar } from '../components/Sidebar'; // Assuming you have a Sidebar

export const OrderPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchOrder = async () => {
        try {
            // Since we don't have a single getOrder endpoint yet, 
            // we'll filter from history for now or you can add a specific endpoint.
            // For MVP, finding in history is acceptable if the list isn't huge, 
            // but ideally: const { data } = await transactionApi.getById(orderId);
            
            const { data } = await transactionApi.getHistory();
            const found = data.find((t: any) => t._id === orderId); // using any because of the API return type issue
            
            if (found) {
                setTransaction(found);
            } else {
                // If not found in history immediately after purchase, it might be a sync issue
                // For now, let's redirect or show error
                console.error("Order not found in history");
            }
        } catch (error) {
            console.error("Failed to fetch order", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const handleBack = () => {
        navigate('/marketplace');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <button 
                    onClick={handleBack}
                    className="mb-4 text-gray-600 dark:text-gray-400 hover:underline"
                >
                    &larr; Back to Marketplace
                </button>
                
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : transaction ? (
                    <ActiveOrder 
                        transaction={transaction} 
                        onStatusChange={fetchOrder} 
                    />
                ) : (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Order not found</h2>
                    </div>
                )}
            </div>
        </div>
    );
};
