

// model Product {
//     id          String     @id @default(uuid())
//     createdAt   DateTime   @default(now())
//     updatedAt   DateTime   @updatedAt
//     name        String
//     sku         String     @unique
//     description String?
//     quantity    Int
//     shopId      String?
//     shop        Shop?      @relation(fields: [shopId], references: [id])
//     categories  Category[] @relation("CategoryToProduct")
//     orders      Order[]    @relation("OrderToProduct")
//   }

import { extendType, idArg, intArg, list, nonNull, objectType, stringArg } from "nexus";


export const Product = objectType({
    name: "Product",
    definition(t) {
        t.nonNull.string("id");
        t.dateTime("updatedAt");
        t.string("name")
        t.string("description")
        t.int("quantity");
        t.string("img");
        t.field("shop", {
            type: "Shop",
            resolve(parent,args,context){
                return context.prisma.product.findUnique({where:{id:parent.id}}).shop()
            }
        })
        t.list.field("categories", {
            type: "Category",
            resolve(parent,args,context){
                return context.prisma.product.findUnique({where:{id:parent.id}}).categories()
            }
        })
        t.list.field("orders", {
            type: "Order",
            resolve(parent,args,context){
                return context.prisma.product.findUnique({where:{id:parent.id}}).orders()
            }
        })
    },
})


export const ProductQuery = extendType({
    type: "Query",
    definition(t) {
      t.nonNull.list.nonNull.field("products", {
        type: "Product",
        args:{
          filter: stringArg(),
          take: intArg(),
          skip: intArg(),
        },
        resolve(parent, args, context, info) {
          const {filter, take, skip} = args;
          const where = args.filter  ? {
            OR: [
                {description: {contains: args.filter}},
                {name: {contains: args.filter}},
            ]
        }: {};
          
          return context.prisma.product.findMany({where: where, take, skip, orderBy:{updatedAt:"desc"} }) as any;
        },
      });
      t.nonNull.field("product", {
        type: "Product",
        args: {
          id: nonNull(idArg()),
        },
        async resolve(parent, args, context) {
          const { id } = args;
         
          const link = await context.prisma.product.findUnique({
            where: { id: id },
          });
  
          return link as any;
        },
      });
    },
  });
  
  export const ProductMutation = extendType({
    type: "Mutation",
    definition(t) {
      t.nonNull.field("product_create", {
        type: "Product",
        args: {
          name: nonNull(stringArg()),
          description: nonNull(stringArg()),
          img: nonNull(stringArg()),
          quantity: nonNull(intArg()),
          shop: nonNull(stringArg()),
          category: list(intArg()),
        },
       async resolve(parent, args, context) {
          
          const {name, description, quantity, shop,category ,img} = args;
          var updatedAt = new Date(Date.now());
          const categories = await context.prisma.category.findMany({
            where: { id: { in: category } },
          });

          const shopd = await context.prisma.shop.findUnique({
            where: { id: shop} 
          });
          if (shopd==null) {
            throw new Error("No Shop in this entry");
          }

          
          
          return context.prisma.product.create({
            data: {  updatedAt: updatedAt, name, description, quantity, shop: {connect: shopd} ,categories:{connect: categories}, img },
          }) as any;
        },
      }),
        t.nonNull.field("product_update", {
          type: "Product",
          args: {
            id: nonNull(stringArg()),
            name: stringArg(),
          description: stringArg(),
          img: stringArg(),
          quantity: intArg(),
          
          category: list(intArg()),
          },
          resolve(parent, args, context) { 
            
            var date = new Date(Date.now());
  
            return context.prisma.product.update({
              where: { id: args.id },
              data: {  updatedAt: date, ...args },
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
        t.nonNull.field("product_delete", {
          type: "Product",
          args: {
            id: nonNull(stringArg()),
          },
          resolve(parent, args, context) {
            return context.prisma.product.delete({ where: { id: args.id } });
          },
        });
    },
  });
  
