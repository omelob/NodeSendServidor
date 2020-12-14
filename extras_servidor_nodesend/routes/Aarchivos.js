const express = require('express');
const router = express.Router();
const archivosController = require('../controllers/archivosController');
const auth = require('../middleware/auth');
const multer = require('multer');

// subida de archivos
const upload = multer({ dest: './uploads/'})

router.post('/',
    upload.single('archivo'),
    archivosController.subirArchivo
);

router.delete('/:id',
    archivosController.eliminarArchivo
);

module.exports = router;