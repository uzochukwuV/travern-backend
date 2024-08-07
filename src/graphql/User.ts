import {
  extendType,
  idArg,
  intArg,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.string("email");
    t.dateTime("createdAt");
    t.dateTime("updatedAt");
    t.string("firstName");
    t.string("lastName");
    t.string("address");
    t.string("picture");
    t.string("phoneNumber");
    t.list.field("orders", {
      type: "String",
      resolve(parent, args, context) {
        return [];
      },
    });
    t.field("shop", {
      type: "Shop",
      resolve(parent, args, context, info) {
        return context.prisma.user.findUnique({where: {id: parent.id}}).shop() as any;
      },
    })
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("users", {
      type: "User",
      resolve(parent, args, context, info) {
        return context.prisma.user.findMany() as any;
      },
    });

    t.nonNull.field("user", {
      type: "User",
      args: {
        id: nonNull(idArg()),
      },
      async resolve(parent, args, context) {
        const { id } = args;
        var num = Number(id);
        const link = await context.prisma.user.findUnique({
          where: { id: num },
        });

        return link as any;
      },
    });
  },
});

export const UserMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("user_create", {
      type: "User",
      args: {
        firstName: nonNull(stringArg()),
        lastName: nonNull(stringArg()),
        email: nonNull(stringArg()),

        createdAt: nonNull(stringArg()),

        updatedAt: nonNull(stringArg()),
        address: nonNull(stringArg()),
        phoneNumber: nonNull(stringArg()),
      },
      resolve(parent, args, context) {
        console.log(args);
        var createdAt = new Date(args.createdAt);

        return context.prisma.user.create({
          data: { ...args, createdAt: createdAt, updatedAt: createdAt },
        }) as any;
      },
    }),
      t.nonNull.field("user_update", {
        type: "User",
        args: {
          id: nonNull(intArg()),
          firstName: nonNull(stringArg()),
          lastName: nonNull(stringArg()),
          email: nonNull(stringArg()),

          createdAt: nonNull(stringArg()),

          updatedAt: nonNull(stringArg()),
          address: nonNull(stringArg()),
          phoneNumber: nonNull(stringArg()),
        },
        resolve(parent, args, context) {
          console.log(args);
          var createdAt = new Date(args.createdAt);

          return context.prisma.user.update({
            where: { id: args.id },
            data: { ...args, createdAt: createdAt, updatedAt: createdAt },
          }) as any;
        },
      }),
      t.nonNull.field("user_delete", {
        type: "User",
        args: {
          id: nonNull(intArg()),
        },
        resolve(parent, args, context) {
          return context.prisma.user.delete({ where: { id: args.id } });
        },
      });
  },
});
