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
  nombre: { type: String, trim: true, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['candidato', 'empresa'], default: 'candidato' },
  creado: { type: Date, default: Date.now }
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

// REGISTRO
app.post('/registro', async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'El correo no es válido' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  if (rol && !['candidato', 'empresa'].includes(rol)) {
    return res.status(400).json({ error: 'Rol no válido' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await Usuario.create({ nombre, email, password: hash, rol });
    res.status(201).json({ mensaje: 'Usuario creado' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Ese correo ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const coincide = await bcrypt.compare(password, usuario.password);
  if (!coincide) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({
    token,
    usuario: { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
  });
});

// Middleware: exige estar logueado
function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    req.usuario = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o vencido' });
  }
}

// RUTA PROTEGIDA
app.get('/perfil', verificarToken, async (req, res) => {
  const usuario = await Usuario.findById(req.usuario.id).select('-password');
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(usuario);
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
