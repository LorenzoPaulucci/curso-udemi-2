const Publication = require("../models/publication");
const fs = require("fs")
const path = require("path")
const Follow = require("../models/follows")

const save = async (req, res) => {

    const params = req.body;
    if (!params.text) return res.status(400).send({ status: "error", message: "falta texto de la publicacion" });

    let newPublication = new Publication({
        user: req.user.nick,
        text: params.text
    });

    try {
        const save = await newPublication.save()
        if (!save) return res.status(400).send({ status: "error", message: "no se pudo guardar en la bd" });

        return res.status(200).send({ status: "success", message: "se ha guardado correctamente", newPublication });
    }
    catch (err) {
        return res.status(500).send({ status: "error", message: err.message });
    }
}

const detail = async (req, res) => {
    const publicacionId = req.params.id;

    try {
        let publication = await Publication.findById(publicacionId)
        if (!publication) return res.status(404).send({ status: "error", message: "No se encontro la publicacion" });
        return res.status(200).send({ status: "success", publication });
    }
    catch (err) {
        return res.status(500).send({ status: "error", message: err.message });
    }

}

const remove = async (req, res) => {
    const publicacionId = req.params.id;

    try {
        let publication = await Publication.findByIdAndDelete(publicacionId)
        if (!publication) return res.status(404).send({ status: "error", message: "No se encontro la publicacion a eliminar" });
        return res.status(200).send({ status: "success", publication });
    }
    catch (err) {
        return res.status(500).send({ status: "error", message: err.message });
    }

}

const user = async (req, res) => {
    const userNick = req.params.nick;
    try {
        const publications = await Publication.find({ user: userNick }).sort("-created_at")
        console.log(publications)
        if (publications.length === 0) return res.status(404).send({ status: "error", message: `No se encontro publicaciones de ${userNick}` });
        return res.status(200).send({ status: "success", publications });
    } catch (err) {
        return res.status(500).send({ status: "error", message: err.message });
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

        const publicationId = req.params.id;

        const image = req.file.originalname;
        const imageSplit = image.split(".");
        const extencion = imageSplit[1]

        if (extencion == "jpg" || extencion == "png" || extencion == "svg") {

            const PublicationUpdate = await Publication.findOneAndUpdate({ "user": req.user.nick, "_id": publicationId }, { file: req.file.filename }, { new: true })
            if (!PublicationUpdate) {
                return res.status(400).json({
                    status: "error",
                    mensaje: "error en la subida de imagen"
                });
            }
            return res.status(200).json({
                status: "success",
                publication: PublicationUpdate,
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

const media = (req, res) => {
    const file = req.params.file;
    const filePath = `./uploads/publications/${file}`;

    // comprobar si existe el archivo
    fs.stat(filePath, (err, exists) => {
        if (!exists) {
            return res.status(404).json({
                status: "error",
                mensaje: "no existe el avatar"
            })
        }
        return res.sendFile(path.resolve(filePath))
    })
}

const feed = async (req, res) => {
    let userNick = req.user.nick
    let arrayFollows = []

    try {
        const usersToFollow = await Follow.find({ user: userNick })
        if (!usersToFollow) return res.status(400).json({ status: "error", menssage: "no sigues a nadie" });
        
        for(let i = 0; i < usersToFollow.length; i++){
            arrayFollows.push(usersToFollow[i].followed) 
        }
    
        const publications = await Publication.find({user: arrayFollows});
        return res.status(200).send({ status: "success", publications });

    } 
    catch (err) {
        return res.status(500).json({ status: "error", error: err.message })
    }
}

module.exports = {
    save, detail, remove, user, upload, media, feed
}