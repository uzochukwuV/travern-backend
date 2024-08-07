// model Order {
//     id        String    @id @default(uuid())
//     createdAt DateTime  @default(now())
//     updatedAt DateTime  @updatedAt
//     userId    Int?
//     customer  User?     @relation(fields: [userId], references: [id])
//     products  Product[] @relation("OrderToProduct")
//   }

import { extendType, idArg, nonNull, objectType, stringArg, list, intArg } from "nexus";

export const Order = objectType({
  name: "Order",
  definition(t) {
    t.nonNull.string("id");
    t.dateTime("updatedAt");
    t.field("customer", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.order
          .findUnique({ where: { id: parent.id } })
          .customer();
      },
    });
    t.list.field("products", {
      type: "Product",
      resolve(parent, args, context) {
        return context.prisma.order
          .findUnique({ where: { id: parent.id } })
          .products();
      },
    });
  },
});

export const OrderQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("orders", {
      type: "Order",
      resolve(parent, args, context, info) {
        return context.prisma.order.findMany() as any;
      },
    });

    t.nonNull.field("order", {
      type: "Order",
      args: {
        id: nonNull(idArg()),
      },
      async resolve(parent, args, context) {
        const { id } = args;

        const link = await context.prisma.order.findUnique({
          where: { id: id },
        });

        return link as any;
      },
    });
  },
});

export const OrderMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("order_create", {
      type: "Order",
      args: {
        customer: intArg(),
        product: stringArg(),
      },
      async resolve(parent, args, context) {
        console.log(args);
        const { product, customer } = args;
        

        const user = await context.prisma.user.findUnique({
          where: { id: customer },
        });
        if (user == null) {
          throw new Error("No Customer made this order");
        }
        const products = await context.prisma.product.findMany({
          where: { id: { in: [product] } },
        });
        if (products.length <= 0) {
          throw new Error("No Product in this entry");
        }
        return context.prisma.order.create({
          data: {
            customer: { connect: user },
            products: { connect: products },
          },
        }) as any;
      },
    }),
      t.nonNull.field("order_update", {
        type: "Order",
        args: {
          id: nonNull(stringArg()),
          customer: intArg(),
            product: stringArg(),
        },
       async resolve(parent, args, context) {
          console.log(args);
          var updatedAt = new Date(Date.now());

          const { product, customer } = args;
        

        const user = await context.prisma.user.findUnique({
          where: { id: customer },
        });
        if (user == null) {
          throw new Error("No Customer made this order");
        }
        const products = await context.prisma.product.findMany({
          where: { id: { in: [product] } },
        });
        if (products.length <= 0) {
          throw new Error("No Product in this entry");
        }

          return context.prisma.order.update({
            where: { id: args.id },
            data: {  updatedAt: updatedAt, customer: { connect: user },
            products: { connect: products }, },
          }) as any;
        },
      }),
      t.nonNull.field("order_delete", {
        type: "Order",
        args: {
          id: nonNull(stringArg()),
        },
        resolve(parent, args, context) {
          return context.prisma.order.delete({ where: { id: args.id } });
        },
      });
  },
});
