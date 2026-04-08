interface ZoneDetail {
    id: number;
    code: string;
    name: string;
  }
  
  export interface Building {
    id: number;
    code: string;
    name: string;
    zone: number;
    zone_detail?: ZoneDetail;
    facility: number;
    facility_detail: {
      id: number;
      code: string;
      name: string;
      cluster: number;
    },
    status: 'Active' | 'Inactive'; // Use union if status is limited
  }
