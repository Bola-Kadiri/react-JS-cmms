// src/features/ppm/calendar/PPMCalendarManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Loader2 } from 'lucide-react';
import { SearchFilter } from '@/components/SearchFilter';
import { Pagination } from '@/components/Pagination';
import { usePPMCalendarQuery } from '@/hooks/calendarevent/useCalendareventQueries';
import { Calendarevent } from '@/types/calendarevent';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const PPMCalendarManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Filter and pagination state
  const [searchValue, setSearchValue] = useState('');
  const [frequencyUnitFilter, setFrequencyUnitFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Fetch PPM Calendar data
  const { 
    data = [], 
    isFetching, 
    isError, 
    refetch 
  } = usePPMCalendarQuery();

  // Client-side filtering logic
  const filteredData = useMemo(() => {
    let results = [...(Array.isArray(data) ? data : [])];
    
    // Search filter - search by title or description
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      results = results.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Frequency unit filter
    if (frequencyUnitFilter && frequencyUnitFilter !== 'all') {
      results = results.filter(event => event.frequency_unit === frequencyUnitFilter);
    }
    
    // Color filter
    if (colorFilter && colorFilter !== 'all') {
      results = results.filter(event => event.color === colorFilter);
    }
    
    return results;
  }, [data, searchValue, frequencyUnitFilter, colorFilter]);
  
  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, pageSize]);
  
  // Calculate total pages
  const totalEvents = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalEvents / pageSize));
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchValue, frequencyUnitFilter, colorFilter]);

  // Event handlers
  const handleViewEvent = (id: number) => {
    navigate(`/calendar/ppm/view/${id}`);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // Handle frequency unit filter
  const handleFrequencyUnitFilterChange = (value: string) => {
    setFrequencyUnitFilter(value);
  };

  // Handle color filter
  const handleColorFilterChange = (value: string) => {
    setColorFilter(value);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Helper functions for date formatting
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function for frequency badge styling
  const getFrequencyBadgeStyles = (unit: string) => {
    switch (unit) {
      case 'Days':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case 'Hours':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'Weeks':
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case 'Months':
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Get unique values for filter options
  const uniqueFrequencyUnits = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return [...new Set(data.map(event => event.frequency_unit))];
  }, [data]);

  const uniqueColors = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return [...new Set(data.map(event => event.color))];
  }, [data]);

  // Loading state
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading PPM calendar events...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading PPM calendar events</div>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">PPM Calendar Management</h1>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchFilter 
            onSearch={handleSearch}
            placeholder="Search by title or description..."
            initialSearchValue={searchValue}
          />
        </div>
        
        <div className="w-full md:w-56">
          <Select value={frequencyUnitFilter} onValueChange={handleFrequencyUnitFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by frequency unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequency Units</SelectItem>
              {uniqueFrequencyUnits.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-48">
          <Select value={colorFilter} onValueChange={handleColorFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              {uniqueColors.map(color => (
                <SelectItem key={color} value={color}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300" 
                      style={{ backgroundColor: color }}
                    />
                    {color}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* PPM Calendar Events Table */}
      <Card className="w-full shadow-sm">
        <div className="bg-white rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-medium text-gray-600">ID</TableHead>
                <TableHead className="font-medium text-gray-600">Title</TableHead>
                <TableHead className="font-medium text-gray-600">Start</TableHead>
                <TableHead className="font-medium text-gray-600">End</TableHead>
                {/* <TableHead className="font-medium text-gray-600">Color</TableHead> */}
                <TableHead className="font-medium text-gray-600">Frequency</TableHead>
                {/* <TableHead className="font-medium text-gray-600">Description</TableHead> */}
                <TableHead className="font-medium text-gray-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No PPM calendar events found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((event: Calendarevent) => (
                  <TableRow key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{event.id}</TableCell>
                    <TableCell className="max-w-xs truncate" title={event.title}>
                      {event.title}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(event.start)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDateTime(event.end)}
                    </TableCell>
                    {/* <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300" 
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="text-sm">{event.color}</span>
                      </div>
                    </TableCell> */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{event.frequency}</span>
                        <Badge variant="outline" className={getFrequencyBadgeStyles(event.frequency_unit)}>
                          {event.frequency_unit}
                        </Badge>
                      </div>
                    </TableCell>
                    {/* <TableCell className="max-w-xs truncate" title={event.description}>
                      {event.description}
                    </TableCell> */}
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleViewEvent(event.id)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalEvents > 0 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalEvents}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PPMCalendarManagement;