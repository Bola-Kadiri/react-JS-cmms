// src/features/ppm/calendar/PPMEventCalendar.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar, Loader2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCalendarEventsQuery } from '@/hooks/calendarevent/useCalendareventQueries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PPMEventCalendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Fetch calendar events
  const { 
    data = { count: 0, results: [] }, 
    isFetching, 
    isError, 
    refetch 
  } = useCalendarEventsQuery();

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter events by category
  const filteredEvents = useMemo(() => {
    const events = Array.isArray(data.results) ? data.results : [];
    if (categoryFilter === 'all') return events;
    return events.filter(event => event.category === categoryFilter);
  }, [data.results, categoryFilter]);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const events = Array.isArray(data.results) ? data.results : [];
    return [...new Set(events.map(event => event.category))];
  }, [data.results]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const events = getEventsForDate(date);
      days.push({ date, events });
    }

    return days;
  };

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
  const handleViewEvent = (id: number) => {
    navigate(`/calendar/ppm/view/${id}`);
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading calendar events...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">Error loading calendar events</div>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          PPM Event Calendar
        </h1>
        
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">
                {monthNames[currentMonth]} {currentYear}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-medium text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dayData, index) => (
              <div
                key={index}
                className={`min-h-32 border-r border-b p-2 ${
                  !dayData ? 'bg-gray-50' : ''
                } ${
                  dayData && isToday(dayData.date) ? 'bg-blue-50' : ''
                }`}
              >
                {dayData && (
                  <>
                    {/* Date number */}
                    <div className={`text-sm font-medium mb-1 ${
                      isToday(dayData.date) ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {dayData.date.getDate()}
                    </div>

                    {/* Events */}
                    <div className="space-y-1">
                      {dayData.events.slice(0, 3).map((event, eventIndex) => (
                        <div
                          key={`${event.id}-${eventIndex}`}
                          className="group cursor-pointer"
                          onClick={() => handleViewEvent(event.id)}
                        >
                          <div 
                            className="text-xs p-1 rounded text-white truncate group-hover:shadow-sm transition-shadow"
                            style={{ backgroundColor: event.color }}
                            title={`${event.title} - ${formatTime(event.start)}`}
                          >
                            <div className="flex items-center gap-1">
                              <span className="truncate">{event.title}</span>
                              <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                            <div className="text-xs opacity-90">
                              {formatTime(event.start)}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Show more indicator */}
                      {dayData.events.length > 3 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{dayData.events.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {uniqueCategories.map(category => {
              const categoryEvents = filteredEvents.filter(e => e.category === category);
              const categoryColor = categoryEvents.length > 0 ? categoryEvents[0].color : '#gray';
              
              return (
                <div key={category} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <span className="text-sm">{category}</span>
                  <Badge variant="outline" className="text-xs">
                    {categoryEvents.length}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PPMEventCalendar;