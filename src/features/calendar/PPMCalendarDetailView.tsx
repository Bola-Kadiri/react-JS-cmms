// src/features/ppm/calendar/PPMCalendarDetail.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Repeat, FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCalendarEventQuery } from '@/hooks/calendarevent/useCalendareventQueries';

const PPMCalendarDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Fetch calendar event details
  const { 
    data: event, 
    isFetching, 
    isError, 
    refetch 
  } = useCalendarEventQuery(id);

  // Helper function for date formatting
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function for duration calculation
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours > 0 ? `${diffHours} hour${diffHours > 1 ? 's' : ''}` : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}` : ''}`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
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

  // Event handlers
  const handleGoBack = () => {
    navigate('/calendar/ppm');
  };

  // Loading state
  if (isFetching) {
    return (
      <div className="py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading calendar event details...</p>
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
          <div className="text-red-500 text-xl">Error loading calendar event details</div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleGoBack} variant="default">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!event) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-gray-500 text-xl">Calendar event not found</div>
          <Button onClick={handleGoBack} variant="default">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Calendar
        </Button>
        <h1 className="text-2xl font-bold">PPM Calendar Event Details</h1>
      </div>

      {/* Event Details */}
      <div className="grid gap-6">
        {/* Main Event Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Event ID: {event.id}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date and Time Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date & Time
                  </h3>
                  <p className="text-gray-700">{formatDateTime(event.start)}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End Date & Time
                  </h3>
                  <p className="text-gray-700">{formatDateTime(event.end)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration
                  </h3>
                  <p className="text-gray-700">{calculateDuration(event.start, event.end)}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Frequency
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">{event.frequency}</span>
                    <Badge variant="outline" className={getFrequencyBadgeStyles(event.frequency_unit)}>
                      {event.frequency_unit}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Schedule Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>This event occurs every {event.frequency} {event.frequency_unit.toLowerCase()}</strong>
                {event.frequency === 1 ? ` (${event.frequency_unit.slice(0, -1).toLowerCase()}ly)` : ''}
              </p>
              <p className="text-blue-700 mt-1 text-sm">
                Next occurrence: {formatDateTime(event.start)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PPMCalendarDetail;