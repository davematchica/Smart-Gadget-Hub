import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import {
  loginAdmin,
  uploadProductImage,
  deleteProductImage,
  updateImageOrder
} from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Login route
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  loginAdmin
);

// Image management routes (protected)
router.post('/products/:productId/images',
  requireAuth,
  upload.array('images', 10),
  uploadProductImage
);

router.delete('/images/:imageId',
  requireAuth,
  deleteProductImage
);

router.put('/images/order',
  requireAuth,
  [
    body('images').isArray().withMessage('Images must be an array'),
    body('images.*.id').isUUID(),
    body('images.*.display_order').isInt({ min: 0 })
  ],
  validate,
  updateImageOrder
);

export default router;