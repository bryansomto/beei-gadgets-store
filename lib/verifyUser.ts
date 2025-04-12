import type { NextApiRequest, NextApiResponse } from 'next'
import { User } from '@/models/User'
import { verifyPassword } from '@/lib/password'
import { mongooseConnect } from '@/lib/mongoose'

interface VerifyUserParams {
    email: string
    password: string
}

interface VerifyUserResult {
    id: string
    email: string
    password: string
}

export default async function verifyUser(
    { email, password }: VerifyUserParams
): Promise<VerifyUserResult | false> {
    await mongooseConnect()

    const user = await User.findOne({ email }) as { _id: string; email: string; password: string }

    if (!user) {
        return false
    }

    const id = user._id.toString() // ensure id is a string
    const isValidPassword = verifyPassword(password, user.password)

    if (!isValidPassword) {
        return false
    }

    return { id: id, email: user.email, password: user.password }
}
