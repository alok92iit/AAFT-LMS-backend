import mongoose from "mongoose";

const assignCourseSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: Number
}
)
const AssignCourse = mongoose.model("assignCourse",assignCourseSchema)
export default AssignCourse