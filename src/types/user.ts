import { Apartment } from "./apartment";
import { Building } from "./building";
import { Category } from "./category";
import { Client } from "./client";
import { Department } from "./department";
import { Facility } from "./facility";
import { Warehouse } from "./warehouse";

export type Role =
  | 'SUPER ADMIN'
  | 'ADMIN'
  | 'REQUESTER'
  | 'REVIEWER'
  | 'APPROVER'
  | 'PROCUREMENT AND STORE';

export type Gender = 'Male' | 'Female' | 'Other';

export type Status = 'Active' | 'Inactive';

export interface User {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  slug: string;
  roles: Role;
  email: string;
  phone: string;
  designation: string;
  date_of_birth: string;
  gender: Gender;
  nationality: string;
  passport_number: string;
  address: string;
  status: Status;
  avatar: string;
  team_lead: boolean;
  generate_reports: boolean;
  approval_limit: string;
  date_joined: string;
  last_login: string;
  is_verified: boolean;
  is_blocked: boolean;
  is_active: boolean;
  access_to_all_facilities: boolean;
  facility: number[];
  facility_detail: Facility[];
  access_to_all_flats: boolean;
  flats: number[];
  flats_detail: Building[];
  access_to_all_apartments: boolean;
  // apartments: number[];
  // apartments_detail: Apartment[];
  access_to_all_categories: boolean;
  categories: number[];
  categories_detail: Category[];
  access_to_all_warehouses: boolean;
  warehouse: number[];
  warehouse_detail: Warehouse[];
  access_to_all_departments: boolean;
  departments: number[];
  departments_detail: Department[];
  access_to_all_clients: boolean;
  clients: number[];
  clients_detail: Client[];
  supervisor: number;
}

// export interface User {
//   first_name: string;
//   last_name: string;
//   roles: 'Super Admin' | 'Facility Admin' | 'Facility Procurement' | 'Facility Manager' | 'Facility Officer' | 'Facility Auditor' | 'Facility Account' | 'Facility Store' | 'Facility View';
//   email: string;
//   phone: string;
//   designation: string;
//   date_of_birth: string;
//   gender: 'Male' | 'Female' | 'Other';
//   nationality: string;
//   passport_number: string;
//   address: string;
//   status: 'Active' | 'Inactive';
//   team_lead: boolean;
//   generate_reports: boolean;
//   approval_limit: string;
//   is_verified: boolean;
//   is_blocked: boolean;
//   is_active: boolean;
//   access_to_all_facilities: boolean;
//   facility: number[];
//   access_to_all_flats: boolean;
//   flats: number[];
//   access_to_all_apartments: boolean;
//   apartments: number[];
//   access_to_all_categories: boolean;
//   categories: number[];
//   access_to_all_warehouses: boolean;
//   warehouse: number[];
//   access_to_all_departments: boolean;
//   departments: number[];
//   access_to_all_clients: boolean;
//   clients: number[];
//   supervisor: number;
// }