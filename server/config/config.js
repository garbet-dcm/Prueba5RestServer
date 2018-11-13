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

//Caducidad del token
//60 s/m *60m/h*24h/dias*30dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//Secret de autentificación de token
process.env.SECRET = 'secret';

//Google Claim ID
process.env.CLIENT_ID = process.env.CLIENT_ID || '437244290951-ke9q8dfi2qb3kfjk3k63sobf5k8eqqmb.apps.googleusercontent.com';