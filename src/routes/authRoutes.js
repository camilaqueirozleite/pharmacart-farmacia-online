const { Router } = require('express');
const authService = require('../services/authService');
const autenticacao = require('../middlewares/autenticacao');

const router = Router();

router.post('/registo', (req, res) => {
  res.status(201).json(authService.registar(req.body));
});

router.post('/login', (req, res) => {
  res.status(200).json(authService.login(req.body));
});

router.get('/me', autenticacao, (req, res) => {
  res.json(authService.usuarioPublico(req.usuario));
});

router.post('/logout', autenticacao, (req, res) => {
  authService.logout(req.token);
  res.status(204).end();
});

module.exports = router;
