/** Converte qualquer erro numa resposta JSON { erro: "mensagem" }. */
// eslint-disable-next-line no-unused-vars
function tratarErros(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo do pedido.' });
  }
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ erro: err.message });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = tratarErros;
