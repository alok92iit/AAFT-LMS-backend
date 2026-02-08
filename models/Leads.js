import mongoose from "mongoose";
// import bcrypt from "bcrypt"
// import { sendMail } from "../services/mailer.js";
// import { onBoardMail, onBoardMailSales, welcomeMail } from "../utils/mail.js";
// import { v4 as uuidv4 } from 'uuid';
// import { currentDate, currentTimeStamp } from "../utils/common.js";
// import { findByAggregate } from "../utils/dbOperations.js";


const leadSchema = new mongoose.Schema({

  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    index: true,
  },
  
  name: {
    type: String,
    trim: true,
    // default: null
    required: true,
  },

  

  phoneNo: {
    type: String,
    trim: true,

    required: true,
    // unique: true,
    // index: true,
  },
  
 

  status: {
    type: String,
    required: true,
    enum: ["new","contacted","qualified","converted","lost"],

  },
  source: {
    type: String,
    required: true,
    

  },
  assignedTo:
     {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index:true
  },
  createdBy:
     {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    index:true
  },
  createdAt:Number,

  
  
});



const Leads = mongoose.model("leads", leadSchema);
export default Leads;


