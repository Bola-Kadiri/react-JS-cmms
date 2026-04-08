// src/types/client.ts
export interface Contact {
    id?: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: 'Active' | 'Inactive';
  }
  
  export interface Client {
    id: number;
    slug: string;
    type: 'Individual' | 'Company';
    code: string;
    name: string;
    email: string;
    phone: string;
    group: string;
    address: string;
    status: 'Active' | 'Inactive';
    contacts: Contact[];
    contacts_data: Contact[]; // Updated to be Contact[] instead of string
  }