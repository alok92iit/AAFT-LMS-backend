import multer from "multer";
import fs from "fs";
import { currentTimeStamp } from "./utils/common.js";
import path from 'path';
const storage = (folderName) => {
    try {
        const normalizedFolder = path.resolve(folderName);
        if (!fs.existsSync(normalizedFolder)) {
            fs.mkdirSync(normalizedFolder, { recursive: true });
        }
    } catch (err) {
        console.log("folder creation error =", err);
    }
    return multer.diskStorage({
        destination: (req, file, cb) => {
            // console.log("filename",folderName)
            // const normalizedFolder = path.resolve(folderName);
            cb(null, folderName);
        },
        filename: (req, file, cb) => {
            // Customize filename if needed
            // console.log("mvnsjknlcvnschjkjncskjdbvckjsdvjbdfkjvnsdkjfbvhjdf v",file.originalname.split(".")[1])
            // console.log("mvnsjknlcvnschjkjncskjdbvckjsdvjbdfkjvnsdkjfbvhjdf v",)
            // cb(null, file.originalname);
            cb(null, currentTimeStamp() + '.' + file.originalname.split(".")[1]);
        }
    });
};

const initializeMulter = (destination) => multer({ storage: storage(destination) });

export default initializeMulter;
