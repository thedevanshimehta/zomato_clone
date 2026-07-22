import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";
import TryCatch from "../middleware/trycatch.js";
import { Rider } from "../model/Rider.js";

export const addRiderProfile = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;

    if(!user)
    {
        return res.status(401).json({
            message : "Unauthorized",
        });
    }
    if(user.role!=="rider")
    {
        return res.status(403).json({
            message : "Only riders can create ride profile",
        });
    }

    const file=req.file;
    if(!file)
    {
        return res.status(400).json({
            message : "Rider image is required",
        });
    }

    const fileBuffer = getBuffer(file);
    if(!fileBuffer?.content)
    {
        return res.status(500).json({
            message : "Failed to generate image buffer",
        });
    }

    const {data:uploadResult} = await axios.post(`${process.env.UTILIS_SERVICE}/api/upload`,{
        buffer : fileBuffer.content,
    });

    const {phoneNumber, aadharNumber , drivingLicense , latitude , longitude} = req.body;

    if(!phoneNumber || !aadharNumber || !drivingLicense || latitude===undefined || longitude===undefined)
    {
        return res.status(400).json({
            message : "Phone Number, Aadhar Number , Driving License , Latitude and Longitude are required",
        });
    }

    const existingProfile = await Rider.findOne({
        userId : user._id,
    });

    if(existingProfile)
    {
        return res.status(400).json({
            message : "Rider profile already exists",
        })
    }

    const riderProfile = await Rider.create({
        userId : user._id,
        picture : uploadResult.url,
        phoneNumber,
        aadharNumber,
        drivingLicense,
        location : {
            type : "Point",
            coordinates : [longitude , latitude],
        },
        isAvailable : false,
        isVerified : false,
    });

    return res.status(201).json({
        message : "Rider profile created successfully",
        riderProfile,
    });

});

export const fetchMyProfile = TryCatch(async(req:AuthenticatedRequest,res)=>{
   const user = req.user;

    if(!user)
    {
        return res.status(401).json({
            message : "Unauthorized",
        });
    }

    const account = await Rider.findOne({
        userId : user._id,
    });
    res.json(account);
});

export const toggleAvailability = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const user = req.user;
    const {isAvailable , latitude , longitude}=req.body;

    if(!user)
    {
        return res.status(401).json({
            message : "Unauthorized",
        });
    }
    if(user.role!=="rider")
    {
        return res.status(403).json({
            message : "Only riders can create ride profile",
        });
    }
    if(typeof isAvailable !== "boolean")
    {
        return res.status(400).json({
            message : "isAvailable must be boolean",
        });
    }
    if(latitude === undefined || longitude === undefined)
    {
        return res.status(400).json({
            message : "Location is required",
        });
    }

    const rider = await Rider.findOne({
        userId : user._id,
    });

    if(!rider)
    {
        return res.status(404).json({
            message : "Rider profile not found",
        });
    }

    if(isAvailable && !rider.isVerified)
    {
        return res.status(403).json({
            message : "Rider is not verified",
        });
    }

    rider.isAvailable=isAvailable;
    rider.location ={
        type : "Point",
        coordinates : [longitude,latitude],
    };
    rider.lastActiveAt=new Date();

    await rider.save()

    res.json({
        message : isAvailable?"Rider is now online":"Rider is offline",
        rider,
    });

});

export const acceptOrder = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const riderUserId = req.user?._id;
    const {orderId} = req.params;

    if(!riderUserId)
    {
        return res.status(400).json({
            message : "Please Login",
        });
    }

    const rider=await Rider.findOne({userId : riderUserId , isAvailable : true});

    if(!rider)
    {
        return res.status(404).json({
            message : "Rider Not Found",
        });
    }

    try {
        const {data} = await axios.post(`${process.env.RESTAURANT_SERVICE}/api/order/assign/rider`,{
            orderId , 
            riderId : rider._id.toString(),
            riderUserId:rider.userId,
            riderName :rider.picture,
            riderPhone : rider.phoneNumber,
        },
    {
        headers : {
            "x-internal-key" : process.env.INTERNAL_SERVICE_KEY,
        }
    });

    if(data.success)
    {
        const riderDetails = await Rider.findOneAndUpdate(
            {
                userId : riderUserId,
                isAvailable : true,
            },
            {isAvailable : false},
            {new : true}
        );
        res.json({
            message : "Order Accepted",
        });
    }

    } catch (error) {
        res.status(400).json({
            message : "Order already taken",
        });
    }

});

export const fetchMyOrder = TryCatch(async(req:AuthenticatedRequest,res)=>{
    const riderUserId = req.user?._id;

    if(!riderUserId)
    {
        return res.status(400).json({
            message : "Please Login",
        });
    }

    const rider=await Rider.findOne({userId : riderUserId , isVerified : true});

    if(!rider)
    {
        return res.status(404).json({
            message : "Rider Not Found",
        });
    }

    try {
        const {data} = await axios.get(`${process.env.RESTAURANT_SERVICE}/api/order/current/rider?riderId=${rider._id}`,{
            headers : {
                "x-internal-key" : process.env.INTERNAL_SERVICE_KEY,
            },
        });

    res.json({
        order:data,
    })

    } catch(error:any){
    console.log(error.response?.data);
    console.log(error.response?.status);

    res.status(500).json(error.response?.data);
}

});

export const updateOrderStatus = TryCatch(async(req : AuthenticatedRequest,res)=>{
    const userId = req.user?._id;

    if(!userId)
    {
        return res.status(401).json({
            message : "Please Login",
        });
    }

    const rider = await Rider.findOne({userId : userId});
    
    if(!rider)
        {
            return res.status(404).json({
                message : "Please Login",
            });
        }
        
        
    const {orderId} = req.params;
    
    try {
        const {data} = await axios.put(`${process.env.RESTAURANT_SERVICE}/api/order/update/status/rider`,{orderId},
            {
            headers : {
                "x-internal-key" : process.env.INTERNAL_SERVICE_KEY,
            },
        });

    res.json({
        message : data.message,
    })

    } catch (error) {
        res.status(400).json({
            message : "Order already taken",
        });
    }

});