import prisma from '@/prisma/client';
import Link from 'next/link';

export default async function UserPage({ params }: { params: { userId: string } }) {
  const start = Date.now();
  const user = await prisma.user.findUnique({
    where: { id: Number(params.userId) },
  });

  if (!user) {
    return <div>User not found.</div>;
  }
  const end = Date.now();
  const duration = (end - start).toString().padStart(3, ' ');
  console.log(`⏳${duration}ms `);

  return (
    <div className='flex flex-col items-center justify-center h-screen w-full'>
      <h1 className='text-4xl font-bold'>{user.name}</h1>
      <p className='text-lg'>{user.email}</p>

      <Link
        href={`/sesh-cache-helper/${Number(params.userId) === 1 ? 2 : 1}`}
        className='underline mt-4'>
        Other User
      </Link>
    </div>
  );
}
