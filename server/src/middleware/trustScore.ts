import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { User } from '../models/user.model';

export const checkTrustScore = (minScore: number = 50) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user?.userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const user = await User.findById(req.user.userId).select('trustScore');
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.trustScore < minScore) {
                return res.status(403).json({ 
                    message: `Insufficient Trust Score. Required: ${minScore}, Current: ${user.trustScore}. Improve your score by completing successful transactions.` 
                });
            }

            next();
        } catch (error) {
            console.error('Trust Score Check Failed:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};
