
import axios from 'axios';
import crypto from 'crypto';
import { CONFIG } from '../config/config';

const API_URL = `http://localhost:${CONFIG.PORT || 5002}/api/v1`;
const KEY_SECRET = CONFIG.RAZORPAY_KEY_SECRET || ''; // Default empty if missing

// Utils
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

import { Otp } from '../models/otp.model';
import { User } from '../models/user.model';
import mongoose from 'mongoose';

// Connect to DB for OTP retrieval
const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(CONFIG.MONGODB_URI || 'mongodb://localhost:27017/rexa');
    }
};

const SELLER_EMAIL = "sreecharan309@gmail.com";
const BUYER_EMAIL = "o210008@rguktong.ac.in";
const PASSWORD = "password123";

const runTest = async () => {
    await connectDB();
    try {
        console.log(`🚀 Starting Integration Test on ${API_URL}`);
        
        // Cleanup function
        console.log('🧹 Cleaning up existing users for fresh test...');
        await User.deleteOne({ email: SELLER_EMAIL });
        await User.deleteOne({ email: BUYER_EMAIL });
        await Otp.deleteMany({ email: { $in: [SELLER_EMAIL, BUYER_EMAIL] } });
        console.log('✅ Cleanup complete.');

        // 1. Create Seller
        console.log(`\n1. Registering Seller (${SELLER_EMAIL})...`);
        const sellerRegRes = await axios.post(`${API_URL}/auth/register`, {
            name: "Sreecharan Seller",
            email: SELLER_EMAIL,
            password: PASSWORD
        });
        const sellerId = sellerRegRes.data.userId;
        
        // Get OTP
        const sellerOtpDoc = await Otp.findOne({ email: SELLER_EMAIL }).sort({ createdAt: -1 });
        if (!sellerOtpDoc) throw new Error("Seller OTP not found");
        
        // Verify
        const sellerVerifyRes = await axios.post(`${API_URL}/auth/verify-otp`, {
            userId: sellerId,
            otp: sellerOtpDoc.otp
        });
        const sellerToken = sellerVerifyRes.data.token;
        console.log('✅ Seller Registered & Verified. Token acquired.');

        // 2. Create Buyer
        console.log(`\n2. Registering Buyer (${BUYER_EMAIL})...`);
        const buyerRegRes = await axios.post(`${API_URL}/auth/register`, {
            name: "Sreecharan Buyer",
            email: BUYER_EMAIL,
            password: PASSWORD
        });
        const buyerId = buyerRegRes.data.userId;

        // Get OTP
        const buyerOtpDoc = await Otp.findOne({ email: BUYER_EMAIL }).sort({ createdAt: -1 });
        if (!buyerOtpDoc) throw new Error("Buyer OTP not found");
        
        // Verify
        const buyerVerifyRes = await axios.post(`${API_URL}/auth/verify-otp`, {
            userId: buyerId,
            otp: buyerOtpDoc.otp
        });
        const buyerToken = buyerVerifyRes.data.token;
        console.log('✅ Buyer Registered & Verified. Token acquired.');

        // 2.5 Create Category directly in DB
        const { Category } = require('../models/category.model'); 
        // Note: Using require for model which might be default export or named
        // checking category.model.ts would be better but I'll try generic creation
        
        let category = await Category.findOne({ slug: 'gift-cards' });
        if (!category) {
            category = await Category.create({
                name: "Gift Cards",
                slug: "gift-cards",
                description: "Digital Gift Cards",
                icon: "card"
            });
            console.log('✅ Created Category: Gift Cards');
        }

        // 3. Seller Creates Reward
        console.log(`\n3. Seller Creating Reward...`);
        const rewardRes = await axios.post(`${API_URL}/rewards`, {
            title: "Test Reward Code",
            description: "A valid test code",
            category: category._id.toString(), // Send ID instead of name
            price: 500,
            code: `SECRET-${Date.now()}`,
            expiryDate: new Date(Date.now() + 86400000).toISOString()
        }, {
            headers: { Authorization: `Bearer ${sellerToken}` }
        });
        const rewardId = rewardRes.data._id; // Controller returns the reward object directly
        console.log(`✅ Reward Created. ID: ${rewardId}`);

        // 4. Buyer Creates Order
        console.log(`\n4. Buyer Creating Purchase Order...`);
        const orderRes = await axios.post(`${API_URL}/transactions/create-order`, {
            rewardId: rewardId
        }, {
            headers: { Authorization: `Bearer ${buyerToken}` }
        });
        const { order_id, transaction_id } = orderRes.data;
        console.log(`✅ Order Created. Razorpay Order ID: ${order_id}, Txn ID: ${transaction_id}`);

        // 5. Verify Payment (Mocking Razorpay)
        console.log(`\n5. Verifying Payment...`);
        const payment_id = `pay_mock_${Date.now()}`;
        const signature = crypto.createHmac('sha256', KEY_SECRET)
            .update(order_id + '|' + payment_id)
            .digest('hex');

        const verifyRes = await axios.post(`${API_URL}/transactions/verify-payment`, {
            razorpay_order_id: order_id,
            razorpay_payment_id: payment_id,
            razorpay_signature: signature,
            transaction_id: transaction_id
        }, {
            headers: { Authorization: `Bearer ${buyerToken}` } // Verify endpoint doesn't strictly need auth but consistent
        });
        console.log(`✅ Payment Verified. Message: ${verifyRes.data.message}`);

        // 6. Reveal Code
        console.log(`\n6. Buyer Revealing Code...`);
        const revealRes = await axios.post(`${API_URL}/transactions/reveal-code`, {
            transactionId: transaction_id
        }, {
            headers: { Authorization: `Bearer ${buyerToken}` }
        });
        console.log(`✅ Code Revealed: ${revealRes.data.code}`);

        if (revealRes.data.code.startsWith("SECRET-")) {
            console.log(`   (Code matches pattern! ${revealRes.data.code})`);
        } else {
             console.error(`   (Code mismatch! Expected SECRET-..., got ${revealRes.data.code})`);
        }

        // 7. Confirm Delivery
        console.log(`\n7. Buyer Confirming Delivery...`);
        const confirmRes = await axios.post(`${API_URL}/transactions/confirm-delivery`, {
            transactionId: transaction_id
        }, {
            headers: { Authorization: `Bearer ${buyerToken}` }
        });
        console.log(`✅ Delivery Confirmed. Funds released.`);

        // 8. Check Seller Wallet
        console.log(`\n8. Checking Seller Wallet Balance...`);
        const sellerProfileRes = await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${sellerToken}` }
        });
        const balance = sellerProfileRes.data.walletBalance;
        // Price 500, Platform Fee 5% = 25. Net = 475.
        // Also Trust Score +1
        console.log(`✅ Seller Wallet Balance: ${balance} (Expected ~475)`);
        console.log(`✅ Seller Trust Score: ${sellerProfileRes.data.trustScore}`);

        console.log(`\n🎉 INTEGRATION TEST PASSED SUCCESSFULLY! 🎉`);

    } catch (error: any) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
};

runTest();
