export type Role = 'admin' | 'shop_owner' | 'staff' | 'client';

export interface User {
  id: string;
  email: string;
  role: Role;
  shop_id: string | null; 
  status?: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  phone?: string;
  avatar?: string;
  // Removed old fields, added nothing specific yet
}

export interface AuthUser extends User {
  profile: UserProfile;
}
