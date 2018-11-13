const express = require('express')
const app = express()

//Rutas de pagina
app.use(require('./usuario'));
app.use(require('./login'));


module.exports = app;