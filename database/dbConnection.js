const mongoose = require("mongoose");

require("dotenv").config();

module.exports = async () =>{
    try {
        if(mongoose.connection.readyState === 1){
        console.log("already connected to database...")
            return
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected to database...")
    } catch (error) {
        console.log(error?.message);
        process.exit(1);
    }
}