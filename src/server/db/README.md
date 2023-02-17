## Prisma

---

Prisma is an [ORM](https://stackoverflow.com/questions/1279613/what-is-an-orm-how-does-it-work-and-how-should-i-use-one), which lets us interact with a database without writing SQL queries as a string. This folder contains our Prisma client, which we use to interact with our mySQL database. In this codebase, the client is accessed through the [Context](../router/context.ts). "Context allows us to "bundle" together information to be passed into each API request". For a better understanding of Prisma overall, I recommend following this [guide](https://www.prisma.io/docs/getting-started/quickstart). Since you need a database for this guide, I recommend using PlanetScale, since it's easy to use and it's what Duy used.

### Contents

- [Usage](#usage)
- [Brief Intro to Zod](#brief-intro-to-zod)
- [Changing the Schema](#changing-the-schema)

---

### Usage

Prisma is used in the [user route](../router/user.ts). Below is a code snippet that is NOT from the codebase, but it still tells you everything you need to know about Prisma.

```typescript
// Sample router.
const fooRouter = createRouter()
  .query("name", {
    input: z.object({
      userId: z.number().int()
    }),
    resolve: async ({ ctx, input }) => {
      return ctx.prisma.user.findOne({
        where: { id: input.userId},
        select: { name: true }
      )
    }
  })
```

There are a few important things happening here.

1. As I mentioned earlier, we access the prisma client through the context (`ctx.prisma`), which is available in every API request.

2. In this example, we are querying data in the user table, which we can specify by saying `prisma.user`.

3. We use the function `findOne()`, which returns a user in the user table that matches the ID in the where "clause", and only displays the name of the user.

   This is roughly equivalent to the SQL query: `SELECT name FROM user WHERE id = userId;`

---

### Brief Intro to Zod

[Zod](https://zod.dev/) is used to validate input object types in calls to our tRPC routes/endpoints.

Below is an example of how Zod is used in the codebase. This code is altered to contain only the relevant bits. My understanding of Zod's usage here is as follows:

1. [A call](../../../src/pages/settings.tsx#L156) to this endpoint looks something like this:

   ```typescript
   editUserMutation.mutate({
       role: userInfo.role,
       status: userInfo.status,
       seatAvail: userInfo.seatAvail,
       ...
   })
   ```

2. When edit is called, the input must first pass through the `z.object`, which enforces type and other constraints on the data. The key part here is if you want to do schema validation, follow the syntax below, specifying what you want as a `z.object`, and putting it as the `input`. tRPC supports Zod, which is why we can pass it to `input` as shown below.

3. If the input is valid according to Zod, the code execution continues through to the resolve, where we use a prisma `update` to update the data in our DB as specified.

```typescript
export const userRouter = createProtectedRouter().mutation("edit", {
  input: z.object({
    role: z.nativeEnum(Role),
    status: z.nativeEnum(Status),
    seatAvail: z.number().int().min(0),
    companyName: z.string().min(1),
    companyAddress: z.string().min(1),
    companyCoordLng: z.number(),
    companyCoordLat: z.number(),
    startAddress: z.string().min(1),
    isOnboarded: z.boolean(),
  }),
  async resolve({ ctx, input }) {
    const id = ctx.session.user?.id;
    const user = await ctx.prisma.user.update({
      where: { id },
      data: {
        role: input.role,
        status: input.status,
        seatAvail: input.seatAvail,
        companyName: input.companyName,
        companyAddress: input.companyAddress,
        companyCoordLng: input.companyCoordLng,
        companyCoordLat: input.companyCoordLat,
        startAddress: input.startAddress,
        isOnboarded: input.isOnboarded,
      },
    });

    return user;
  },
});
```

---

### Changing the Schema

The current schema is defined inside the the [schema.prisma](../../../prisma/schema.prisma). This schema is a default NextAuth schema with a few attributes/enums added, so we can store data we care about, like information about drivers and riders.

You can read more about the schema.prisma syntax [here](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model).

If you change something in the schema.prisma file, the change must be reflected in your actual database and prisma has to regenerate the code for the client. You can achieve both of these with a `yarn prisma db push` OR `yarn db:schema` command. This syncs everything back up.
