import { Workorder } from "./workorder";
import { User } from "./user";

export interface InvoiceItemDetail {
    id: number;
    item_name: string;
    amount: string;
    description: string;
}

export interface WorkCompletionDetail {
    id: number;
    completion_number: string;
}

export interface InvoiceItem {
    id: number;
    slug?: string;
    invoice_number: string;
    work_order_detail?: Workorder;
    work_completion_detail?: WorkCompletionDetail;
    raised_by_detail?: User;
    items_detail?: InvoiceItemDetail[];
    attachments_data?: AttachmentData[];
    approver_detail?: User;
    reviewers_detail?: User[];
    created_at: string;
    updated_at: string;
    invoice_date: string;
    due_date: string;
    subtotal: string;
    tax_amount: string;
    total_amount: string;
    currency: 'USD' | 'NGN' | 'EUR' | 'GBP';
    status: string;
    tracker_status: string;
    sent_date?: string;
    opened_date?: string;
    pdf_file?: string;
    notes?: string;
    is_reviewed: boolean;
    is_approved: boolean;
    owner: number;
    facility: number;
    work_completion?: number;
    work_order?: number;
    raised_by: number;
    approver: number;
    reviewers: number[];
}

export interface AttachmentData {
    content_type: number;
    object_id: number;
    file: string;
}
  