import { unstable_cache } from 'next/cache';
import prisma from '@/prisma/client';
import Link from 'next/link';

// Cache user lookup for 60 seconds with a tag for invalidation
const getCachedUser = unstable_cache(
  async (userId: number) => {
    const start = Date.now();
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    const end = Date.now();
    const duration = (end - start).toString().padStart(3, ' ');
    console.log(`⏳${duration}ms cached lookup`);

    return user;
  },
  ['user-lookup'],
  { revalidate: 60, tags: ['user'] },
);

export default async function UserPage({ params }: { params: { userId: string } }) {
  const user = await getCachedUser(Number(params.userId));

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
