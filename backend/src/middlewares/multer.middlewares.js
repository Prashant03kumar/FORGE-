import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("📂 Multer destination hit");
    cb(null, path.resolve("public/temp"));
  },
  filename: function (req, file, cb) {
    console.log("📝 Multer filename hit:", file.fieldname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage });

/*Multer is used to temporarily store uploaded files on the server, 
Cloudinary uploads them to cloud storage,
 and the local files are deleted to keep the server lightweight and scalable. */
