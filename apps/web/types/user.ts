import { Role } from './role';

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  /** The gym (tenant) the user belongs to; empty for Super Admins */
  gymId?: string | null;
  createdAt: string;
}

export interface AppUserWithRoles extends AppUser {
  roles?: Role[];
}

export interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface CreateUserForm extends UserForm {
  password: string;
}
