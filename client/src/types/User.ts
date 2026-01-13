export interface User {
    _id: string;
    name: string;
    email: string;
    creditBalance: number;
    escrowCredits: number;
    trustScore: number;
    role: 'user' | 'admin';
    redeemedRewards: number;
    isVerified: boolean;
    createdAt?: string;
    updatedAt?: string;
} 