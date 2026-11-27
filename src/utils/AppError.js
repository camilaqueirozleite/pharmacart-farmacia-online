/**
 * Erro de negócio com o código HTTP que a API deve devolver.
 * Ex.: throw new AppError(422, 'Produto sem stock disponível.')
 */
class AppError extends Error {
  constructor(status, message, codigo) {
    super(message);
    this.status = status;
    this.codigo = codigo;
  }
}

module.exports = AppError;
