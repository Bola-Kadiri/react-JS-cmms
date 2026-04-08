export interface Facility {
  id: number;
  cluster: number;
  cluster_detail: {
    id: number;
    name: string;
    region: number;
  };
  code: string;
  name: string;
  address_gps: string;
  type: string;
  manager: number;
}
