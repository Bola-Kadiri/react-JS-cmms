// src/hooks/calendarevents/useCalendarEventQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchPPMCalendar,
  fetchCalendarEvents,
  getCalendarEvent,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  CalendarEventQueryParams
} from '@/services/calendareventsApi'
import { Calendarevent } from '@/types/calendarevent';
import React from 'react';

// Key factory for consistent query keys
export const calendarEventKeys = {
  all: ['calendarEvents'] as const,
  ppmCalendar: ['ppmCalendar'] as const,
  lists: () => [...calendarEventKeys.all, 'list'] as const,
  list: (params: CalendarEventQueryParams) => [...calendarEventKeys.lists(), params] as const,
  details: () => [...calendarEventKeys.all, 'detail'] as const,
  detail: (id: string) => [...calendarEventKeys.details(), id] as const,
};

// Hook for fetching PPM Calendar base data
export const usePPMCalendarQuery = () => {
  return useQuery({
    queryKey: calendarEventKeys.ppmCalendar,
    queryFn: fetchPPMCalendar,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
};

// Hook for fetching calendar events list
export const useCalendarEventsQuery = () => {
  return useQuery({
    queryKey: calendarEventKeys.all,
    queryFn: fetchCalendarEvents,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single calendar event
export const useCalendarEventQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: calendarEventKeys.detail(id as string),
    queryFn: () => getCalendarEvent(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a calendar event
export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.ppmCalendar });
      toast.success('Calendar event created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create calendar event', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
      });
      console.error('Create calendar event error:', error);
    },
  });
};

// Hook for updating a calendar event
export const useUpdateCalendarEvent = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCalendarEvent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.detail(id as string) });
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.ppmCalendar });
      toast.success('Calendar event updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update calendar event', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update calendar event error:', error);
    },
  });
};

// Hook for deleting a calendar event
export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.ppmCalendar });
      toast.success('Calendar event deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete calendar event', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete calendar event error:', error);
    },
  });
};