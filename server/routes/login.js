const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne( { email: body.email }, (err, usuarioDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!usuarioDb) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o clave incorrecta.'
                }
            });
        };     

        if ( !bcrypt.compareSync( body.password, usuarioDb.password ) ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (clave) incorrecta.'
                }
            });
        }

        let token = jwt.sign({ usuario: usuarioDb }, process.env.SEED, { expiresIn: process.env.EXPIRE_TOKEN } );

        res.json({
            ok: true,
            usuarioDb,
            token
        });

    } );

});


module.exports = app;