import { User } from '@/models/User'
import { verifyPassword } from '@/lib/saltPassword'
import { mongooseConnect } from '@/lib/mongoose'

interface VerifyUserParams {
    email: string
    password: string
}

interface VerifyUserResult {
    id: string
    email: string
    name: string
}

export default async function verifyUser(
    { email, password }: VerifyUserParams
): Promise<VerifyUserResult | null> {
    await mongooseConnect()

    const user = await User.findOne({ email }) as { _id: string; email: string; password: string; firstName: string } | null

    if (!user || !user.password) {
        return null
    }

    const id = user._id.toString() // ensure id is a string
    const isValidPassword = verifyPassword(password, user.password)

    if (!isValidPassword) {
        return null
    }

    return { id: id, email: user.email, name: user.firstName } // return the user object
}
