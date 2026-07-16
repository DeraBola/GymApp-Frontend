export interface Gym {
  id: string;
  gymId?: string;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  country: string;
  isActive: boolean;
  createdAt: string;
}

export interface GymDetail {
  id: string;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  country: string;
  isActive: boolean;
  createdAt: string;
  members: GymMember[];
}

export interface GymMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  dob: string;
  gymId: string;
  status: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
}

export interface CreateGymForm {
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  country: string;
}

export interface EditGymForm {
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  country: string;
  isActive: boolean;
}

export interface BranchForm {
  name: string;
  address: string;
  phoneNumber: string;
}
