const { Router } = require('express');
const carrinhoService = require('../services/carrinhoService');
const autenticacao = require('../middlewares/autenticacao');

const router = Router();
router.use(autenticacao);

// GET /api/carrinho?formaPagamento=dinheiro  -> mostra o resumo já com desconto/portes
router.get('/', (req, res) => {
  res.json(carrinhoService.resumo(req.usuario.id, req.query.formaPagamento || 'cartao'));
});

router.post('/itens', (req, res) => {
  res.status(201).json(carrinhoService.adicionarItem(req.usuario.id, req.body));
});

router.put('/itens/:produtoId', (req, res) => {
  res.json(carrinhoService.atualizarItem(req.usuario.id, req.params.produtoId, req.body));
});

router.delete('/itens/:produtoId', (req, res) => {
  res.json(carrinhoService.removerItem(req.usuario.id, req.params.produtoId));
});

module.exports = router;
