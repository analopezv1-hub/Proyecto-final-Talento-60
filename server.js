require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');   

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

// Modelo de usuario
const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

// REGISTRO
app.post('/registro', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await Usuario.create({ email, password: hash });
    res.status(201).json({ mensaje: 'Usuario creado' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const coincide = await bcrypt.compare(password, usuario.password);
  if (!coincide) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// Middleware para proteger rutas
function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No autorizado' });

  try {
    req.usuario = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// RUTA PROTEGIDA
app.get('/perfil', verificarToken, async (req, res) => {
  const usuario = await Usuario.findById(req.usuario.id).select('-password');
  res.json(usuario);
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
