import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext"
import axios from "axios";
import { restaurantService, utilisService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";
import {loadStripe} from "@stripe/stripe-js";

interface Address{
  _id : string;
  formattedAddress : string;
  mobile : number;
}

const Checkout = () => {

  const {cart ,subtotal , quantity} = useAppData();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address []>([]);
  const [selectedAddressID, setSelectedAddressID] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(()=>{
    const fetchAddress = async()=>{
      if(!cart || cart.length===0)
      {
        setLoadingAddress(false);
        return;
      }

      try {
        const {data} = await axios.get(`${restaurantService}/api/address/all`,{
          headers : {
            Authorization : `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setAddresses(data.address || []);

      } catch (error) {
        console.log(error);
      }finally{
        setLoadingAddress(false);
      }

    };
    fetchAddress();
  },[cart]);

console.log(selectedAddressID);

if(!cart || cart.length===0)
{
  return (
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-gray-500 text-lg">
                Your cart is empty
            </p>
          </div>
        );
}



const restaurant = cart[0].restaurantId as IRestaurant;

const deliveryFee = subtotal<250?49:0;

const platformFee = 7;

const grandTotal = subtotal+deliveryFee+platformFee;

const createOrder =async(paymentMethod : "razorpay" | "stripe")=>{
    if(!selectedAddressID)
    {
      return null;
    }
    setCreatingOrder(true);
    try {
      const {data} = await axios.post(`${restaurantService}/api/order/new`,
         {
          paymentMethod,
          addressId : selectedAddressID,
        },{
          headers : {
            Authorization : `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      return data;
    } catch (error) {
      toast.error("Failed to create order");
    }finally{
      setCreatingOrder(false);
    }
};

const paywithRazorpay = async()=>{
    try {
      setLoadingRazorpay(true);
    
      const order = await createOrder("razorpay");
      if(!order)
      {
        return;
      }

      const {orderId , amount} = order
      const {data} = await axios.post(`${utilisService}/api/payment/create`,{
        orderId
      });
    
      const {razorpayOrderId , key} = data;

      const option = {
        key ,
        amount : amount*100,
        currency: "INR",
        name: "Zomaato", 
        description: "Food Delivey App Test",
        order_id: razorpayOrderId, 
        handler : async(response:any)=>{
          try {
            await axios.post(`${utilisService}/api/payment/verify`,{
              razorpay_order_id : response.razorpay_order_id,
              razorpay_payment_id : response.razorpay_payment_id,
              razorpay_signature:response.razorpay_signature,
              orderId,
            });
          toast.success("Payment succesful");
          navigate("/paymentsuccess/"+response.razorpay_payment_id);
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        theme: {
        "color": "#E23744"
    }
  } 
  const razorpay = new (window as any).Razorpay(option);
  razorpay.open();
}catch(error){
    console.log(error);
    toast.error("Payment failed. Please refresh page");
}finally{
  setLoadingRazorpay(false);
}
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHIBLE_KEY);

const payWithStripe = async()=>{
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if(!order)
      {
        return;
      }
    
      const{orderId} = order;

      try {
        const stripe = await stripePromise;

      const {data} = await axios.post(`${utilisService}/api/payment/stripe/create`,{
        orderId
      });

      if(data.url)
      {
        window.location.href=data.url;
      }
      else{
        toast.error("Failed to create payment session");
      }

      } catch (error) {
        console.log(error);
        toast.error("Payment failed");
      }finally{
        setLoadingStripe(false);
      }

    } catch (error) {
      toast.error("Payment failed");
    }finally{
      setLoadingStripe(false);
    }
};

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Checkout
      </h1>
      <div className="rounded-xl bg-white p-4 shadow-sm">
         <h2 className="text-lg font-semibold">
            {restaurant.name}
         </h2>
      <p className="text-sm text-gray-500">
        {restaurant.autoLocation.formattedAddress}
      </p>
      </div>
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
      <h3 className="font-semibold">
          Delivery Address
      </h3>
    {
      loadingAddress ? <p className="text-sm text-gray-500">
          Loading Address...
      </p>: addresses.length===0 ? <p className="text-sm text-gray-500"> No address found. Please add one.
      </p> : addresses.map((add)=>(
        <label key={add._id} className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition ${selectedAddressID === add._id ? "border-[#e23744] bg-red-50" : "hover:bg-gray-50"}`}>
          <input type="radio" checked={selectedAddressID===add._id}
          onChange={()=>setSelectedAddressID(add._id)}>
          </input>
        <div>
          <p className="text-sm font-medium">
           {add.formattedAddress}  
          </p>
          <p className="text-xs text-gray-500"> 
            {add.mobile}
          </p>
        </div>
        </label>
      ))
    }
    </div>
    <div  className="rounded-xl bg-white p-4 shadow-sm space-y-4">
      <h3 className="font-semibold">
        Order Summary
      </h3>
    {
      cart.map((cartItem : ICart)=>{
          const item = cartItem.itemId as IMenuItem;

          return(
            <div className="flex justify-between text-sm" key={cartItem._id}>
          <span>
            {item.name}x{cartItem.quantity}
          </span>
          <span>
            ₹ {item.price*cartItem.quantity}
          </span>
            </div>
          )
      })
    }
    <hr/>
    <div className="flex justify-between text-sm">
    <span>
      Items ({quantity})
    </span>
    <span>
    ₹  {subtotal}
    </span>
    </div>
    <div className="flex justify-between text-sm">
    <span>
      Delivery Fee
    </span>
    <span>
    {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
    </span>
    </div>
  <div className="flex justify-between text-sm">
    <span>
      Platform Fee
    </span>
  <span>
   ₹ {platformFee}
  </span>
  </div>
   {
            subtotal < 250 && (
              <p className="text-xs text-gray-500">
                Add items worth ₹{250-subtotal} or more to avail FREE DELIVERY !
              </p>
            )
          }
          <div className="flex justify-between text-base font-semibold border-t p-2">
            <span>Grand Total</span><span>₹{grandTotal}</span>
          </div>
    </div>
    <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
          <h3 className="font-semibold">
          Payment Method
          </h3>
    <button disabled={!selectedAddressID || loadingRazorpay || creatingOrder} onClick={paywithRazorpay} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2D7FF9] py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
  {
    loadingRazorpay ?(
      <BiLoader size={18} className="animate-spin"/>
    ) : (
      <BiCreditCard size={18}/>
    )
  }
  Pay With Razorpay
    </button>
  <button disabled={!selectedAddressID || loadingStripe || creatingOrder} onClick={payWithStripe} className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
  {
    loadingStripe ?(
      <BiLoader size={18} className="animate-spin"/>
    ) : (
      <BiCreditCard size={18}/>
    )
  }
  Pay With Stripe
    </button>
    </div>
    </div>
  )
}

export default Checkout