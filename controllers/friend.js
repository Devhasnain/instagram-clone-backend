// const {Router } = require("express");
// const { ErrorHandler } = require("../utliz/ResponseHandlers");
// const usersSchema = require("../database/models/User");
// const route = Router();

// route.put("/follow/:id", async (req,res)=>{
//     try {
//         let {id} = req.params;
//         let user = req.user;

//         if(!id){
//             throw new Error("Bad request.")
//         }

//         let follower = await usersSchema.findById(user._id);

//         let account = await usersSchema.findById(id);

//         if(!account.is_private){
//             account.followers = [...account.followers, user._id];
//             account.save();
//         }



//     } catch (error) {
//         return ErrorHandler(error,req,res);
//     }
// })