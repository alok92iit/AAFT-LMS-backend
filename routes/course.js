import express from "express";
import { addChapter, addCourse, allcourses, assignCourse, deleteChapter, deleteCourse, editCourse, enrolledCourse, getCourseDetail, getLearnerToAssignCourse, trackCourseProgress } from "../controller/courses.controller.js";
import initializeMulter from "../uploads.js";
import path from "path"
import { AdminAccess } from "../utils/middleware.js";
const courses = express.Router()
const courseImage = initializeMulter(path.resolve('./uploads/courseImage'))


courses.route("/")
    .get(allcourses)
    .post(courseImage.fields([{ name: 'courseImage', maxCount: 1 }]), addCourse)

courses.route("/assign/:id")
    .get(AdminAccess, getLearnerToAssignCourse)
    .post(AdminAccess, assignCourse)

courses.route("/detail/:id")
    .get( getCourseDetail)
    .post(AdminAccess, addChapter)
    .patch(AdminAccess,editCourse)
    .delete(AdminAccess,deleteCourse)

courses.route("/detail/:courseId/:chapterId")
    .delete(AdminAccess, deleteChapter)



courses.route("/watch/:courseId/chapter/:chapterId")
    .post(trackCourseProgress)


courses.route("/enrollments")
    .get(enrolledCourse)




export default courses