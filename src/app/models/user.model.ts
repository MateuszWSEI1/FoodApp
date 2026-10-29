export type UserRole = 'customer' | 'admin';

export interface Address {
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  deliveryAddress?: Address;
  passwordHash: string;
}