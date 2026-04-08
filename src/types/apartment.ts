import { Building } from "./building";
import { Landlord } from "./landlord";

export interface Apartment {
    id: string;
    no: string;
    type: string;
    building: number;
    building_detail: Building;
    landlord_detail: Landlord;
    no_of_sqm: number;
    description: string;
    landlord: number;
    ownership_type: "Freehold" | "Leasehold" | "Freehold (Leased Out)";
    service_power_charge_start_date: string; // ISO date string (e.g., "2025-04-15")
    address: string;
    bookable: boolean;
    common_area: boolean;
    available_for_lease: boolean;
    remit_lease_payment: boolean;
    status: "Active" | "Inactive";
  }
