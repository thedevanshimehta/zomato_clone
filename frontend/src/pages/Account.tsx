import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext"
import toast from "react-hot-toast";
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi";

const Account = () => {

    const {user,setUser,setIsAuth}=useAppData();
    const firstLetter=user?.name.charAt(0).toUpperCase();
    const navigate=useNavigate();

    const logoutHandler=()=>{
        localStorage.setItem("token","");
        setUser(null);
        setIsAuth(false);
        navigate("/");
        toast.success("Logout Successful");
    };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-md rounded-lg bg-white shadow-sm">
            <div className="flex items-center gap-4 border-b p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-xl font-semibold text-white">
                    {firstLetter}
                </div>
            <div>
                <h1 className="text-lg font-semibold text-gray-500">{user?.name}</h1>
                <h1 className="text-sm font-semibold text-gray-500">{user?.email}</h1>
            </div>
            </div>
            <div className="divide-y">
                <div className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50" onClick={()=>navigate("/orders")}>
                    <BiPackage h-5 w-5 text-red-500/>
                    <span className="font-medium">Your Orders</span>
                </div>
                <div className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50" onClick={()=>navigate("/address")}>
                    <BiMapPin h-5 w-5 text-red-500/>
                    <span className="font-medium">Addresses</span>
                </div>
                <div className="flex cursor-pointer items-center gap-4 p-5 hover:bg-gray-50" onClick={logoutHandler}>
                    <BiLogOut h-5 w-5 text-red-500/>
                    <span className="font-medium">Logout</span>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Account