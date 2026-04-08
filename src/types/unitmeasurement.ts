export interface Unitmeasurement {
    id: number;
    code: string;
    description: string;
    symbol: string;
    type: 'Area' | 'Packing' | 'Piece' | 'Time' | 'Volume' | 'Weight' | 'Other';
    status: 'Active' | 'Inactive';
  }