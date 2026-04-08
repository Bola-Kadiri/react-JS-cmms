import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  user_id: string;
  email: string;
  name?: string;
  role: string;
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
  // Add other fields that your backend includes in the JWT
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  // Add other user properties as needed
}

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const extractUserFromToken = (token: string): User | null => {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    id: decoded.user_id,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
  };
};