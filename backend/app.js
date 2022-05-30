// creation du projet vide pour demarrer le serveur node js
// +installation de express et mongoose dans le terminal
// lancement du serveur ci-dessous
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const http = require('http');
const app = express();
const path = require("path");
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
const config = require("./config");



mongoose.connect('mongodb+srv://' + config.user + ':' + config.password + '@cluster0.ws6gw.mongodb.net/?retryWrites=true&w=majority', function(err) {

        if (err) { throw err; }

    })
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connecté à Mongoose")
});
//Header pour contourner erreurs de CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

//Rendre la requete exploitable
app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);



module.exports = app;