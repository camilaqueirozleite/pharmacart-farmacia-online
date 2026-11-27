/**
 * Constantes das regras de negócio da PharmaCart.
 * Ficam num só sítio para ser fácil consultá-las (e testá-las).
 */
module.exports = {
  // Regra 1: pagamento em dinheiro dá 10% de desconto, apenas nos produtos MNSRM.
  DESCONTO_DINHEIRO: 0.1,

  // Regra 3: cliente torna-se VIP quando o total gasto chega a 300 €; VIP não paga portes.
  LIMIAR_VIP: 300,
  PORTES: 4.99,

  // Regra 4: medicamentos MSRM exigem número de receita com 19 dígitos.
  REGEX_RECEITA: /^\d{19}$/,

  // Regra 5: máximo de 2 embalagens do mesmo medicamento por compra.
  MAX_EMBALAGENS_POR_PRODUTO: 2,

  FORMAS_PAGAMENTO: ['dinheiro', 'cartao', 'mbway'],

  CATEGORIAS: {
    MSRM: 'Medicamento Sujeito a Receita Médica',
    MNSRM: 'Medicamento Não Sujeito a Receita Médica'
  }
};
