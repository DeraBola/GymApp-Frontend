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

export interface InitializePaymentResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface PaymentForm {
  memberId: string;
  email: string;
  amount: string;
}
