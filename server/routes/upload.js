const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Ningun archivo seleccionado.'
            }
        });
    }

    let tiposValidos = ['productos', 'usuarios'];
    if( tiposValidos.indexOf( tipo ) < 0 ) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos validas son: ' + tiposValidos.join(', ')+'.',
                tipo: tipo
            }
        });
    }

    let archivo = req.files.archivo;
    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length - 1];
    let extensionsValidas = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];

    if(extensionsValidas.indexOf(extension) < 0 ){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones validas son: ' + extensionsValidas.join(', ')+'.',
                ext: extension
            }
        });
    }

    let nombreArch = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    archivo.mv(`uploads/${ tipo }/${ nombreArch }`, (err) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
    
        // Actualizar Imagen del Usuario o el Producto
        if ( tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArch);
        } else {
            imagenProducto(id, res, nombreArch);
        }
        
    });
});

function imagenUsuario(id, res, nombreArch) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo('usuarios', nombreArch );
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB){
            borrarArchivo('usuarios', nombreArch );
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe.'
                }
            });
        }
        
        borrarArchivo('usuarios', usuarioDB.img );

        usuarioDB.img = nombreArch;
        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArch
            });
        });

    })
}


function imagenProducto(id, res, nombreArch) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo('productos', nombreArch );
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB){
            borrarArchivo('productos', nombreArch );
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe.'
                }
            });
        }
        
        borrarArchivo('productos', productoDB.img );

        productoDB.img = nombreArch;
        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArch
            });
        });
    });
}

function borrarArchivo(tipo, imagenTipo) {
    let pathUrl = path.resolve(__dirname, `../../uploads/${ tipo }/${ imagenTipo }`);
    if( fs.existsSync(pathUrl)) {
        // Borrar imagen del path
        fs.unlinkSync(pathUrl);
    }
}

module.exports = app;