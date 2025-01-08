
const DeliveryStatus = require('../Models/DeliveryStatus');
const Ably = require('ably');

const deliveryStatus = async (req, res) => {
    console.log(req.body)
    const userId=req.body.userId
    const planId=req.body.planId
    const message=req.body.message

    try {
        const ably = new Ably.Realtime(`${process.env.ABLY_API_KEY}`)
        ably.connection.once("connected", () => {
            console.log("Connected to Ably!")
        })

        const deliveryData=new DeliveryStatus({
            userId:userId,
            planId:planId,
            message:message
        })


        await deliveryData.save();
        const channel = ably.channels.get("delivery-status");
        const eventName = `status:${userId}:${planId}`;
        console.log('eventName: ',eventName);
        console.log('message: ',message)
        await channel.publish(eventName, message)
        console.log(`message has been successfully delivered`)
        return res.status(200).json(deliveryData);
    } catch (error) {
        // Log the error for debugging
        console.error('Error with Delivery:', error.message);
        // Return a 500 status for internal server error
        return res.status(500).json({ message: 'Internal server error' });
    }
};

  module.exports = {deliveryStatus};
