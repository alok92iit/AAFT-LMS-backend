import { toDate } from "date-fns-tz";
import mongoose from "mongoose";
import passport from "passport";

export const dbConfig = async () => {
  await mongoose.connect(process.env.DB).then(() => {
    console.log("Db is connected");
    // deleteReocrd("courses",{"courseId":new ObjectId("67b03f8fc5272f45bc5827de")})
  });
};

export const checkToken = passport.authenticate('jwt', { session: false });
export const currentTimeStamp = () => {

  const currentDateIndia = toDate(new Date(), { timeZone: 'Asia/Kolkata' });

  let currentTimeStampIndia = currentDateIndia.getTime();
  currentTimeStampIndia += (5.5 * 60 * 60 * 1000);
  return currentTimeStampIndia
}

export const convertTimeStampToDate = (timestamp) => {
  const date = new Date(timestamp);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};
