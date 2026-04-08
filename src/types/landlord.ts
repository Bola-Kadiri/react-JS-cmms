export interface Landlord {
id: number;
name: string;
email: string;
phone: string;
address: string;
status: 'Active' | 'Inactive'; // Use union if status is limited
}
  