const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const middleware = require("../middlewares/auth");
const multer = require("multer");
// configuracion de subida de archivos (middleware)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb) => {
        cb(null, `avatar-${Date.now()}-${file.originalname}`)
    }

});
const uploads = multer({storage});

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", middleware.auth, UserController.profile);
router.get("/list/:page?", middleware.auth, UserController.list);
router.put("/update", middleware.auth, UserController.update);
router.post("/upload", [middleware.auth, uploads.single("file0")], UserController.upload);
router.get("/avatar/:file", UserController.avatar);
router.get("/counters/:nick?", middleware.auth, UserController.counters);



module.exports = router;