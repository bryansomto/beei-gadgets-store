import type { InferSchemaType } from 'mongoose';
import { User } from '@/models/User'
import { verifyPassword } from '@/lib/saltPassword'
import { mongooseConnect } from '@/lib/mongoose'
import { isUserAdmin } from './isUserAdmin'
import { getInitials } from './getInitials';

interface VerifyUserParams {
    email: string
    password: string
}

interface VerifyUserResult {
    id: string
    email: string
    name: string
    isAdmin: boolean
    image: string
    initials: string
}

export default async function verifyUser(
    { email, password }: VerifyUserParams
): Promise<VerifyUserResult | null> {
    await mongooseConnect()

    type UserType = InferSchemaType<typeof User.schema> & { _id: string, isAdmin: boolean, image: string, initials: string };
    const user: UserType | null = await User.findOne({ email });

    if (!user || !user.password) {
        return null
    }

    const id = user._id.toString() // ensure id is a string

    const initials = await getInitials(user.firstName || "", user.lastName || "")
    console.log(initials)

    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
        return null
    }
    const isAdmin = await isUserAdmin(user.email)

    return { id, email: user.email, name: user.firstName || "", isAdmin, image: user.image || "", initials } // return the user object
}
