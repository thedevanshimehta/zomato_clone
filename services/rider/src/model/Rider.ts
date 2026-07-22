import mongoose, {Schema, Document } from "mongoose";

export interface IRider extends Document{
    userId : string;
    picture:string;
    phoneNumber : string;
    aadharNumber : string;
    drivingLicense : string;
    isVerified : boolean;
    location : {
        type : "Point";
        coordinates : [Number , Number] //longitude,latitude
    };
    isAvailable : boolean;
    lastActiveAt : Date;
    createdt : Date;
    updatedAt : Date;
}

const schema = new Schema<IRider>({
    userId : {
        type : String,
        required : true,
        unique : true,
    },
    picture : {
        type : String,
        required : true,
    },
    phoneNumber:{
        type : String,
        required : true,
        unique : true,
        trim : true,
    },
    aadharNumber:{
        type : String,
        required : true,
    },
    drivingLicense:{
        type : String,
        required : true,
    },
    isVerified : {
        type : Boolean,
        default : false,
    },
    location : {
        type : {
            type : String,
            enum : ["Point"],
            default : "Point",
        },
        coordinates:{
            type:[Number],
            required : true,
        },
    },
    isAvailable:{
        type : Boolean,
        default : false,
    },
    lastActiveAt:{
        type : Date,
        default : Date.now,
    },

},
{
    timestamps : true,
},
);

schema.index({location : "2dsphere"});

export const Rider = mongoose.model<IRider>("Rider",schema);