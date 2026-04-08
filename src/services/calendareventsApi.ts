// src/services/calendareventsApi.ts
import { api } from './apiClient';
import { Calendarevent } from '@/types/calendarevent';

const CALENDAR_EVENTS_API_BASE = '/ppm-calendar/api';

export interface CalendarEventsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Calendarevent[];
}

export interface CalendarEventQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch PPM Calendar data (base endpoint)
export const fetchPPMCalendar = async (): Promise<any> => {
  try {
    const response = await api.get(`${CALENDAR_EVENTS_API_BASE}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching PPM calendar:', error);
    throw error;
  }
};

// Fetch all calendar events without filtering parameters
export const fetchCalendarEvents = async (): Promise<CalendarEventsResponse> => {
  try {
    const response = await api.get(`${CALENDAR_EVENTS_API_BASE}/calendar_events`);
    
    // Check if the response has pagination data
    if (response.data && typeof response.data === 'object') {
      // If the API returns an array directly instead of a paginated response
      if (Array.isArray(response.data)) {
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      }
      
      // If the API returns paginated data
      if (Array.isArray(response.data.results)) {
        return {
          count: response.data.count || response.data.results.length,
          next: response.data.next || null,
          previous: response.data.previous || null,
          results: response.data.results
        };
      }
    }
    
    // Default fallback if the structure doesn't match expected format
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
    
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single calendar event by ID
export const getCalendarEvent = async (id: string): Promise<Calendarevent> => {
  const response = await api.get(`${CALENDAR_EVENTS_API_BASE}/${id}`);
  return response.data;
};

// Create a new calendar event
export const createCalendarEvent = async (calendarEvent: Omit<Calendarevent, 'id'>): Promise<Calendarevent> => {
  const response = await api.post(`${CALENDAR_EVENTS_API_BASE}/calendar_events`, calendarEvent);
  return response.data;
};

// Update an existing calendar event
export const updateCalendarEvent = async ({ id, calendarEvent }: { id: string; calendarEvent: Partial<Calendarevent> }): Promise<Calendarevent> => {
  const response = await api.put(`${CALENDAR_EVENTS_API_BASE}/${id}`, calendarEvent);
  return response.data;
};

// Delete a calendar event
export const deleteCalendarEvent = async (id: string): Promise<void> => {
  await api.delete(`${CALENDAR_EVENTS_API_BASE}/${id}`);
};