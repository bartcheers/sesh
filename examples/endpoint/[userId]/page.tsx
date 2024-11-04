import Link from 'next/link';
import { notFound } from 'next/navigation';

// Type for our user data
type User = {
  id: number;
  name: string;
  email: string;
};

// Server Component with built-in caching
export default async function UserPage({ params }: { params: { userId: string } }) {
  const start = Date.now();
  const response = await fetch(`http://localhost:3000/api/endpoint/${params.userId}`, {
    // Cache for 1 hour by default
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    notFound();
  }

  const user: User = await response.json();

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
