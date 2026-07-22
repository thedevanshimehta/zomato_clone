import axios from "axios";
import {useState} from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from 'react-icons/fc';
import { useAppData } from "../context/AppContext";

const Login = () => {
  const [loading,setLoading]=useState(false);
  const navigate = useNavigate();
  const {setIsAuth,setUser}=useAppData();

  const responseGoogle = async(authResult : any) =>
  {
    setLoading(true);

    try {
        const result = await axios.post(`${authService}/api/auth/login`,{
          code : authResult["code"],
        });
        localStorage.setItem("token",result.data.token);
        toast.success("Login Successful !");
        setLoading(false);
        setUser(result.data.user);
        setIsAuth(true);
        navigate("/");

    } catch (error:any) {
        console.log(error);
        console.log(error.response);
        console.log(error.message);
       
        toast.error("Problem in Login !");
    }

  };

  const googleLogin=useGoogleLogin({
      onSuccess:responseGoogle,
      onError:responseGoogle,
      flow:"auth-code",
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
          <h1 className="text-center text-3xl font-bold text-[#E23774]">
              Zomaato
          </h1>
          <p className="text-center text-sm text-gray-500">
              Login or Sign Up to continue
          </p>
        <button onClick={googleLogin} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3">
          <FcGoogle size={20}/>
          {loading?"Signing in...": "Continue with Google"}
        </button>
        <p className="text-center text-xs text-gray-400">By continuing,you agree with our {" "}
          <span className="text-[#E23774]">Terms of Services</span> &{" "}<span className="text-[#E23774]">Privacy Policy</span>
        </p>

      </div>
    </div>
  )
}

export default Login
//if user not logged in already, log them in