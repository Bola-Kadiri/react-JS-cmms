// src/features/ppm/calendar/PPMCalendarDetail.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Repeat, FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCalendarEventQuery } from '@/hooks/calendarevent/useCalendareventQueries';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const PPMCalendarDetail = () => {
  const { t } = useTypedTranslation('work');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: event,
    isFetching,
    isError,
    refetch
  } = useCalendarEventQuery(id);

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

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      const dayLabel = diffDays === 1 ? t('calendar.detail.units.day') : t('calendar.detail.units.days');
      const hourPart = diffHours > 0
        ? ` ${diffHours} ${diffHours === 1 ? t('calendar.detail.units.hour') : t('calendar.detail.units.hours')}`
        : '';
      return `${diffDays} ${dayLabel}${hourPart}`;
    } else if (diffHours > 0) {
      const hourLabel = diffHours === 1 ? t('calendar.detail.units.hour') : t('calendar.detail.units.hours');
      const minutePart = diffMinutes > 0
        ? ` ${diffMinutes} ${diffMinutes === 1 ? t('calendar.detail.units.minute') : t('calendar.detail.units.minutes')}`
        : '';
      return `${diffHours} ${hourLabel}${minutePart}`;
    } else {
      const minuteLabel = diffMinutes === 1 ? t('calendar.detail.units.minute') : t('calendar.detail.units.minutes');
      return `${diffMinutes} ${minuteLabel}`;
    }
  };

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

  const handleGoBack = () => {
    navigate('/calendar/ppm');
  };

  if (isFetching) {
    return (
      <div className="py-8">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t('calendar.detail.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-xl">{t('calendar.detail.error')}</div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline">
              {t('calendar.detail.tryAgain')}
            </Button>
            <Button onClick={handleGoBack} variant="default">
              {t('calendar.detail.goBack')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-gray-500 text-xl">{t('calendar.detail.notFound')}</div>
          <Button onClick={handleGoBack} variant="default">
            {t('calendar.detail.goBack')}
          </Button>
        </div>
      </div>
    );
  }

  const frequencyAdverbMap: Record<string, string> = {
    Days: t('calendar.detail.frequencyAdverb.Days'),
    Hours: t('calendar.detail.frequencyAdverb.Hours'),
    Weeks: t('calendar.detail.frequencyAdverb.Weeks'),
    Months: t('calendar.detail.frequencyAdverb.Months'),
  };
  const frequencyAdverb = frequencyAdverbMap[event.frequency_unit] ?? '';

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('calendar.detail.backToCalendar')}
        </Button>
        <h1 className="text-2xl font-bold">{t('calendar.detail.pageTitle')}</h1>
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
                  <span className="text-sm text-gray-600">{t('calendar.detail.eventId', { id: event.id })}</span>
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
                    {t('calendar.detail.startDateTime')}
                  </h3>
                  <p className="text-gray-700">{formatDateTime(event.start)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('calendar.detail.endDateTime')}
                  </h3>
                  <p className="text-gray-700">{formatDateTime(event.end)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('calendar.detail.durationLabel')}
                  </h3>
                  <p className="text-gray-700">{calculateDuration(event.start, event.end)}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    {t('calendar.detail.frequency')}
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
                {t('calendar.detail.description')}
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Summary Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('calendar.detail.scheduleSummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>
                  {t('calendar.detail.occursEvery', {
                    frequency: event.frequency,
                    unit: event.frequency_unit.toLowerCase()
                  })}
                </strong>
                {event.frequency === 1 && frequencyAdverb ? ` (${frequencyAdverb})` : ''}
              </p>
              <p className="text-blue-700 mt-1 text-sm">
                {t('calendar.detail.nextOccurrence', { date: formatDateTime(event.start) })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PPMCalendarDetail;
