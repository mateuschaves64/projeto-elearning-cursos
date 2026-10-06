// Aqui fazemos a comunicação com o servidor nodemon
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Importação das Rotas
import authRoutes from './src/routes/authRoutes.js';
import courseRoutes from './src/routes/courseRoutes.js';
import classRoutes from './src/routes/classRoutes.js';
import enrollmentRoutes from './src/routes/enrollmentRoutes.js';
import gradeRoutes from './src/routes/gradeRoutes.js';
import certificateRoutes from './src/routes/certificateRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Verificação do funcionamento da API
app.get('/', (req, res) => {
  return res.status(200).json({ message: "API E-learning rodando com sucesso" });
});

// Utilização das Rotas
app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/classes', classRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/grades', gradeRoutes);
app.use('/certificates', certificateRoutes);

// Servidor Iniciado
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}/`);
});
