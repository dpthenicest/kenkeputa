import prisma from "../lib/prisma";
import { IProductCreate } from "../types";
import { AppError } from "../utils/appError";

export const productService = {
  async create(data: IProductCreate) {
    return prisma.product.create({ data });
  },

  async findAll(query: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      search = "",
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = query;

    const where: any = {};

    // ✅ Filtering by name or description (case-insensitive)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // ✅ Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // ✅ Pagination
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError("Product not found", 404);
    return product;
  },

  async update(id: number, data: Partial<IProductCreate>) {
    await productService.findById(id); // ensures existence
    return prisma.product.update({ where: { id }, data });
  },

  async delete(id: number) {
    await productService.findById(id);
    await prisma.product.delete({ where: { id } });
    return { message: "Product deleted successfully" };
  },
};
