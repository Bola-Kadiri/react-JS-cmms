export interface Category {
    id: number;
    code: string;
    name: string;
    description: string;
    problem_type: string;
    work_request_approved?: 'create_work_order' | 'close_work_request'; // You can make this a union if it has specific values
    exclude_costing_limit: boolean;
    power: boolean;
    create_payment_requisition: boolean;
    status: 'Active' | 'Inactive'; // Adjust as needed
    subcategories: SubCat[]; // If this will be an array later, change to: string[]
  }
  
  export interface SubCat {
    id: number;
    title: string;
    code: string;
    work_request_approved: "create_work_order" | "close_work_request";
    exclude_costing_limit: boolean;
    power: boolean;
    create_payment_requisition: boolean;
    description?: string;
    status: "Active" | "Inactive";
  }
  
  