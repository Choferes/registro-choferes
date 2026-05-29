const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});

app.post('/api/registros', (req, res) => {
    const {
        nombre_apellido,
        cuit_chofer,
        celular,
        patente_chasis,
        patente_acoplado,
        destino,
        neto_cargar,
        transporte
    } = req.body;

    if (
        !nombre_apellido ||
        !cuit_chofer ||
        !celular ||
        !patente_chasis ||
        !patente_acoplado ||
        !neto_cargar ||
        !transporte
    ) {
        return res.status(400).json({
            mensaje: 'Complete todos los campos obligatorios'
        });
    }

    const sql = `
        INSERT INTO registros
        (
            nombre_apellido,
            cuit_chofer,
            celular,
            patente_chasis,
            patente_acoplado,
            destino,
            neto_cargar,
            transporte,
            fecha_registro,
            hora_registro
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURTIME())
    `;

    db.query(
        sql,
        [
            nombre_apellido,
            cuit_chofer,
            celular,
            patente_chasis,
            patente_acoplado,
            destino || '',
            neto_cargar,
            transporte
        ],
        (err, resultado) => {
            if (err) {
                console.log(err);

                return res.status(500).json({
                    mensaje: 'Error al guardar el registro'
                });
            }

            const ticketGenerado = resultado.insertId;

            res.json({
                mensaje: 'Registro guardado correctamente',
                ticket: ticketGenerado
            });
        }
    );
});

app.get('/api/balanza/registros', (req, res) => {
const sql = `
    SELECT 
        id,
        nombre_apellido,
        cuit_chofer,
        celular,
        patente_chasis,
        patente_acoplado,
        destino,
        neto_cargar,
        transporte,
        fecha_registro,
        hora_registro,
        estado
    FROM registros
    WHERE 
        fecha_registro = CURDATE()
        OR estado = 'PENDIENTE'
    ORDER BY fecha_registro ASC, hora_registro ASC
`;
    db.query(sql, (err, resultados) => {
        if (err) {
            console.log(err);

            return res.status(500).json({
                mensaje: 'Error al obtener registros'
            });
        }

        res.json(resultados);
    });
});

app.put('/api/registros/:id/estado', (req, res) => {
    const { id } = req.params;

    const sql = `
        UPDATE registros
        SET estado = 'INGRESADO AL SISTEMA'
        WHERE id = ?
    `;

    db.query(sql, [id], (err) => {
        if (err) {
            console.log(err);

            return res.status(500).json({
                mensaje: 'Error al actualizar estado'
            });
        }

        res.json({
            mensaje: 'Estado actualizado'
        });
    });
});

app.get('/api/logistica/registros', (req, res) => {
    const sql = `
        SELECT 
            id,
            nombre_apellido,
            cuit_chofer,
            celular,
            patente_chasis,
            patente_acoplado,
            destino,
            neto_cargar,
            transporte,
            fecha_registro,
            hora_registro,
            estado
        FROM registros
        ORDER BY fecha_registro DESC, hora_registro DESC
    `;

    db.query(sql, (err, resultados) => {
        if (err) {
            console.log(err);

            return res.status(500).json({
                mensaje: 'Error al obtener historial'
            });
        }

        res.json(resultados);
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});