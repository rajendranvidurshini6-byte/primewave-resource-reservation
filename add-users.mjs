import('./src/prisma/db.ts').then(async ({db}) => {
  const alice = await db.orm.public.User.create({
    name: 'Alice',
    email: 'alice@example.com',
  });

  const bob = await db.orm.public.User.create({
    name: 'Bob',
    email: 'bob@example.com',
  });

  console.log('Added users:');
  console.log(alice);
  console.log(bob);
}).catch(console.error)
