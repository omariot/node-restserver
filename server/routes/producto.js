const express = require('express');
const jwt = require('jsonwebtoken');
const _ = require('underscore');
let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
let app = express();

let Producto = require('../models/producto');

// Get All
app.get('/productos', verificaToken, (req, res) => {
    let desde = req.query.desde || 0; 
    desde = Number(desde);

    let limite = req.query.limite || 5; 
    limite = Number(limite);

    Producto.find({ disponible: true })
    .skip(desde)
    .limit(limite)
    .sort('nombre')
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec( (err, productos) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Producto.countDocuments({ disponible: true }, (err, conteo) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos,
                cuantos: conteo
            });
        })
   });
});

// Get by ID
app.get('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById({ _id: id, disponible: true } )
    .sort('nombre')
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec( (err, productos) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if( !productos) {
            return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no existe.'
                    }
                });
        }

         res.json({
                ok: true,
                producto: productos
            });
        });
   });

// Buscar
app.get('/productos/buscar/:condicion', verificaToken, (req, res) => {
    let condicion = req.params.condicion;
    
    let regex = new RegExp(condicion, 'i');

    Producto.find({ nombre: regex})
        .populate('categoria', 'descripcion')
        .exec( (err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});

// Create
app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;
    
    let producto= new Producto({
          nombre: body.nombre,
          precioUni: body.precioUni,
          descripcion: body.descripcion,
          disponible: true,
          categoria: body.categoria,
          usuario: req.usuario._id
      });  

      producto.save((err, productoDB) => {
          if (err) {
              return res.status(400).json({
                  ok: false,
                  err
              });
          }
          
          return res.status(201).json({
              ok: true,
              productoDB
          });
      });
});

// Update
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

      Producto.findById(id, body, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe.'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });
        });
                 
      });

});

// Delete
app.delete('/productos/:id', [verificaToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;
    let newDisponible = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, newDisponible, { new: true }, (err, productoBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            if ( !productoBorrado ) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            res.json({
                  ok: true,
                  producto: productoBorrado,
                  message: 'Producto borrado'
              });
        })
});


module.exports = app;