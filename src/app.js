const path = require('path');
const fs = require('fs');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');

const authRoutes = require('./routes/authRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const carrinhoRoutes = require('./routes/carrinhoRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const tratarErros = require('./middlewares/erros');

const app = express();
app.use(express.json());

// Documentação da API (Swagger)
const caminhoYaml = path.join(__dirname, '..', 'docs', 'swagger.yaml');
const swaggerDocument = YAML.parse(fs.readFileSync(caminhoYaml, 'utf8'));
app.get('/api-docs/swagger.yaml', (req, res) => res.type('text/yaml').sendFile(caminhoYaml));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API REST
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/carrinho', carrinhoRoutes);
app.use('/api', checkoutRoutes);
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// Site (páginas estáticas)
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(tratarErros);

module.exports = app;
