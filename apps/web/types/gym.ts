export interface Gym {
  id: string;
  gymId?: string;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  country: string;
  isActive: boolean;
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
