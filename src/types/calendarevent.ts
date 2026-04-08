type FrequencyUnit = 'Hours' | 'Days' | 'Weeks' | 'Months';

export interface Calendarevent {
  id: number;
  title: string;
  start: string;
  end: string;
  color: string;
  description: string;
  category?: string;
  frequency: number;
  frequency_unit: FrequencyUnit;
}
