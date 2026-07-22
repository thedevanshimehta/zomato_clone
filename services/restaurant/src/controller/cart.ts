import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/trycatch.js";
import Cart from "../model/Cart.js";

export const addToCart = TryCatch(async(req:AuthenticatedRequest,res)=>{
    if(!req.user)
    {
        return res.status(401).json({
            message : "Please Login",
        });
    }
    const userId = req.user._id;
    const {restaurantId , itemId} = req.body;

    if(!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(itemId))
    {
        return res.status(400).json({
            message : "Invalid restaurant or item ID",
        });
    }

    const cartFrom = await Cart.findOne({
        userId, 
        restaurantId  : {$ne : restaurantId},
    });

    if(cartFrom)
    {
        return res.status(400).json({
            message : "Please empty current cart to order from a different restaurant",
        });
    }

    const cartItem = await Cart.findOneAndUpdate({
        userId, restaurantId , itemId
    } , {
        $inc : {quantity : 1},
        $setOnInsert:{userId, restaurantId , itemId}
    } , {
        upsert : true , new : true , setDefaultsOnInsert : true
    });
    return res.json({
        message : "Item added to cart",
        cart : cartItem,
    });
});

export const fetchMyCart = TryCatch(async(req:AuthenticatedRequest , res)=>{
    if(!req.user)
    {
        return res.status(401).json({
            message : "Please Login",
        });
    }

    const userId = req.user._id;
    const cartItems = await Cart.find({userId}).populate("itemId").populate("restaurantId");

    let subtotal = 0;
    let cartLength = 0;

    for(const cartItem of cartItems)
    {
        const item : any = cartItem.itemId;
        subtotal+=item.price*cartItem.quantity;
        cartLength+=cartItem.quantity;
    }
    return res.json({
        success : true,
        cartLength,
        subtotal,
        cart : cartItems,
    });
});

export const incrementItem = TryCatch(async (req:AuthenticatedRequest, res)=>{
    const userId = req.user?._id;
    const {itemId }= req.body;

    if(!userId || !itemId)
    {
        return res.status(400).json({
            message : "Invalid Request",
        });
    }

    const cartItem = await Cart.findOneAndUpdate(
        {userId , itemId} , {$inc : {quantity: 1} } , {new : true} 
    );

    if(!cartItem)
    {
        return res.status(400).json({
            message : "Item not found",
        });
    }
    res.json({
        message : "Quantity increased",
        cartItem,
    });
});

export const decrementItem = TryCatch(async (req:AuthenticatedRequest, res)=>{
    const userId = req.user?._id;
    const {itemId} = req.body;

    if(!userId || !itemId)
    {
        return res.status(400).json({
            message : "Invalid Request",
        });
    }

    const cartItem = await Cart.findOne(
        {userId , itemId} 
    );

    
    if(!cartItem)
    {
            return res.status(400).json({
                message : "Item not found",
            });
    }
        
    if(cartItem.quantity === 1)
    {
        await Cart.deleteOne({userId , itemId});

        return res.json({
            message : "Item deleted. Cart is now empty !",
        });
    }

    cartItem.quantity-=1;
    await cartItem.save();
    
        res.json({
        message : "Quantity decreased",
        cartItem,
    });
});

export const clearCart = TryCatch(async(req:AuthenticatedRequest ,res)=>{
    const userId = req.user?._id;
    if(!userId)
    {
        return res.status(401).json({
            message : "Unauthorized",
        });
    }

    await Cart.deleteMany({userId});

    res.json({
        message : "Cart cleared successfully",
    });
});