
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { config } from "dotenv"
if (process.env.NODE_ENV !== "production") {
  config();
}
import User from './models/User.js';
import mongoose from "mongoose";
console.log("csjcsdlnc vndfv===",process.env.JWT_SECRET)
const passportConfig = async (passport) => {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  console.log("dlewmclkmferklcmvflevr====",opts.jwtFromRequest)
  opts.secretOrKey = process.env.JWT_SECRET;
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // console.log("Fewfkpewokfp=",jwt_payload)
        const userQuery=[
          {
            '$match': {
              '_id': new mongoose.Types.ObjectId(jwt_payload.id)
            }
          }
        ]
        const user = await User.aggregate(userQuery)
        // const user = await User.findById(jwt_payload.id).populate({ path: "role", select: "role position" }).populate('brandId');
        if (user.length) {
          // let newUser={...user}
          // console.log("user.roleuser.rol=",user)
          // const role = await getRoleId(user?.brandId.role || "USER", null, null);
          // console.log("role role role ==",role)
          // newUser.role=role
          
          // console.log("user.roleuser.rol=",newUser)

          return done(null, user[0]);
        } else {
          return done(null, false);
        }
      } catch (err) {
        console.log("nhbjgfcdcfgvjhbjnmk",err)
        return done(err, false);
      }
    })
  );
};

export default passportConfig;