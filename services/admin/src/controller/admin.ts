import {ObjectId} from 'mongodb';
import TryCatch from '../middleware/trycatch.js';
import { getRestaurantCollection,getRiderCollection } from '../util/collection.js';

export const getPendingRestaurant = TryCatch(async(req,res)=>{
    const restaurant = await ((await getRestaurantCollection()).find({isVerified : false})).toArray();

    res.json({
        count : restaurant.length,
        restaurant,
    });

});

export const getPendingRiders = TryCatch(async(req,res)=>{
    const rider = await ((await getRiderCollection()).find({isVerified : false})).toArray();

    res.json({
        count : rider.length,
        rider,
    });

});

export const verifyRestaurant = TryCatch(async(req,res)=>{
    const {id}=req.params;

    if(typeof id !== "string")
    {
        return res.status(400).json({
            message : "Invalid Restaurant ID",
        });
    }
    if(!ObjectId.isValid(id)){
        return res.status(400).json({
            message :"Invalid Object ID",
        });
    }
    const result = await (await getRestaurantCollection()).updateOne(
        {_id : new ObjectId(id)},
        {
            $set:{
                isVerified : true,
                updatedAt : new Date(),
            }
        }
    );
    if(result.matchedCount === 0)
    {
        return res.status(400).json({
            message : "Restaurant not found",
        });
    }
    res.json({
        message : "Restaurant verified successfully",
    });
});

export const verifyRider = TryCatch(async(req,res)=>{
    const {id}=req.params;

    if(typeof id !== "string")
    {
        return res.status(400).json({
            message : "Invalid Rider ID",
        });
    }
    if(!ObjectId.isValid(id)){
        return res.status(400).json({
            message :"Invalid Object ID",
        });
    }
    const result = await (await getRiderCollection()).updateOne(
        {_id : new ObjectId(id)},
        {
            $set:{
                isVerified : true,
                updatedAt : new Date(),
            }
        }
    );
    if(result.matchedCount === 0)
    {
        return res.status(400).json({
            message : "Rider not found",
        });
    }
    res.json({
        message : "Rider verified successfully",
    });
});