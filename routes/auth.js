import express from "express"
import { loginController, registerUser } from "../controller/auth.js"
const auth =express.Router()


auth.route('/login')
        .post(loginController)
auth.route('/register')
        .post(registerUser)


export default auth