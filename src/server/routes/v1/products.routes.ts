import { Router } from 'express';
import { ProductsController } from '../../controllers/products.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { z } from 'zod';

const router = Router();

const productSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    pricing: z.object({
      selling_price: z.number().positive(),
      original_price: z.number().positive(),
      is_on_sale: z.boolean().optional()
    }),
    category_id: z.string(),
    published: z.boolean().optional()
  })
});

router.get('/', ProductsController.getAll);
router.get('/:id', ProductsController.getById);

// Admin only routes
router.post('/', authenticate, authorize(['admin']), validate(productSchema), ProductsController.create);
router.put('/:id', authenticate, authorize(['admin']), validate(productSchema), ProductsController.update);
router.delete('/:id', authenticate, authorize(['admin']), ProductsController.delete);

export default router;
