import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // req.user is populated by the previous 'auth' middleware
        const user = req.user as any;
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin privileges required' });
        }
        next();
    } catch (error) {
        res.status(403).json({ message: 'Access denied' });
    }
};
