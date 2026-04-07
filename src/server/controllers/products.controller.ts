import { Request, Response, NextFunction } from 'express';
import { ProductsService } from '../services/products.service';
import { sendSuccess } from '../utils/response';

export class ProductsController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductsService.getAll();
      return sendSuccess(res, products, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductsService.getById(req.params.id);
      if (!product) {
        const error: any = new Error('Product not found');
        error.status = 404;
        throw error;
      }
      return sendSuccess(res, product, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductsService.create(req.body);
      return sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductsService.update(req.params.id, req.body);
      return sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ProductsService.delete(req.params.id);
      return sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
