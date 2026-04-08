export interface Vendor {
    id: number;
    slug: string;
    name: string;
    type: 'Individual' | 'Company';
    phone: string;
    email: string;
    address?: string;
    registration_number?: string;
    account_name: string;
    bank: string;
    account_number: string;
    currency: 'NGN' | 'USD' | 'EUR' | 'GBP';
    status: 'Active' | 'Inactive';
  }
