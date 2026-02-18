import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import {
  getSellerProfile,
  updateSellerProfile,
  uploadProfilePicture,
  removeProfilePicture
} from '../controllers/sellerController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// Public route
router.get('/profile', getSellerProfile);

// Protected admin route
router.put('/profile',
  requireAuth,
  [
    body('name').optional().trim().notEmpty(),
    body('business_name').optional().trim(),
    body('email').optional().isEmail(),
    body('phone').optional().trim(),
    body('address').optional().trim(),
    body('bio').optional().trim()
  ],
  validate,
  updateSellerProfile
);

// Profile picture routes
router.post('/profile/picture',
  requireAuth,
  upload.single('image'),
  uploadProfilePicture
);

router.delete('/profile/picture',
  requireAuth,
  removeProfilePicture
);

export default router;