import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/trycatch.js";
import Address from "../model/Address.js";

export const addAddress = TryCatch(async(req:AuthenticatedRequest , res)=>{
    const user = req.user;
    if(!user)
    {
        return res.status(401).json({
            message : "Unauthorized",
        });
    }

    const { mobile,formattedAddress , latitude, longitude} = req.body;
    if(!mobile|| !formattedAddress || latitude===undefined || longitude===undefined)
    {
        return res.status(400).json({
            message : "Please fill all details",
        });
    }

    const newAddress = await Address.create({
        userId : user._id.toString(),
        mobile,
        formattedAddress,
        location : {
            type : "Point",
            coordinates : [Number(longitude) , Number(latitude)],
        },
    });
    res.json({
        message : "Address added sucessfully",
        address : newAddress ,
    });
});

export const deleteAddress = TryCatch(async(req : AuthenticatedRequest , res)=>{
    const user = req.user;
    if(!user)
    {
        return res.status(401).json({
            message : "Unauthorized",
        });
    }

    const {id} = req.params;
    if(!id)
    {
        return res.status(400).json({
            message : "ID is required",
        });
    }

    const address = await Address.findOne({
        _id : id,
        userId : user._id.toString(),
    });
    if(!address)
    {
        return res.status(400).json({
            message : "Address not found",
        });
    }
    await address.deleteOne();

    res.json({
        message : "Address deleted successfully",
    });
});

export const fetchMyAddresses = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    if(!user)
    {
        return res.status(401).json({
            message : "Unauthorized",
        });
    }

    const address = await Address.find({
        userId : user._id.toString(),
    }).sort({createdAt : -1});
    res.json({address});
});