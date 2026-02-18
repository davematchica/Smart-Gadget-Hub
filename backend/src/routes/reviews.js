import express from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import {
  getAllReviews,
  getFeaturedReviews,
  createReview,
  uploadReviewImages,
  updateReview,
  toggleFeatured,
  deleteReviewImage,
  deleteReview
} from '../controllers/reviewsController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// ── Public routes ──────────────────────────────
router.get('/', getAllReviews);
router.get('/featured', getFeaturedReviews);

// ── Protected admin routes ─────────────────────
router.post('/',
  requireAuth,
  [
    body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
    body('product_name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('is_featured').optional().isBoolean(),
  ],
  validate,
  createReview
);

router.post('/:id/images',
  requireAuth,
  upload.array('images', 5),
  uploadReviewImages
);

router.put('/:id',
  requireAuth,
  [
    param('id').isUUID(),
    body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
    body('product_name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('is_featured').optional().isBoolean(),
  ],
  validate,
  updateReview
);

router.patch('/:id/featured',
  requireAuth,
  [
    param('id').isUUID(),
    body('is_featured').isBoolean().withMessage('is_featured must be boolean'),
  ],
  validate,
  toggleFeatured
);

router.delete('/images/:imageId',
  requireAuth,
  [param('imageId').isUUID()],
  validate,
  deleteReviewImage
);

router.delete('/:id',
  requireAuth,
  [param('id').isUUID()],
  validate,
  deleteReview
);

export default router;