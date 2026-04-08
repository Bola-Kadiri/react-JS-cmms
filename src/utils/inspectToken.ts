// src/utils/inspectToken.ts
import { jwtDecode } from 'jwt-decode';

// Generic interface - we'll see what's actually in your token
interface UnknownJWTPayload {
  [key: string]: any;
}

export const inspectJWTPayload = (token: string) => {
  try {
    const decoded = jwtDecode<UnknownJWTPayload>(token);
    
    console.log('=== FULL JWT PAYLOAD ===');
    console.log(JSON.stringify(decoded, null, 2));
    console.log('========================');
    
    // Let's see what user-related fields are available
    console.log('=== USER FIELDS ANALYSIS ===');
    Object.keys(decoded).forEach(key => {
      console.log(`${key}:`, typeof decoded[key], '-', decoded[key]);
    });
    console.log('=============================');
    
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};