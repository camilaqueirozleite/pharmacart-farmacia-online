const { db } = require('../database/memoryDb');
const AppError = require('../utils/AppError');
const {
  DESCONTO_DINHEIRO,
  LIMIAR_VIP,
  PORTES,
  MAX_EMBALAGENS_POR_PRODUTO,
  FORMAS_PAGAMENTO
} = require('./regras');

// Contas em cêntimos para evitar erros de arredondamento (0.1 + 0.2 !== 0.3).
const emCentimos = (euros) => Math.round(euros * 100);
const emEuros = (centimos) => Number((centimos / 100).toFixed(2));

function obterCarrinho(usuarioId) {
  return (
    db.carrinhos.findOne({ usuarioId }) || db.carrinhos.insertOne({ usuarioId, itens: [] })
  );
}

function validarQuantidade(quantidade) {
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    throw new AppError(400, 'A quantidade deve ser um número inteiro maior que zero.');
  }
}

function buscarProduto(produtoId) {
  const produto = db.produtos.findOne({ id: Number(produtoId) });
  if (!produto) throw new AppError(404, 'Produto não encontrado.');
  return produto;
}

/** Regras 2 e 5: verifica stock e limite de embalagens para a quantidade final no carrinho. */
function validarQuantidadeFinal(produto, quantidadeFinal) {
  if (produto.stock === 0) {
    throw new AppError(422, `${produto.nome} está esgotado e não pode ser adicionado ao carrinho.`);
  }
  if (quantidadeFinal > MAX_EMBALAGENS_POR_PRODUTO) {
    throw new AppError(
      422,
      `Limite de ${MAX_EMBALAGENS_POR_PRODUTO} embalagens por medicamento em cada compra.`
    );
  }
  if (quantidadeFinal > produto.stock) {
    throw new AppError(
      422,
      `Stock insuficiente para ${produto.nome}: apenas ${produto.stock} unidade(s) disponível(eis).`
    );
  }
}

function adicionarItem(usuarioId, { produtoId, quantidade = 1 } = {}) {
  validarQuantidade(quantidade);
  const produto = buscarProduto(produtoId);
  const carrinho = obterCarrinho(usuarioId);
  const existente = carrinho.itens.find((i) => i.produtoId === produto.id);
  const quantidadeFinal = (existente ? existente.quantidade : 0) + quantidade;

  validarQuantidadeFinal(produto, quantidadeFinal);

  if (existente) existente.quantidade = quantidadeFinal;
  else carrinho.itens.push({ produtoId: produto.id, quantidade });

  db.carrinhos.updateOne({ usuarioId }, { itens: carrinho.itens });
  return resumo(usuarioId);
}

function atualizarItem(usuarioId, produtoId, { quantidade } = {}) {
  validarQuantidade(quantidade);
  const produto = buscarProduto(produtoId);
  const carrinho = obterCarrinho(usuarioId);
  const item = carrinho.itens.find((i) => i.produtoId === produto.id);
  if (!item) throw new AppError(404, 'Este produto não está no carrinho.');

  validarQuantidadeFinal(produto, quantidade);
  item.quantidade = quantidade;
  db.carrinhos.updateOne({ usuarioId }, { itens: carrinho.itens });
  return resumo(usuarioId);
}

function removerItem(usuarioId, produtoId) {
  const carrinho = obterCarrinho(usuarioId);
  const itens = carrinho.itens.filter((i) => i.produtoId !== Number(produtoId));
  if (itens.length === carrinho.itens.length) {
    throw new AppError(404, 'Este produto não está no carrinho.');
  }
  db.carrinhos.updateOne({ usuarioId }, { itens });
  return resumo(usuarioId);
}

function esvaziar(usuarioId) {
  obterCarrinho(usuarioId);
  db.carrinhos.updateOne({ usuarioId }, { itens: [] });
}

/**
 * Calcula os valores do carrinho para uma forma de pagamento.
 * Regra 1: dinheiro => 10% de desconto só sobre os MNSRM.
 * Regra 3: cliente VIP (total gasto >= 300 €) não paga portes.
 * Regra 4: indica se o pedido exige número de receita (tem MSRM).
 */
function resumo(usuarioId, formaPagamento = 'cartao') {
  if (!FORMAS_PAGAMENTO.includes(formaPagamento)) {
    throw new AppError(
      400,
      `Forma de pagamento inválida. Use: ${FORMAS_PAGAMENTO.join(', ')}.`
    );
  }

  const usuario = db.usuarios.findOne({ id: usuarioId });
  const carrinho = obterCarrinho(usuarioId);

  const itens = carrinho.itens.map(({ produtoId, quantidade }) => {
    const p = db.produtos.findOne({ id: produtoId });
    return {
      produtoId,
      nome: p.nome,
      categoria: p.categoria,
      precoUnitario: p.preco,
      quantidade,
      subtotal: emEuros(emCentimos(p.preco) * quantidade)
    };
  });

  const subtotalC = itens.reduce((soma, i) => soma + emCentimos(i.subtotal), 0);
  const subtotalMnsrmC = itens
    .filter((i) => i.categoria === 'MNSRM')
    .reduce((soma, i) => soma + emCentimos(i.subtotal), 0);

  const descontoC =
    formaPagamento === 'dinheiro' ? Math.round(subtotalMnsrmC * DESCONTO_DINHEIRO) : 0;
  const vip = usuario.totalGasto >= LIMIAR_VIP;
  const portesC = itens.length === 0 || vip ? 0 : emCentimos(PORTES);

  return {
    itens,
    formaPagamento,
    clienteVip: vip,
    exigeReceita: itens.some((i) => i.categoria === 'MSRM'),
    subtotal: emEuros(subtotalC),
    desconto: emEuros(descontoC),
    portes: emEuros(portesC),
    total: emEuros(subtotalC - descontoC + portesC)
  };
}

module.exports = {
  adicionarItem,
  atualizarItem,
  removerItem,
  esvaziar,
  resumo,
  validarQuantidadeFinal
};
