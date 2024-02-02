const Follow = require("../models/follows");
const User = require("../models/user");

const save = async (req, res) => {

    const params = req.body;
    const identity = req.user;

    let verification = await Follow.findOne({ user: identity.nick, followed: params.followed });
    console.log(verification)
    if (verification) {
        return res.status(400).json({
            status: "error",
            menssage: "ya sigues este usuario"
        });
    }

    const nick_followed = await User.findOne({ nick: params.followed })
    if (!nick_followed) {
        return res.status(400).json({
            status: "error",
            menssage: "usuario no encontrado"
        });
    } else {
        let userToFollow = new Follow({
            user: identity.nick,
            followed: params.followed
        })
        try {
            const save = await userToFollow.save()
            if (!save) {
                return res.status(400).json({
                    status: "error",
                    menssage: "error en el guardado"
                });
            }
            return res.status(200).json({
                status: "success",
                userToFollow
            });
        } catch (err) {
            return res.status(500).json({
                status: "error",
                error: err.message
            });
        }
    }
}

const unfollow = async (req, res) => {
    const params = req.body;
    const identity = req.user;
    try {
        const userToUnfollow = await Follow.findOneAndDelete({ user: identity.nick, followed: params.unfollow });
        if (!userToUnfollow) {
            return res.status(400).json({
                status: "error",
                menssage: "usuario no encontrado"
            });
        } else {
            return res.status(200).json({
                status: "success",
                userToUnfollow
            });
        }
    } catch (err) {
        return res.status(500).json({
            status: "error",
            error: err.message
        });
    }
}

const following = async (req, res) => {
    
    let arrayFollows = []

    let userNick = req.user.nick;
    if (req.params.nick) userNick = req.params.nick;

    try {
        const usersToFollow = await Follow.find({ user: userNick })

        if (!usersToFollow) {
            return res.status(400).json({
                status: "error",
                menssage: "no sigues a nadie"
            });
        }else{
            console.log(usersToFollow.length)
            for(let i = 0; i < usersToFollow.length; i++){
                arrayFollows.push(usersToFollow[i].followed) 
            }

            return res.status(200).json({
                status: "success",
                user: userNick,
                following : arrayFollows
            });
        }

    } catch (err) {
        return res.status(500).json({
            status: "error",
            error: err.message
        });
    }
}
const followers = async(req, res) => {
    let arrayFollowers = []

    let userNick = req.user.nick;
    if (req.params.nick) userNick = req.params.nick;

    try {
        const followers = await Follow.find({ followed: userNick })

        if (!followers) {
            return res.status(400).json({
                status: "error",
                menssage: "no sigues a nadie"
            });
        }else{
            console.log(followers.length)
            for(let i = 0; i < followers.length; i++){
                arrayFollowers.push(followers[i].user) 
            }

            return res.status(200).json({
                status: "success",
                user: userNick,
                following : arrayFollowers
            });
        }

    } catch (err) {
        return res.status(500).json({
            status: "error",
            error: err.message
        });
    }
}

module.exports = {
    save, unfollow, followers, following
}