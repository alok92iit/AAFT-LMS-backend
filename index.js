import { config } from "dotenv"
if (process.env.NODE_ENV !== "production") {
  config();
}
import express from "express";
import routes from "./routes/index.js";
import cors from "cors"
import { dbConfig } from "./utils/common.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import passportConfig from "./passportConfig.js";

dbConfig().catch((err) => console.log("the error=", err));
const app = express()
app.use(cors({ credentials: true,origin:["superb-bonbon-c7b514.netlify.app","http://127.0.0.1:8080", "http://192.168.56.1:8080", "http://localhost:8080", "http://172.28.240.1:8080", "http://192.168.1.46:8080",]}));

app.use(passport.initialize());
passportConfig(passport);
app.use(express.json({ limit: '700mb' }));
app.use(cookieParser());
app.use(
 "/uploads",
  cors(),
  express.static("uploads", {
    setHeaders: (res, path, stat) => {
      res.set("Access-Control-Allow-Origin", "*");
    },
  })
);
app.use('/api',routes)

app.listen(process.env.PORT, () => {
  console.log(`server runing on port ${process.env.PORT}`)
})
