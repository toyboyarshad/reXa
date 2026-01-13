import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    fromUser: mongoose.Types.ObjectId;
    toUser: mongoose.Types.ObjectId;
    credits: number; // Renamed from points/amount
    reward: mongoose.Types.ObjectId;
    type: 'purchase' | 'refund' | 'payout'; // Updated types
    escrowStatus: 'held' | 'released' | 'disputed' | 'refunded';
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new Schema({
    fromUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    reward: {
        type: Schema.Types.ObjectId,
        ref: 'Reward',
        required: true
    },
    type: {
        type: String,
        enum: ['purchase', 'refund', 'payout'],
        default: 'purchase'
    },
    escrowStatus: {
        type: String,
        enum: ['held', 'released', 'disputed', 'refunded'],
        default: 'held'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema); 