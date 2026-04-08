// src/pages/facility/buildings/ApartmentManagementPage.tsx
// import { Helmet } from 'react-helmet-async';
import ApartmentManagement from "@/features/facility/apartments/ApartmentManagement";

const ApartmentManagementPage = () => {
  return (
    <>
      {/* <Helmet>
        <title>Building Management | Facility Management System</title>
      </Helmet> */}

      <div className="container mx-auto">
        <ApartmentManagement />
      </div>
    </>
  );
};

export default ApartmentManagementPage;