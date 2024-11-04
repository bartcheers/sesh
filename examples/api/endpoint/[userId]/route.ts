import prisma from '@/prisma/client';
import { NextResponse } from 'next/server';

// GET endpoint for fetching user data with built-in caching
export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: Number(params.userId) },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}
