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
    const { firstName, lastName, phoneNumber } = data;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' }, 
        { status: 400 }
      );
    }

    let processedPhoneNumber = '';

    // Process phone number if provided
    if (phoneNumber && phoneNumber.trim() !== '') {
      try {
        // Use phoneSchema to validate and transform
        const result = phoneSchema.safeParse(phoneNumber);
        
        if (result.success) {
          processedPhoneNumber = result.data;
        } else {
          return NextResponse.json(
            { error: result.error.errors[0].message }, 
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid phone number format' }, 
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = { 
      firstName,
      lastName,
    };
    
    // Only add phoneNumber to update if it's not empty
    if (processedPhoneNumber !== '') {
      updateData.phoneNumber = processedPhoneNumber;
    }

    // Update the user
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return updated profile
    const userProfile = {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber || '', // Use optional chaining
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
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

    // Return all fields with safe access to phoneNumber
    const userProfile = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}