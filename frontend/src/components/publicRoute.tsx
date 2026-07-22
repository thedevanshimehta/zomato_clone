// we are authneticated, still we can access the login page. To fix that-
import {useAppData} from "../context/AppContext";
import {Navigate,Outlet} from "react-router-dom";

const PublicRoute=()=>{
    const{isAuth,loading}=useAppData();

    if(loading)
    {
        return null;
    }
    return isAuth ? <Navigate to = "/" replace/>:<Outlet/>
    //if logged in go to home page, else go to login
}
export default PublicRoute;