import Users from "../models/User.js";
import jwt from 'jsonwebtoken';
import { config } from "dotenv"
import { ObjectId } from "mongodb";
import { universalUpdate } from "../utils/dbOperation.js";
import { currentTimeStamp } from "../utils/common.js";
if (process.env.NODE_ENV !== "production") {
    config();
}
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

console.log("xnwkdnwekjfn", JWT_SECRET)
const generateTokens = (user) => {
    const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '300m' });
    const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

export const registerUser = async (req, res, next) => {
    try {
        const body = req.body


        body.role = "STUDENT"
        body.createdAt=currentTimeStamp()
        // const userRole=await getRoleId(null,body?.role,res)
        const newUser = new Users(req.body);
        await newUser.save()
        res.status(201).json({ msg: 'User created successfully' });
    } catch (err) {

        // console.log("mkjnhbgvfctdxcfgvhbjnlkm", err)
        if (err.code === 11000) {
            res.status(400).json({ msg: 'Email already exists' });
        } else {
            if (err.name === "ValidationError") {
                const errors = Object.values(err.errors).map(e => e.message);
                return res.status(400).json({

                    msg: `this are required field ${errors}`,

                });
            }
        }
    }
}


    export const loginController = async (req, res, next) => {
        const { email, password } = req.body;
        console.log("njhbgvcfdxzsfxdcghjbmkl,", req.body)
        const userAggr = [
            {
                '$match': {
                    'email': {
                        '$regex': email,
                        '$options': 'i'
                    }
                }
            },

        ];
        // console.log("lkjbhgvcfytdxfyghjkl;,",JSON.stringify(userAggr))
        Users.aggregate(userAggr)
            .then(users => {
                // console.log("users users======",users)
                if (!users || users.length === 0) {
                    return res.status(404).json({ msg: 'User not found' });
                }
                let user = users[0] // Get the first user from the array
                // console.log("password == user.password",password ,"==", user.password)
                if (password == user.password) {
                    // const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: '168h' });
                    const token = generateTokens(user)
                    // User.refreshToken=token.refreshToken
                    let refreshToken = token.refreshToken
                   
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        secure: true, // Use true if you're on HTTPS (production)
                        sameSite: 'None',
                        // sameSite: 'Strict',
                        path: '/',
                        // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    });
                    res.setHeader("Authorization", "Bearer " + token.accessToken);
                    res.json({ token: 'Bearer ' + token.accessToken, "user": user, refreshToken });
                }
                else {
                    // console.log("mljbhgfchjblkmnbjhcgfhvgbjhknbhvjghcfx")
                    res.status(401).json({ msg: 'Incorrect password' });
                }
                // comparePassword(user,password, (err, isMatch) => {
                //     if (err) throw err;
                //     if (isMatch) {
                //         const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: '24h' });
                //         res.json({ token: 'Bearer ' + token, "user": user });
                //     } else {
                //         res.status(401).json({ msg: 'Incorrect password' });
                //     }
                // });
            })
        // .catch(err => res.status(400).json({ msg: err.message }));
    }