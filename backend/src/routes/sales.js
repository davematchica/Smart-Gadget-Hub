import express from 'express';
import { body, param } from 'express-validator';
import {
  createSale,
  getAllSales,
  updateSale,
  deleteSale
} from '../controllers/salesController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.post('/',
  requireAuth,
  [
    body('product_id').isUUID().withMessage('Valid product ID required'),
    body('customer_name').trim().notEmpty(),
    body('customer_email').isEmail(),
    body('sale_amount').isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 1 })
  ],
  validate,
  createSale
);

router.get('/', requireAuth, getAllSales);

router.put('/:id',
  requireAuth,
  [param('id').isUUID()],
  validate,
  updateSale
);

router.delete('/:id',
  requireAuth,
  [param('id').isUUID()],
  validate,
  deleteSale
);

export default router;