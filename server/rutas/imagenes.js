const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { verificaToken_Img } = require('../middlewares/autentificacion');

app.get('/imagen/:tipo/:img', verificaToken_Img, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    //Comprobar si existe imagen
    let imgPath = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    if (fs.existsSync(imgPath)) {
        res.sendFile(imgPath);
    } else {
        let noImgPath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImgPath);
    }
});


module.exports = app;