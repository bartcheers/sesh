import { query } from 'sesh-cache-helper';
import prisma from '@/prisma/client';
import Link from 'next/link';

const getUser = query(
  async (userId: number) =>
    prisma.user.findUnique({
      where: { id: userId },
    }),
  (userId) => `user-${userId}`,
);

export default async function UserPage({ params }: { params: { userId: string } }) {
  const user = await getUser(Number(params.userId));

  if (!user) {
    return <div>User not found.</div>;
  }

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
