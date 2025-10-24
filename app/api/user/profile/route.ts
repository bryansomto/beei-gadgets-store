// app/api/user/profile/route.ts
import { auth } from '@/auth';
import { User } from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { mongooseConnect } from '@/lib/mongoose';
import { phoneSchema } from '@/lib/phoneSchema';

// PUT /api/user/profile - Update user profile
export async function PUT(req: NextRequest) {
  try {
    await mongooseConnect();
    
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { firstName, lastName, phone } = data;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' }, 
        { status: 400 }
      );
    }

    let processedPhoneNumber = '';

    // Process phone number if provided
    if (phone && phone.trim() !== '') {
      const result = phoneSchema.safeParse(phone);
      if (result.success) {
        processedPhoneNumber = result.data;
      } else {
        return NextResponse.json(
          { error: result.error.errors[0].message },
          { status: 400 }
        );
      }
    }

    // Define a proper type instead of `any`
    interface UpdateData {
      firstName: string;
      lastName: string;
      phone?: string;
    }

    const updateData: UpdateData = { 
      firstName,
      lastName,
    };
    
    if (processedPhoneNumber !== '') {
      updateData.phone = processedPhoneNumber;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userProfile = {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
    };

    return NextResponse.json(userProfile);
  } catch {
    console.error('Error updating user profile');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/user/profile - Get user profile
export async function GET() {
  try {
    await mongooseConnect();
    
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userProfile = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    };

    return NextResponse.json(userProfile);
  } catch {
    console.error('Error fetching user profile');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
