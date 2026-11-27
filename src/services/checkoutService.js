const { db } = require('../database/memoryDb');
const AppError = require('../utils/AppError');
const carrinhoService = require('./carrinhoService');
const { REGEX_RECEITA, LIMIAR_VIP } = require('./regras');

/**
 * Finaliza a compra do carrinho do utilizador.
 * Volta a validar stock e limite (o stock pode ter mudado desde que o item foi adicionado),
 * exige receita quando há MSRM, abate o stock, regista o pedido e atualiza o total gasto.
 */
function finalizar(usuarioId, { formaPagamento, numeroReceita } = {}) {
  if (!formaPagamento) throw new AppError(400, 'A forma de pagamento é obrigatória.');

  const resumo = carrinhoService.resumo(usuarioId, formaPagamento);
  if (resumo.itens.length === 0) throw new AppError(422, 'O carrinho está vazio.');

  // Regra 4: MSRM só com receita válida.
  if (resumo.exigeReceita) {
    if (!numeroReceita) {
      throw new AppError(
        422,
        'Este pedido contém medicamentos sujeitos a receita médica (MSRM). Indique o número da receita.'
      );
    }
    if (!REGEX_RECEITA.test(String(numeroReceita))) {
      throw new AppError(422, 'Número de receita inválido: deve ter exatamente 19 dígitos.');
    }
  }

  // Regras 2 e 5 revalidadas no momento da compra.
  resumo.itens.forEach((item) => {
    const produto = db.produtos.findOne({ id: item.produtoId });
    carrinhoService.validarQuantidadeFinal(produto, item.quantidade);
  });

  resumo.itens.forEach((item) => {
    const produto = db.produtos.findOne({ id: item.produtoId });
    db.produtos.updateOne({ id: produto.id }, { stock: produto.stock - item.quantidade });
  });

  const usuario = db.usuarios.findOne({ id: usuarioId });
  const novoTotalGasto = Number((usuario.totalGasto + resumo.total).toFixed(2));
  db.usuarios.updateOne({ id: usuarioId }, { totalGasto: novoTotalGasto });

  const pedido = db.pedidos.insertOne({
    usuarioId,
    criadoEm: new Date().toISOString(),
    estado: 'confirmado',
    ...resumo,
    numeroReceita: resumo.exigeReceita ? String(numeroReceita) : null
  });

  carrinhoService.esvaziar(usuarioId);

  return {
    ...pedido,
    tornouSeVip: !resumo.clienteVip && novoTotalGasto >= LIMIAR_VIP
  };
}

function listarPedidos(usuarioId) {
  return db.pedidos.find({ usuarioId });
}

module.exports = { finalizar, listarPedidos };
