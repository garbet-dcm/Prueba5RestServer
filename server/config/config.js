//PUERTO
process.env.PORT = process.env.PORT || 3000; //Ponemos por defecto el 3000

//ENTORNO
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'; //Por defecto estamos en desarrollo

//BASE DE DATOS
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //usuario = cafe-user
    //password = p12345
    urlDB = 'mongodb://cafe-user:p12345@ds159073.mlab.com:59073/cafe';
}

//Creamos un nuevo procces.env
process.env.urlDB = urlDB;