

const mongoose = require('mongoose')

const connectDb = async ()=>{
    const MONGOURI='mongodb+srv://monudixit0007:3ANbSCqwdWG58HoC@cluster0.1hoqp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

    try
    {
        console.log(process.env.MONGOURI)
        const connection  = await mongoose.connect((MONGOURI),
    {
        useNewUrlParser:true,
        useUnifiedTopology:true
    })

    console.log('mongo db connected')

    }

    catch (error) 

    {
        console.log("here is error",error)
        process.exit(1)
    }
    
}

module.exports = connectDb