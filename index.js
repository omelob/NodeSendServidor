const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');

// crear el servidor
const app = express();

// ejecutar el middleware auth
//app.use( auth );

// conectar a la db
conectarDB();

// habilitar el cors
//console.log(process.env.FRONTEND_URL);
const opcionesCors = {
    origin: process.env.FRONTEND_URL
}
app.use( cors(opcionesCors) );

//console.log('Comenzando Node Send');

// puerto de la app
const PORT = process.env.PORT || 4000;

// habilitar leer los valores de un body
app.use( express.json() );

// habilitar la carpeta publica
app.use( express.static('uploads') );

// rutas de la app
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/enlaces', require('./routes/enlaces'));
app.use('/api/archivos', require('./routes/archivos'));

// arrancar el servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is up and running at port ${PORT}`);
});