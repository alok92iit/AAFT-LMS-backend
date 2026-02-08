import express from "express"
import { allUsers, dashboard, deleteUser } from "../controller/users.js"
import { AdminAccess } from "../utils/middleware.js"
const users=express.Router()


users.route("/")
    .get(allUsers)

users.route("/:id")
        .delete(AdminAccess,deleteUser)

users.route("/dashboard")
    .get(dashboard)


export default users