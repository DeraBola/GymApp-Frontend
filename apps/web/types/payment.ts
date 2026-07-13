export interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  memberId: string;
  paymentMethod: string;
  status: string;
  transactionReference: string;
  gymId: string;
}

export interface PaymentMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PaymentForm {
  memberId: string;
  amount: string;
}
