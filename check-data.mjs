import('./src/prisma/db.ts').then(async ({db}) => {
  const resources = await db.orm.public.Resource.where({}).all();
  const reservations = await db.orm.public.Reservation.where({}).all();

  console.log('RESOURCES:');
  console.log(resources);

  console.log('RESERVATIONS:');
  console.log(reservations);
}).catch(console.error)
