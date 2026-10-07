export interface Staff {
  staffId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  gymId: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationInMonths: number;
  gymId: string;
}

export interface GymClass {
  id: string;
  name: string;
  description: string;
  scheduleTime: string;
  capacity: number;
  instructorId?: string | null;
  gymId: string;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  purchaseDate: string;
  gymId: string;
}

export interface EquipmentRepair {
  id: string;
  equipmentId: string;
  description: string;
  repairCost: number;
  repairDate: string;
  status: string;
  gymId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  itemType: string;
  gymId: string;
}

export interface Sale {
  id: string;
  inventoryItemId: string;
  quantity: number;
  totalPrice: number;
  saleDate: string;
  memberId?: string | null;
  gymId: string;
}

export interface SalesReport {
  totalSales: number;
  totalItemsSold: number;
  totalPaymentsCollected: number;
  numberOfPayments: number;
}
