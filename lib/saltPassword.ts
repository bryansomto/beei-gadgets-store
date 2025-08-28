import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12; // good balance between security and performance
const PEPPER = process.env.PASSWORD_PEPPER || ''; // Optional pepper for extra security

/**
 * Validate password strength
 */
export function isPasswordStrong(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check for character diversity
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const requirementsMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (requirementsMet < 3) {
    return { 
      isValid: false, 
      message: 'Password must contain at least 3 of: uppercase, lowercase, numbers, or special characters' 
    };
  }
  
  // Check for common passwords (simplified example)
  const commonPasswords = ['password', '12345678', 'qwertyui', 'letmein'];
  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, message: 'Password is too common' };
  }
  
  return { isValid: true };
}

/**
 * Hash a plaintext password
 * @param plainPassword - User's raw password
 * @returns Hashed password string
 */
export async function saltAndHashPassword(plainPassword: string): Promise<string> {
  try {
    if (!plainPassword || typeof plainPassword !== 'string') {
      throw new Error('Password must be a non-empty string');
    }
    
    // Apply pepper if configured
    const passwordToHash = PEPPER ? plainPassword + PEPPER : plainPassword;
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(passwordToHash, salt);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
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
  try {
    if (!plainPassword || !hashedPassword) {
      // Use dummy comparison to prevent timing attacks
      await bcrypt.compare('dummy_value', '$2a$12$dummyhashvalueforconstanttime');
      throw new Error("Missing arguments to verifyPassword");
    }
    
    // Apply the same pepper if configured
    const passwordToVerify = PEPPER ? plainPassword + PEPPER : plainPassword;
    return await bcrypt.compare(passwordToVerify, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// const SALT_ROUNDS = 12 // good balance between security and performance

// /**
//  * Hash a plaintext password
//  * @param plainPassword - User's raw password
//  * @returns Hashed password string
//  */
// export async function saltAndHashPassword(plainPassword: string): Promise<string> {
//   const salt = await bcrypt.genSalt(SALT_ROUNDS)
//   return await bcrypt.hash(plainPassword, salt)
// }

// /**
//  * Compare a plaintext password with a hashed one
//  * @param plainPassword - User-provided password during login
//  * @param hashedPassword - Password stored in DB
//  * @returns Whether the password matches
//  */
// export async function verifyPassword(
//   plainPassword: string,
//   hashedPassword: string
// ): Promise<boolean> {
//   if (!plainPassword || !hashedPassword) {
//     throw new Error("Missing arguments to verifyPassword");
//   }
//   return await bcrypt.compare(plainPassword, hashedPassword)
// }
