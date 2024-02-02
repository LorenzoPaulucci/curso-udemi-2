const {connection} = require("./database/connection");
const express = require("express");
const cors = require("cors");
 
//conexion a bd
connection(); 
//crear servidor node
const app = express();
const puerto = 3900;
//configurar cors en un moddleware
app.use(cors());
//convertir los datos del body a json
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//cargar rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);

//poner servidor a escuchar peticiones http
app.listen(puerto, ()=>{
    console.log(`servidor conectado en puerto ${puerto}`)
})

