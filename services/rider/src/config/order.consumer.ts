import axios from "axios";
import {getChannel} from "./rabbitmq.js";
import {Rider} from "../model/Rider.js";

export const startOrderReadyConsumer = async()=>{
    const channel = getChannel();

    console.log("Starting to consume from : ",process.env.ORDER_READY_QUEUE);

   channel.consume(process.env.ORDER_READY_QUEUE!,async(msg)=>{
    if(!msg)
    {
        return;
    }

    try {
        console.log("Received Message",msg.content.toString());
        const event = JSON.parse(msg.content.toString());

        console.log("event type",event.type);

        if(event.type!=="ORDER_READY_FOR_RIDER")
        {
            console.log("Skipping non-order-ready-for-rider event");
            channel.ack(msg);
            return;
        }

    const {orderId , restaurantId, location } = event.data;
    console.log("Searching for rider near me",location);

    const rider=await Rider.find({
        isAvailable : true,
        isVerified : true,
        location : {
            $near:{
                $geometry : location,
                $maxDistance : 500,
            },
        },
    });

    console.log(`Found ${rider.length} nearby riders`);

    if(rider.length===0)
    {
        console.log("No riders available nearby");
        channel.ack(msg);
        return;
    }

    for(const r of rider)
    {
        console.log(`Notifying rider userId : ${r.userId}`);

        try {
            await axios.post(
            `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
            {
                event : "order:available",
                room : `user:${r.userId}`,
                payload : {orderId , restaurantId},
            },
            {
                headers : {
                    "x-internal-key" : process.env.INTERNAL_SERVICE_KEY
                },
            }
        );

        console.log(`Notified rider ${r.userId} successfully`);

        } catch (error) {
            console.log(`Failed to notify rider : ${r.userId}`);
        }
        
    }
    channel.ack(msg);
    console.log("Message acknowledged");

    } catch (error) {
        console.log("Order Ready Consumer Problem");
    }

   });
};