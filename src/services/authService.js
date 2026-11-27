const crypto = require('crypto');
const { db, hashSenha, senhaConfere } = require('../database/memoryDb');
const AppError = require('../utils/AppError');
const { LIMIAR_VIP } = require('./regras');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function usuarioPublico(u) {
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    totalGasto: Number(u.totalGasto.toFixed(2)),
    vip: u.totalGasto >= LIMIAR_VIP
  };
}

function registar({ nome, email, senha } = {}) {
  if (!nome || !String(nome).trim()) throw new AppError(400, 'O nome é obrigatório.');
  if (!email || !REGEX_EMAIL.test(email)) throw new AppError(400, 'Indique um email válido.');
  if (!senha || String(senha).length < 6) {
    throw new AppError(400, 'A palavra-passe deve ter pelo menos 6 caracteres.');
  }

  const emailNormalizado = email.trim().toLowerCase();
  if (db.usuarios.findOne({ email: emailNormalizado })) {
    throw new AppError(409, 'Já existe uma conta com este email.');
  }

  const novo = db.usuarios.insertOne({
    nome: String(nome).trim(),
    email: emailNormalizado,
    senhaHash: hashSenha(String(senha)),
    totalGasto: 0
  });
  return usuarioPublico(novo);
}

function login({ email, senha } = {}) {
  if (!email || !senha) throw new AppError(400, 'Email e palavra-passe são obrigatórios.');

  const usuario = db.usuarios.findOne({ email: String(email).trim().toLowerCase() });
  if (!usuario || !senhaConfere(String(senha), usuario.senhaHash)) {
    throw new AppError(401, 'Email ou palavra-passe inválidos.');
  }

  const token = crypto.randomBytes(24).toString('hex');
  db.sessoes.insertOne({ token, usuarioId: usuario.id });
  return { token, usuario: usuarioPublico(usuario) };
}

function usuarioPorToken(token) {
  const sessao = token && db.sessoes.findOne({ token });
  if (!sessao) return null;
  return db.usuarios.findOne({ id: sessao.usuarioId });
}

function logout(token) {
  db.sessoes.deleteOne({ token });
}

module.exports = { registar, login, logout, usuarioPorToken, usuarioPublico };
