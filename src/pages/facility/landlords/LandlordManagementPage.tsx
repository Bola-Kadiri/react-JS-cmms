// src/pages/facility/landlords/LandlordManagementPage.tsx
// import { Helmet } from 'react-helmet-async';
import LandlordManagement from "@/features/facility/landlords/LandlordManagement";

const LandlordManagementPage = () => {
  return (
    <>
      {/* <Helmet>
        <title>Building Management | Facility Management System</title>
      </Helmet> */}

      <div className="container mx-auto">
        <LandlordManagement />
      </div>
    </>
  );
};

export default LandlordManagementPage;