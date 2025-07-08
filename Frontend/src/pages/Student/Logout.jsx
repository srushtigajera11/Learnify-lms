const Logout = () => {
    
    return (
        <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Logout</h1>
        <p className="text-lg mb-6">Are you sure you want to logout?</p>
        <button
           
            className="bg-red-500 text-white px-4 py-2 rounded"
        >
            Logout
        </button>
        </div>
    );
    }

export default Logout;