export interface Bankaccount {
    id: number;
    slug: string;
    bank: string;
    account_name: string;
    account_number: string;
    currency: 'NGN' | 'USD' | 'EUR' | 'GBP'; // or a union type like 'NGN' | 'USD' | etc.
    address: string;
    details: string;
    status: 'Active' | 'Inactive'; // or just string if more statuses are expected
  }
  