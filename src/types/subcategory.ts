export interface Subcategory {
    id: number;
    title: string;
    description: string;
    exclude_costing_limit: boolean;
    status: 'Active' | 'Inactive'; // Adjust as needed
    category: string; // If this will be an array later, change to: string[]
  }
  