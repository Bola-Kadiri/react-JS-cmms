export interface VendorContract {
  id: number;
  contract_title: string;
  contract_title_en?: string;
  contract_title_fr?: string;
  contract_title_es?: string;
  vendor: number;
  vendor_detail?: {
    id: number;
    slug?: string;
    name: string;
    type?: string;
    phone?: string;
    email?: string;
    account_name?: string;
    bank?: string;
    account_number?: string;
    currency?: string;
    status?: string;
  };
  contract_type: 'Service' | 'Purchase' | 'Lease' | 'NDA';
  start_date: string;
  end_date: string;
  proposed_value: string;
  reviewer: number;
  reviewer_detail?: {
    id: number;
    user_id?: string;
    slug?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    roles?: string;
    status?: string;
  };
  reviewers_detail?: any[];
  attachments_data?: any[];
  review_status?: string;
  is_reviewed?: boolean;
  reviewed_at?: string | null;
  review_comment?: string | null;
  owner?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface VendorContractFormData {
  contract_title: string;
  vendor: number;
  contract_type: 'Service' | 'Purchase' | 'Lease' | 'NDA';
  start_date: string;
  end_date: string;
  proposed_value: string;
  reviewer: number;
  attachment?: File[];
}

export interface VendorContractResponse {
  success: boolean;
  message: string;
  data: VendorContract;
}

export interface VendorContractListResponse {
  success: boolean;
  message: string;
  data: VendorContract[];
}

