export interface Personnel {
    id: number;
    slug: string;
    user: number;
    staff_number: string;
    facility: number;
    email: string;
    phone_number: string;
    avatar: string;
    status: 'Active' | 'Inactive'; // Adjust if you have strict enum values
    access_to_all_categories: boolean;
    categories: number[];
    documents: string[];
    documents_data: {
        id: number,
        file: string,
        name: string,
        uploaded_at: string
    }[];
    first_name: string;
    last_name: string;
    avatar_url: string;
  }
  