import express from 'express';
import { body } from 'express-validator';
import {
  getSellerProfile,
  updateSellerProfile
} from '../controllers/sellerController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

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

export default router;