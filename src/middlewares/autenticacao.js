const { usuarioPorToken } = require('../services/authService');

/** Exige o cabeçalho "Authorization: Bearer <token>" obtido no login. */
function autenticacao(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  const usuario = tipo === 'Bearer' ? usuarioPorToken(token) : null;

  if (!usuario) {
    return res.status(401).json({ erro: 'Autenticação necessária. Faça login e envie o token.' });
  }

  req.usuario = usuario;
  req.token = token;
  next();
}

module.exports = autenticacao;
