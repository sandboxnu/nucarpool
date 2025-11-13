## Routers

---

This folder contains files relating to tRPC's [router](https://trpc.io/docs/v9/router). These routers serve as our API endpoints while allowing us to maintain type information for inputs and returns. The final router, contained in [`index.ts`](./index.ts), is referenced in [`[trpc].ts`](../../pages/api/trpc/%5Btrpc%5D.ts) when the tRPC endpoints are configured to work with Nextjs. For details on specific routers, more granular documentation is provided in the router files.

### Contents:

- [Routers](#routers)
  - [Contents:](#contents)
  - [Context](#context)
  - [Protection](#protection)
  - [Endpoints](#endpoints)
  - [Frontend](#frontend)

---

### Context

[Context](./context.ts) allows us to "bundle" together information to be passed into each API request. In our case, NextAuth information and the Prisma client are bundled into each request so that they can be accessed inside the logic of each endpoint. These are provided on the `ctx` object in query/mutation resolvers. Learn more about context [here](https://trpc.io/docs/v9/context).

### Protection

Some routers are initialized with [`createRouter`](./createRouter.ts), while some are initialized with [`createProtectedRouter`](./createProtectedRouter.ts). These signify API routes that can be accessed by any user and routes that can only be accessed by authenticated users, respesctively. No additional logic is required in the endpoints themselves, just a different initialization call.

### Endpoints

tRPC provides two "types" of endpoints: queries and mutations - they're literally the same just naming semantics for some reason LOL. Normally query is used for retrieving data, while mutation is used for... you guessed it modifying data. Our input objects use [Zod](https://zod.dev/) for type validation. Endpoints have the following structure:

```typescript
const fooRouter = createRouter()
  .query("name", {
    // input object using zod
    input: z.object({
      userId: z.number().int()
    }),
    // function that handles api logic
    resolve: async ({ ctx, input }) => {
      return ctx.prisma.user.findOne({
        where: { id: input.userId},
        select: { name: true }
      )
    }
  })
```

### Frontend

These endpoints are then accessed in the frontend in the following structure:

```typescript
trpc.useQuery(
  [
    "endpoint.name",
    {
      // input object
      userId: 100,
    },
  ],
  {
    // what to do if the request is successful
    onSuccess: (data) => {
      console.log(data.name);
    },
    // what to do if the request throws an error
    onError: (error) => {
      toast.error(`Something went wrong: ${error}`);
    },
  },
);
```
