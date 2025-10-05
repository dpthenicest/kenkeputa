import { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service";

export const productController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (err) { next(err); }
  },

  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        search,
        minPrice,
        maxPrice,
        page,
        limit,
      } = req.query;

      const products = await productService.findAll({
        search: search as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });

      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  },

  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.findById(Number(req.params.id));
      res.json({ success: true, data: product });
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.update(Number(req.params.id), req.body);
      res.json({ success: true, data: product });
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productService.delete(Number(req.params.id));
      res.json({ success: true, message: result.message });
    } catch (err) { next(err); }
  },
};
