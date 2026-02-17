import express from 'express';
import { body, param } from 'express-validator';
import {
  createInquiry,
  getAllInquiries,
  updateInquiryStatus,
  deleteInquiry
} from '../controllers/inquiriesController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Public route - create inquiry
router.post('/',
  [
    body('customer_name').trim().notEmpty().withMessage('Name is required'),
    body('customer_email').isEmail().withMessage('Valid email is required'),
    body('customer_phone').optional().trim(),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('product_id').optional().isUUID()
  ],
  validate,
  createInquiry
);

// Protected admin routes
router.get('/', requireAuth, getAllInquiries);

router.put('/:id/status',
  requireAuth,
  [
    param('id').isUUID().withMessage('Invalid inquiry ID'),
    body('status').isIn(['pending', 'responded', 'contacted', 'completed', 'cancelled'])
      .withMessage('Invalid status')
  ],
  validate,
  updateInquiryStatus
);

router.delete('/:id',
  requireAuth,
  [param('id').isUUID().withMessage('Invalid inquiry ID')],
  validate,
  deleteInquiry
);

export default router;