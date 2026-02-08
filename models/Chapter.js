import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    name:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    index:Number,
    createdAt: Number,
    isLast:Boolean
}
)
const Chapter = mongoose.model("chapter",chapterSchema)



export default Chapter