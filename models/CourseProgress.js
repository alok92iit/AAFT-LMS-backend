import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    totalWatchTime:{
        type:Number,
        // required:true,
    },
    lastWatched:{
        type:Number
    },
    isWatched:Boolean,
    watchPercentage:Number,
    createdAt: Number
}
)
const CourseProgress = mongoose.model("CourseProgress",courseProgressSchema)
export default CourseProgress