import express from "express"
import { courseController, studentReport } from "../controller/report.controller.js"

const report=express.Router()


report.route("/course")
    .get(courseController)

report.route("/student")
    .get(studentReport)


export default report