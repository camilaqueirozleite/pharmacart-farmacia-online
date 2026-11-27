const { Router } = require('express');
const checkoutService = require('../services/checkoutService');
const autenticacao = require('../middlewares/autenticacao');

const router = Router();

// A autenticação é aplicada rota a rota: este router está montado em /api
// e um router.use(autenticacao) bloquearia também rotas inexistentes (401 em vez de 404).
router.post('/checkout', autenticacao, (req, res) => {
  res.status(201).json(checkoutService.finalizar(req.usuario.id, req.body));
});

router.get('/pedidos', autenticacao, (req, res) => {
  res.json(checkoutService.listarPedidos(req.usuario.id));
});

module.exports = router;
