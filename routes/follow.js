const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow");
const middleware = require("../middlewares/auth");

router.post("/save", middleware.auth, FollowController.save);
router.delete("/unfollow", middleware.auth, FollowController.unfollow);
router.get("/following/:nick?/:page?", middleware.auth, FollowController.following);
router.get("/followers/:nick?/:page?", middleware.auth, FollowController.followers);



module.exports = router;