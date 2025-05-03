// GET /api/address
import { auth } from '@/auth';
import { Address } from '@/models/Address';
import { NextRequest } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const address = await Address.findOne({ userEmail: session.user.email });
  return Response.json(address || {});
}

// POST /api/address
export async function POST(req: NextRequest) {
  const session = await auth();
  const data = await req.json();

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const address = await Address.findOneAndUpdate(
    { userEmail: session.user.email },
    { ...data, userEmail: session.user.email },
    { upsert: true, new: true }
  );

  return Response.json(address);
}