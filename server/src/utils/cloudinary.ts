import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { CONFIG } from '../config/config';

// Configure Cloudinary
cloudinary.config({
    cloud_name: CONFIG.CLOUDINARY_CLOUD_NAME,
    api_key: CONFIG.CLOUDINARY_API_KEY,
    api_secret: CONFIG.CLOUDINARY_API_SECRET
});

// Configure Storage Engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'reXa/evidence',
            resource_type: 'video', // Explicitly allow video uploads
            allowed_formats: ['mp4', 'mov', 'webm'],
            // public_id: `evidence_${Date.now()}` // Optional: customized naming
        };
    },
});

export const upload = multer({ storage: storage });
export { cloudinary };
