import { extendType, idArg, intArg, nonNull, objectType, stringArg } from "nexus";

export const Shop = objectType({
  name: "Shop",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.nonNull.string("createdAt");
    t.nonNull.string("logo");
    t.nonNull.string("motto");
    t.nonNull.string("openHrs");
    t.boolean("verified");

    t.nonNull.list.field("products", {
        type: "Product",
        resolve(parent, args, context){
            return context.prisma.shop.findUnique({where:{id: parent.id}}).products()
        }

    })
    t.nonNull.field("owner", {
      type: "User",
      resolve(parent, args, context) {
        return context.prisma.shop
          .findUnique({ where: { id: parent.id } })
          .owner() as any;
      },
    });
  },
});

export const ShopQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("shops", {
      type: "Shop",
      resolve(parent, args, context, info) {
        return context.prisma.shop.findMany() as any;
      },
    });

    t.nonNull.field("shop", {
      type: "Shop",
      args: {
        id: nonNull(idArg()),
      },
      async resolve(parent, args, context) {
        const { id } = args;

        const link = await context.prisma.shop.findUnique({
          where: { id: id },
        });

        return link as any;
      },
    });
  },
});


export const ShopMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("shop_create", {
      type: "Shop",
      args: {
        name: nonNull(stringArg()),
        logo: nonNull(stringArg()),
        motto: nonNull(stringArg()),

        openHrs: nonNull(stringArg()),

        owner: nonNull(intArg()),
        
      },
      async resolve(parent, args, context) {
        
        var updatedAt = new Date(Date.now());
        const {name, logo, motto, openHrs, owner} = args;

        const ownerd = await context.prisma.user.findUnique({
          where: { id: owner} 
        });
        if (ownerd==null) {
          throw new Error("No Owner in this Shop entry");
        }

        return context.prisma.shop.create({
          data: { name, logo, motto, openHrs, owner: {connect: ownerd} },
        }) as any;
      },
    }),
      // t.nonNull.field("shop_update", {
      //   type: "User",
      //   args: {
      //     id: nonNull(intArg()),
      //     firstName: nonNull(stringArg()),
      //     lastName: nonNull(stringArg()),
      //     email: nonNull(stringArg()),

      //     createdAt: nonNull(stringArg()),

      //     updatedAt: nonNull(stringArg()),
      //     address: nonNull(stringArg()),
      //     phoneNumber: nonNull(stringArg()),
      //   },
      //   resolve(parent, args, context) {
      //     console.log(args);
      //     var createdAt = new Date(args.createdAt);

      //     return context.prisma.user.update({
      //       where: { id: args.id },
      //       data: { ...args, createdAt: createdAt, updatedAt: createdAt },
      //     }) as any;
      //   },
      // }),
      // t.nonNull.field("user_delete", {
      //   type: "User",
      //   args: {
      //     id: nonNull(intArg()),
      //   },
      //   resolve(parent, args, context) {
      //     return context.prisma.user.delete({ where: { id: args.id } });
      //   },
      // });
      t.nonNull.field("shop_delete", {
        type: "Shop",
        args: {
          id: nonNull(stringArg()),
        },
        resolve(parent, args, context) {
          return context.prisma.shop.delete({ where: { id: args.id } });
        },
      });
  },
});
