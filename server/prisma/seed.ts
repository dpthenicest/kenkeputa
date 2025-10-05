import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- USERS ---
  const passwordHash = await hash("password123", 10);

  const users = await prisma.user.createMany({
    data: [
      {
        fullName: "Alice Johnson",
        email: "alice@example.com",
        password: passwordHash,
        role: Role.USER,
      },
      {
        fullName: "Bob Williams",
        email: "bob@example.com",
        password: passwordHash,
        role: Role.ADMIN,
      },
    ],
  });

  console.log("✅ Users created");

  // --- PRODUCTS ---
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Coffee Beans (Medium Roast)",
        description: "Freshly roasted premium Arabica coffee beans.",
        price: 15.99,
        stockQuantity: 100,
        imageUrl: "https://example.com/images/coffee1.jpg",
      },
      {
        name: "French Press Coffee Maker",
        description: "Glass French press with stainless steel plunger.",
        price: 29.99,
        stockQuantity: 50,
        imageUrl: "https://example.com/images/frenchpress.jpg",
      },
    ],
  });

  console.log("✅ Products created");

  // --- CARTS ---
  const cart1 = await prisma.cart.create({
    data: {
      user: { connect: { email: "alice@example.com" } },
    },
  });

  const cart2 = await prisma.cart.create({
    data: {
      user: { connect: { email: "bob@example.com" } },
    },
  });

  console.log("✅ Carts created");

  // --- CART ITEMS ---
  const productList = await prisma.product.findMany();

  const cartItems = await prisma.cartItem.createMany({
    data: [
      {
        cartId: cart1.id,
        productId: productList[0].id,
        quantity: 2,
      },
      {
        cartId: cart2.id,
        productId: productList[1].id,
        quantity: 1,
      },
    ],
  });

  console.log("✅ Cart items created");

  // --- ORDERS ---
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        user: { connect: { email: "alice@example.com" } },
        totalAmount: 31.98,
        status: OrderStatus.PAID,
      },
    }),
    prisma.order.create({
      data: {
        user: { connect: { email: "bob@example.com" } },
        totalAmount: 29.99,
        status: OrderStatus.PENDING,
      },
    }),
  ]);

  console.log("✅ Orders created");

  // --- ORDER ITEMS ---
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: orders[0].id,
        productId: productList[0].id,
        quantity: 2,
        unitPrice: 15.99,
        subtotal: 31.98,
      },
      {
        orderId: orders[1].id,
        productId: productList[1].id,
        quantity: 1,
        unitPrice: 29.99,
        subtotal: 29.99,
      },
    ],
  });

  console.log("✅ Order items created");

  console.log("🎉 Seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
