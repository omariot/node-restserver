const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
const Usuario = require('../models/usuario');
const app = express();

//Routes
/**
* @swagger
* definitions:
*   Login:
*     required:
*       - username
*       - password
*     properties:
*       username:
*         type: string
*       password:
*         type: string
*       path:
*         type: string
*/

/**
* @swagger
* tags:
*   name: Users
*   description: User management and login
*/

/**
* @swagger
* tags:
*   - name: Login
*     description: Login
*   - name: Accounts
*     description: Accounts
*/

/**
* @swagger 
* /login:
*  post:
*      description: Login
*      produces:
*          - application/json
*      tags: [Login, Users]
*      parameters:
*        - name: username
*          description: Nombre de la persona.
*          in: body
*          required: true
*          type: string
*        - password:  password
*          description: Contraseña.
*          in: body
*          required: true
*          type: string
*      responses:
*          '200': 
*              description: A success response.
*/
app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne( { email: body.email }, (err, usuarioDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

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


// Google Config
async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    console.log(payload.name);
    console.log(payload.email);
    console.log(payload.picture);
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }
  

/**
 * @swagger 
 * /google:
 *  post:
 *      description: Google Login
 *      produces:
 *          - application/json
 *      parameters:
 *        - name: idtoken
 *          description: id del Token de Google.
 *          in: body
 *          required: true
 *          type: string
 *      responses:
 *          '200': 
 *              description: A success response.
 */  
app.post('/google', async (req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token)
    .catch( e => {
        return res.status(403).json({
            ok: false,
            err: e
        });
    });
    
    Usuario.findOne( { email: googleUser.email}, (err, usuarioDb) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };
        if(usuarioDb){
            if (usuarioDb.google === false ) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su autenticacion normal.'
                    }
                });
            } else {
                let token = jwt.sign({ usuario: usuarioDb }, process.env.SEED, { expiresIn: process.env.EXPIRE_TOKEN } );

                return res.json({
                    ok: true,
                    usuario: usuarioDb,
                    token
                });
            }
        } else {
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save( (err, usuarioDb) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };
                
                let token = jwt.sign({ usuario: usuarioDb }, process.env.SEED, { expiresIn: process.env.EXPIRE_TOKEN } );

                return res.json({
                    ok: true,
                    usuario: usuarioDb,
                    token
                });
            })
        }
    });
});

module.exports = app;