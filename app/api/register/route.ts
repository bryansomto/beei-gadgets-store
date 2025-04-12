// pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { User } from '@/models/User'
import { saltAndHashPassword } from '@/lib/password'
import { mongooseConnect } from '@/lib/mongoose'
import { NextResponse, NextRequest } from 'next/server'

export async function POST(req: NextRequest, res: NextResponse) {
  // if (req.method !== 'POST') {
  //   return res.status(405).json({ message: 'Method not allowed' })
  // }

  const body = await req.json()
  const { email, password, firstName, lastName } = body
  
  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, {status: 400})
  }

  try {
    await mongooseConnect()

    // Check if user already exists
    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ message: 'Email already in use' }, {status: 409})
    }

    // Hash password
    const hashedPassword = await saltAndHashPassword(password)

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
    })

    await user.save()

    // await User.create({user})

    return NextResponse.json({ message: 'User registered successfully' }, {status: 201})
  } catch (error) {
    console.error('[REGISTER_ERROR]', error)
    return NextResponse.json({ message: 'Internal server error' }, {status: 500})
  }
}
