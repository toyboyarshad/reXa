
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { CONFIG } from '../config/config';
import dotenv from 'dotenv';

dotenv.config();

const makeAdmin = async () => {
    const email = process.argv[2];
    
    if (!email) {
        console.error('Please provide an email address: npx ts-node src/scripts/makeAdmin.ts <email>');
        process.exit(1);
    }

    try {
        await mongoose.connect(CONFIG.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email });
        
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`✅ Success! User ${user.name} (${email}) is now an ADMIN.`);
        console.log('You can now verify this by checking the User Menu for the "Admin Zone" section.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

makeAdmin();
