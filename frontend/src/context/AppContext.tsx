import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
import axios from "axios";
import { authService, restaurantService } from "../main";
import type { AppContextType , ICart, LocationData, User } from "../types";

const AppContext=createContext<AppContextType | undefined>(undefined);

interface AppProviderProps{
    children : ReactNode;
}

export const AppProvider =({children}:AppProviderProps) => {
    const[user,setUser]=useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<LocationData | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [city, setCity] = useState("Fetching Location...");

    async function fetchUser()
    {
        try {
            const token=localStorage.getItem("token");

            const {data}=await axios.get(`${authService}/api/auth/me`,{
                headers:{
                    Authorization : `Bearer ${token}`, 
                },
            });

            setUser(data);
            setIsAuth(true);
 
        } catch (error) {
            console.log(error);
        } finally{
            setLoading(false);
        }
    }

    const [cart, setCart] = useState<ICart[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [quantity, setQuantity] = useState(0);

    async function fetchCart(){
        if(!user || user.role!=="customer")
        {
            return;
        }

        try {
            const {data} = await axios.get(`${restaurantService}/api/cart/all`,{
                headers : {
                    Authorization : `Bearer ${localStorage.getItem("token")}`
                },
            });

            setCart(data.cart || []);
            setSubtotal(data.subtotal || 0);
            setQuantity(data.cartLength);

        } catch (error) {
            console.log(error);
        }

    }

    useEffect(()=>{
        fetchUser();
    },[]);

    useEffect(()=>{
        if(user && user.role === "customer")
        {
            fetchCart();
        }
    },[user]);

    useEffect(()=>{
        if(!navigator.geolocation)
        {
            return alert("Please allow location access");
        }
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(async(position)=>{
            const {latitude,longitude}=position.coords

            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                
                const data=await res.json();
                
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress:data.display_name || "Current Location",
                });

                setCity(
                    data.address.city || data.address.town || data.address.village || "Current Location",
                )

            } catch (error) {
                setLocation({
                    latitude,
                    longitude,
                    formattedAddress:"Current Location",
                });
                setCity("Failed to load...");
                console.log(error);
            }
            finally {
            setLoadingLocation(false);
            }
        })
    },[])

    return (
        <AppContext.Provider value={{isAuth , loading , setIsAuth ,setLoading , user , setUser,loadingLocation , location, city ,cart , fetchCart , subtotal , quantity}}>{children}

</AppContext.Provider>
    );
};

export const useAppData = () : AppContextType => {
     const context = useContext(AppContext);
     if(!context)
     {
        throw new Error("useAppData must be used within App Provider ")
     }
     return context;
};

//so all components can access certain things globally - in this case user authentication