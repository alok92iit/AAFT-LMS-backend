import mongoose from "mongoose";
// import bcrypt from "bcrypt"
// import { sendMail } from "../services/mailer.js";
// import { onBoardMail, onBoardMailSales, welcomeMail } from "../utils/mail.js";
// import { v4 as uuidv4 } from 'uuid';
// import { currentDate, currentTimeStamp } from "../utils/common.js";
// import { findByAggregate } from "../utils/dbOperations.js";


const userSchema = new mongoose.Schema({

  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    index: true,
  },
  refreshToken:{
    trim: true,
    type: String,
  },

  password: {
    type: String,
    trim: true,
    min: [8, 'minimum 8 are allowed'],
    min: [15, 'maximum 15 are allowed'],
    default: null
  },
  name: {
    type: String,
    trim: true,
    // default: null
    required: true,
  },

  address: {
    country: {
      type: String,
      trim: true,
      default: null
    },
    state: {
      type: String,
      trim: true,
      default: null
    },
    city: {
      type: String,
      trim: true,
      default: null
    },
    street: {
      type: String,
      trim: true,
      default: null
    },
    pincode: {
      type: String,
      trim: true,
      default: null
      
    },
  },

  phoneNo: {
    type: String,
    trim: true,

    required: true,
    // unique: true,
    // index: true,
  },
  
 createdAt:Number,

  role: {
    type: String,
    required: true,
    enum: ["OWNER","STUDENT"],

  },
  
});

// console.log("lklmdwpkedpokedpoewkfdo3f=",currentDate())
//hasing the password before saving it 
// userSchema.pre('save', function (next) {
//   const user = this;
//   if (!user.isModified('password')) return next();

//   bcrypt.genSalt(10, (err, salt) => {
//     if (err) return next(err);
//     bcrypt.hash(user.password, salt, (err, hash) => {
//       if (err) return next(err);
//       user.password = hash;
//       next();
//     });
//   });
// });

// Method to compare password
export const comparePassword = function (user, candidatePassword, callback) {
  bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};


const Users = mongoose.model("users", userSchema);
export default Users;


