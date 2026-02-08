import mongoose from "mongoose";



const courseSchema=new mongoose.Schema({
    name:{
    trim: true,
    type: String,
    required:true
  },
    description:{
    trim: true,
    type: String,
    required:true
  },
    courseImage:{
    trim: true,
    type: String,
    required:true
  },
  status:{
    type:String,
    default:"draft",
    enum:["draft","active"]
  },
    createdAt:{

    type: Number,
    required:true
  },
})
const Courses = mongoose.model("Course", courseSchema);
export default Courses;
