import {
  extendType,
  idArg,
  intArg,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

export const Category = objectType({
  name: "Category",
  definition(t) {
    t.nonNull.int("id");
    t.dateTime("updatedAt");
    t.string("name");
    t.string("img");
    t.list.field("products", {
      type: "Product",
      resolve(parent, args, context) {
        return context.prisma.category
          .findUnique({ where: { id: parent.id } })
          .products() as any || [];
      },
    });
  },
});

export const CategoryQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("categories", {
      type: "Category",
      resolve(parent, args, context, info) {
        return context.prisma.category.findMany() as any;
      },
    });

    t.nonNull.field("category", {
      type: "Category",
      args: {
        id: nonNull(idArg()),
      },
      async resolve(parent, args, context) {
        const { id } = args;
        var num = Number(id);
        const category = await context.prisma.category.findUnique({
          where: { id: num },
        });

        return category as any;
      },
    });
  },
});

export const CategoryMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("category_create", {
      type: "Category",
      args: {
        name: nonNull(stringArg()),
        img: nonNull(stringArg()),
      },
      resolve(parent, args, context) {
        var updatedAt = new Date(Date.now());

        return context.prisma.category.create({
          data: { ...args, updatedAt: updatedAt },
        }) as any;
      },
    }),
      t.nonNull.field("category_update", {
        type: "Category",
        args: {
          id: nonNull(intArg()),
          name: nonNull(stringArg()),
          img: nonNull(stringArg()),
        },
        resolve(parent, args, context) {
          console.log(args);
          var updatedAt = new Date(Date.now());

          return context.prisma.category.update({
            where: { id: args.id },
            data: { ...args, updatedAt: updatedAt },
          }) as any;
        },
      }),
      t.nonNull.field("category_delete", {
        type: "Category",
        args: {
          id: nonNull(intArg()),
        },
        resolve(parent, args, context) {
          return context.prisma.category.delete({ where: { id: args.id } });
        },
      });
  },
});
