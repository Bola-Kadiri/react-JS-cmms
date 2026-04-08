const Unauthorized = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">You don't have permission to access this resource.</p>
        <button 
          onClick={() => window.history.back()}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;