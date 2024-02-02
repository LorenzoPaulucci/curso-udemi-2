const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publication");
const middleware = require("../middlewares/auth");
const multer = require("multer");
// configuracion de subida de archivos (middleware)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications/")
    },
    filename: (req, file, cb) => {
        cb(null, `pub-${Date.now()}-${file.originalname}`)
    }
});
const uploads = multer({storage});

router.post("/save", middleware.auth, PublicationController.save)
router.get("/detail/:id", middleware.auth, PublicationController.detail)
router.delete("/remove/:id", middleware.auth, PublicationController.remove)
router.get("/user/:nick", middleware.auth, PublicationController.user)
router.post("/upload/:id", [middleware.auth, uploads.single("file0")], PublicationController.upload)
router.get("/media/:file", PublicationController.media)
router.get("/feed", middleware.auth, PublicationController.feed)

module.exports = router;