export interface Reward {
    _id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    image_url?: string;
    owner: {
        _id: string;
        name: string;
        email: string;
    };
    category?: {
        _id: string;
        name: string;
        slug: string;
        icon: string;
    };
    status: 'available' | 'redeemed' | 'exchanged' | 'pending';
    expiryDate: string;
    createdAt: string;
    isActive: boolean;
}
