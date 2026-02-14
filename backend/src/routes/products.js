import express from 'express';
import { body, param, query } from 'express-validator';
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productsController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Protected admin routes
router.post('/',
  requireAuth,
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('description').optional().trim(),
    body('stock_count').optional().isInt({ min: 0 })
  ],
  validate,
  createProduct
);

router.put('/:id',
  requireAuth,
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    body('name').optional().trim().notEmpty(),
    body('category').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    body('availability').optional().isBoolean(),
    body('featured').optional().isBoolean()
  ],
  validate,
  updateProduct
);

router.delete('/:id',
  requireAuth,
  [param('id').isUUID().withMessage('Invalid product ID')],
  validate,
  deleteProduct
);

export default router;