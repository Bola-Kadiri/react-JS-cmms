// src/types/report.ts

// One row of the User Facility Report — mirrors
// report.api.serializers.UserFacilityReportSerializer on the backend.
export interface UserFacilityReportRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  facilities: string[];
  // true when `facilities` came from the user's work-request history
  // rather than an explicit facility assignment (most users in this
  // system don't have one yet) — the UI marks those badges as inferred.
  facilities_inferred: boolean;
  login_count: number;
  work_request_count: number;
  item_request_count: number;
  // null, not 0 — the system has no visitor-pass feature yet, so this is
  // "not tracked" rather than a real, counted zero. See
  // report/api/serializers.py on the backend for why.
  visitor_pass_count: number | null;
}
