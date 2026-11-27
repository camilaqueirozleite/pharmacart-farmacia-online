const { Router } = require('express');
const { db } = require('../database/memoryDb');
const AppError = require('../utils/AppError');

const router = Router();

router.get('/', (req, res) => {
  res.json(db.produtos.find());
});

router.get('/:id', (req, res) => {
  const produto = db.produtos.findOne({ id: Number(req.params.id) });
  if (!produto) throw new AppError(404, 'Produto não encontrado.');
  res.json(produto);
});

module.exports = router;
