// src/services/invoiceitemsApi.ts
import { api } from './apiClient';
import { InvoiceItem } from '@/types/invoiceitem';

const INVOICE_ITEMS_API_BASE = '/work/api/invoices';

export interface InvoiceItemsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: InvoiceItem[];
}

export interface InvoiceItemQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all invoice items
export const fetchInvoiceItems = async (params?: InvoiceItemQueryParams): Promise<InvoiceItemsResponse> => {
  try {
    const response = await api.get(`${INVOICE_ITEMS_API_BASE}/`, { params });
    
    // Check if the response has pagination data
    if (response.data && typeof response.data === 'object') {
      // If the API returns an array directly instead of a paginated response
      if (Array.isArray(response.data)) {
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        };
      }
      
      // If the API returns a proper paginated response
      return response.data as InvoiceItemsResponse;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching invoice items:', error);
    throw error;
  }
};

// Get a single invoice item by slug
export const getInvoiceItem = async (slug: string | number): Promise<InvoiceItem> => {
  try {
    const response = await api.get(`${INVOICE_ITEMS_API_BASE}/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching invoice item ${slug}:`, error);
    throw error;
  }
};

// Create a new invoice item
export const createInvoiceItem = async (invoiceItemData: FormData | Partial<InvoiceItem>): Promise<InvoiceItem> => {
  try {
    const config = invoiceItemData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.post(`${INVOICE_ITEMS_API_BASE}/`, invoiceItemData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating invoice item:', error);
    throw error;
  }
};

// Update an existing invoice item
export const updateInvoiceItem = async (slug: string | number, invoiceItemData: FormData | Partial<InvoiceItem>): Promise<InvoiceItem> => {
  try {
    const config = invoiceItemData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.put(`${INVOICE_ITEMS_API_BASE}/${slug}/`, invoiceItemData, config);
    return response.data;
  } catch (error) {
    console.error(`Error updating invoice item ${slug}:`, error);
    throw error;
  }
};

// Partially update an invoice item
export const patchInvoiceItem = async (slug: string | number, invoiceItemData: Partial<InvoiceItem>): Promise<InvoiceItem> => {
  try {
    const response = await api.patch(`${INVOICE_ITEMS_API_BASE}/${slug}/`, invoiceItemData);
    return response.data;
  } catch (error) {
    console.error(`Error patching invoice item ${slug}:`, error);
    throw error;
  }
};

// Delete an invoice item
export const deleteInvoiceItem = async (slug: string | number): Promise<void> => {
  try {
    await api.delete(`${INVOICE_ITEMS_API_BASE}/${slug}/`);
  } catch (error) {
    console.error(`Error deleting invoice item ${slug}:`, error);
    throw error;
  }
};

// Approve invoice item by reviewer
export const approveByReviewer = async (slug: string | number): Promise<InvoiceItem> => {
  try {
    const response = await api.post(`${INVOICE_ITEMS_API_BASE}/${slug}/approve-by-reviewer/`);
    return response.data;
  } catch (error) {
    console.error(`Error approving invoice item ${slug} by reviewer:`, error);
    throw error;
  }
};

// Reject invoice item by reviewer
export const rejectByReviewer = async (slug: string | number): Promise<InvoiceItem> => {
  try {
    const response = await api.post(`${INVOICE_ITEMS_API_BASE}/${slug}/reject-by-reviewer/`);
    return response.data;
  } catch (error) {
    console.error(`Error rejecting invoice item ${slug} by reviewer:`, error);
    throw error;
  }
};

// Approve invoice item by approver
export const approveByApprover = async (slug: string | number): Promise<InvoiceItem> => {
  try {
    const response = await api.post(`${INVOICE_ITEMS_API_BASE}/${slug}/approve-by-approver/`);
    return response.data;
  } catch (error) {
    console.error(`Error approving invoice item ${slug} by approver:`, error);
    throw error;
  }
};

// Reject invoice item by approver
export const rejectByApprover = async (slug: string | number): Promise<InvoiceItem> => {
  try {
    const response = await api.post(`${INVOICE_ITEMS_API_BASE}/${slug}/reject-by-approver/`);
    return response.data;
  } catch (error) {
    console.error(`Error rejecting invoice item ${slug} by approver:`, error);
    throw error;
  }
}; 