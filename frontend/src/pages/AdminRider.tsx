import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";


const AdminRider = ({rider,onVerify,}:{rider:any;onVerify:()=>void}) => {

const verify = async()=>{
    try {
        await axios.patch(`${adminService}/api/v1/verify/rider/${rider._id}`,{},{
            headers:{
                Authorization : `Bearer ${localStorage.getItem("token")}`
            }
        });
        toast.success("Rider Verified");
        onVerify();
    } catch (error) {
        toast.error("Failed rider verification");
    }
};

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
<img src={rider.image} alt="" className="h-40 w-full object-cover rounded" />
<h3>Aadhar Number {rider.aadharNumber}</h3>
<p className="text-sm text-gray-500">
Phone Number {rider.phoneNumber}
</p>
<p className="text-sm text-gray-500">
Driving License {rider.drivingLicense}
</p>

<button className="w-full rounded bg-green-500 py-2 text-white hover:bg-green-600" onClick={verify}>
Verify Rider
</button>
    </div>
  )
}

export default AdminRider