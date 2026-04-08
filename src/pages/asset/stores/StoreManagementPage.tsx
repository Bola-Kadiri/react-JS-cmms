import { useAuth } from "@/contexts/AuthContext";
import StoreManagement from "@/features/asset/stores/StoreManagement";

const StoreManagementPage = () => {
  const {user} = useAuth()

  console.log(user);
  return (
    <>

      <div className="container mx-auto">
        <StoreManagement />
      </div>
    </>
  );
};

export default StoreManagementPage; 