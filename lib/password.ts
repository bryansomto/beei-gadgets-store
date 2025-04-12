import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12 // good balance between security and performance

/**
 * Hash a plaintext password
 * @param plainPassword - User's raw password
 * @returns Hashed password string
 */
export async function saltAndHashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS)
  return await bcrypt.hash(plainPassword, salt)
}

/**
 * Compare a plaintext password with a hashed one
 * @param plainPassword - User-provided password during login
 * @param hashedPassword - Password stored in DB
 * @returns Whether the password matches
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword)
}
