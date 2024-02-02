const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt")
const mongoosePagination = require("mongoose-pagination")
const fs = require("fs")
const path = require("path") // libreria de node
const Publicacion = require("../models/publication")
const Follow = require("../models/follows")

const register = (req, res) => {

    let params = req.body;

    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.json({
            status: "error",
            message: "Datos incompletos"
        })
    }

    // control de usuarios duplicados 
    User.find({
        $or: [
            { email: params.email.toLowerCase() }, // en email estan los emails que hay en la bd y lo compara con el email que mandamos por parametro
            { nick: params.nick.toLowerCase() }
        ]
    })
        .then(async (user) => {  // si el email o el nick coinciden con alguno que este en la bd entonces user va a contener el ususario de la bd. si no se cumple el or, user va a estar vacio
            console.log(user)
            if (user.length >= 1) {
                return res.status(401).send({
                    status: "error",
                    mensaje: "El usuario ya existe"
                })
            }

            let pwd = await bcrypt.hash(params.password, 10)
            params.password = pwd;


            //guardar usuario en bd
            try {
                let user_to_save = new User(params);
                await user_to_save.save();
                return res.json({
                    status: "success",
                    message: "Registro completado exitosamente",
                    user_to_save
                })
            } catch (err) {
                return res.status(500).json({
                    status: "error",
                    mensaje: "Ha ocurrido un error al guardar el usuario",
                    error: err.message
                })
            }

        })
        .catch((err) => {
            return res.status(500).json({
                status: "error",
                mensaje: "Ha ocurrido un error",
                error: err.message,
            });
        })
}

const login = (req, res) => {
    let params = req.body

    if (!params.email || !params.password) {
        return res.json({
            status: "error",
            mensaje: "Faltan datos por enviar"
        });
    }

    User.findOne({ email: params.email })
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: "error",
                    mensaje: "email no encontrado"
                });
            }
            // validar contraseña 
            let pwd = bcrypt.compareSync(params.password, user.password)
            if (!pwd) {
                return res.status(401).json({
                    status: "error",
                    mensaje: "contraseña incorrecta"
                });
            }

            token = jwt.createToken(user)

            return res.status(200).send({
                status: "success",
                mensaje: "logeado correctamente",
                user: {
                    name: user.name,
                    nick: user.nick,
                    id: user._id
                },
                token
            })
        })
        .catch((err) => {
            return res.status(500).json({
                status: "error",
                mensaje: "Ha ocurrido un error",
                error: err.message,
            });
        })
}

const profile = (req, res) => {
    const id = req.params.id;

    User.findById(id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: "error",
                    mensaje: "el usuario no existe"
                });
            }
            return res.status(200).json({
                status: "succes",
                user: user
            });
        })
        .catch((err) => {
            return res.status(500).json({
                status: "error",
                mensaje: "hay un error",
                error: err.message
            });
        })
}

const list = (req, res) => {
    let page = 1;

    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    let itemsPerPage = 5;

    User.find().sort("_id").paginate(page, itemsPerPage)
        .then(async (user) => {
            if (!user) {
                return res.status(404).json({
                    status: "error",
                    mensaje: "el usuario no existe"
                });
            }
            const totalUsers = await User.countDocuments({}).exec();
            return res.status(200).json({
                status: "succes",
                user: user,
                page,
                itemsPerPage,
                totalUsers: totalUsers,
                totalPages: Math.ceil(totalUsers / itemsPerPage)
            });
        })
        .catch((err) => {
            return res.status(500).json({
                status: "error",
                mensaje: "hay un error",
                error: err.message
            });
        })

}

const update = async (req, res) => {
    try {
        let userId = req.user.id;
        let paramsToUpdate = req.body;

        const existingUser = await User.find({
            $or: [
                { email: paramsToUpdate.email?.toLowerCase() }, // el ? sirve para que si paramsToUpdate.email o paramsToUpdate.nick es igual a undefined no se acciona .toLowerCase() siemplemente para que no se genere un error
                { nick: paramsToUpdate.nick?.toLowerCase() }
            ]
        })
        if (existingUser.length > 0) {
            return res.status(401).send({
                status: "error",
                mensaje: "El email o el nick estan en uso"
            })
        }


        if (paramsToUpdate.password) {
            let pwd = await bcrypt.hash(paramsToUpdate.password, 10)
            paramsToUpdate.password = pwd;
        }else{
            delete paramsToUpdate.password;
        }
        const userUpdate = await User.findByIdAndUpdate(userId, paramsToUpdate, { new: true })

        if (!userUpdate) {
            return res.status(400).json({
                status: "error",
                mensaje: "usuario no encontrado"
            });
        }
        return res.status(200).json({
            status: "succes",
            mensaje: "usuario actualizado",
            userUpdate,
        });

    } catch (err) {
        return res.status(500).json({
            status: "error",
            mensaje: "Error al actualizar el usuario",
            error: err.message,
        });
    }
}

const upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(404).json({
                status: "error",
                mensaje: "peticion no incluye imagen"
            });
        }

        const image = req.file.originalname;
        const imageSplit = image.split(".");
        const extencion = imageSplit[1]

        if (extencion == "jpg" || extencion == "png" || extencion == "svg") {

            const userUpdate = await User.findByIdAndUpdate(req.user.id, { image: req.file.filename }, { new: true })
            if(!userUpdate){
                return res.status(400).json({
                    status: "error",
                    mensaje: "error en la subida de imagen"
                });
            }
            return res.status(200).json({
                status: "success",
                file: req.file,
            });
        }
        else {
            fs.unlink(req.file.path, (error) => {
                return res.status(400).json({
                    status: "error",
                    mensaje: "archivo invalido (solo imagenes)"
                })
            })

        }
    } catch (err) {
        return res.status(500).json({
            status: "error",
            error: err.message
        })
    }
}

const avatar = (req,res) =>{
    const file = req.params.file;
    const filePath = `./uploads/avatars/${file}`;

    // comprobar si existe el avatar
    fs.stat(filePath, (err, exists) =>{
        if(!exists){
            return res.status(404).json({
                status: "error",
                mensaje: "no existe el avatar"
            })
        }
        return res.sendFile(path.resolve(filePath))
    })
}

const counters = async(req,res) => { 
    userNick = req.user.nick
    if(req.params.nick) userNick = req.params.nick;

    try{
        const followed = await Follow.countDocuments({"user": userNick})
        const followers = await Follow.countDocuments({"followed": userNick})
        const publications = await Publicacion.countDocuments({"user": userNick})

        return res.status(200).json({
            status: "success",
            userNick,followed,followers,publications
        });
    }
    catch(err){
        return res.status(500).json({
            status: "error",
            error: err.message
        })
    }
}

module.exports = {
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}