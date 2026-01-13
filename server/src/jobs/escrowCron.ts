import cron from 'node-cron';
import mongoose from 'mongoose';
import { Transaction } from '../models/transaction.model';
import { Reward } from '../models/reward.model';
import { User } from '../models/user.model';
import logger from '../utils/logger';

// Schedule: Every hour at minute 0
export const initEscrowCron = () => {
    logger.info('Initializing Escrow Auto-Release Cron Job...');
    
    cron.schedule('0 * * * *', async () => {
        logger.info('Running Escrow Auto-Release Job...');
        const session = await mongoose.startSession();
        
        try {
            await session.withTransaction(async () => {
                // Find transactions that are:
                // 1. Held in Escrow
                // 2. Not Disputed
                // 3. Auto-Release time has passed (Payment + 24 Hours)
                // Note: We need to add autoReleaseAt field to Transaction model first.
                // Assuming we use createdAt + 24 hours for now if field missing, 
                // but ideally we add the field.
                
                const cutoffDate = new Date();
                cutoffDate.setHours(cutoffDate.getHours() - 24);

                const stuckTransactions = await Transaction.find({
                    escrowStatus: 'held',
                    createdAt: { $lt: cutoffDate }
                }).session(session);

                logger.info(`Found ${stuckTransactions.length} transactions eligible for auto-release.`);

                for (const transaction of stuckTransactions) {
                    try {
                        // 1. Mark Transaction Released
                        transaction.escrowStatus = 'released';
                        await transaction.save({ session });

                        // 2. Mark Reward Redeemed (Auto-completed)
                        await Reward.findByIdAndUpdate(
                            transaction.reward,
                            { 
                                status: 'redeemed',
                                redeemedBy: transaction.fromUser,
                                redeemedAt: new Date(),
                                // Note: We might want to mark it differently like 'auto-redeemed'
                            },
                            { session }
                        );

                        // 3. Move Funds to Seller
                        await User.findByIdAndUpdate(
                            transaction.toUser,
                            { 
                                $inc: { 
                                    escrowBalance: -transaction.netAmount,
                                    walletBalance: transaction.netAmount,
                                    trustScore: 1 // Small boost
                                } 
                            },
                            { session }
                        );

                        logger.info(`Auto-released Transaction: ${transaction._id}`);
                    } catch (innerError) {
                        logger.error(`Failed to release transaction ${transaction._id}:`, innerError);
                        // Continue to next transaction even if one fails
                    }
                }
            });
        } catch (error) {
            logger.error('Escrow Cron Job Failed:', error);
        } finally {
            session.endSession();
        }
    });
};
