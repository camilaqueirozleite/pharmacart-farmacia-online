/**
 * Base de dados em memória, no estilo do mongodb-memory-server:
 * cada "coleção" guarda documentos e oferece métodos parecidos com os do MongoDB
 * (insertOne, find, findOne, updateOne, deleteOne).
 *
 * Os dados vivem apenas enquanto o servidor está ligado.
 * Reiniciar a aplicação repõe os dados de teste do ficheiro seed.js.
 */
const crypto = require('crypto');
const seed = require('./seed');

class Collection {
  constructor() {
    this.docs = [];
    this.nextId = 1;
  }

  matches(doc, filtro = {}) {
    return Object.entries(filtro).every(([campo, valor]) => doc[campo] === valor);
  }

  insertOne(doc) {
    const novo = { id: doc.id ?? this.nextId, ...doc };
    this.nextId = Math.max(this.nextId, novo.id) + 1;
    this.docs.push(novo);
    return structuredClone(novo);
  }

  find(filtro = {}) {
    return this.docs.filter((d) => this.matches(d, filtro)).map((d) => structuredClone(d));
  }

  findOne(filtro = {}) {
    const doc = this.docs.find((d) => this.matches(d, filtro));
    return doc ? structuredClone(doc) : null;
  }

  updateOne(filtro, alteracoes) {
    const doc = this.docs.find((d) => this.matches(d, filtro));
    if (!doc) return null;
    Object.assign(doc, alteracoes);
    return structuredClone(doc);
  }

  deleteOne(filtro) {
    const indice = this.docs.findIndex((d) => this.matches(d, filtro));
    if (indice === -1) return false;
    this.docs.splice(indice, 1);
    return true;
  }

  clear() {
    this.docs = [];
    this.nextId = 1;
  }
}

function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function senhaConfere(senha, guardada) {
  const [salt, hash] = guardada.split(':');
  const tentativa = crypto.scryptSync(senha, salt, 64);
  return crypto.timingSafeEqual(tentativa, Buffer.from(hash, 'hex'));
}

const db = {
  usuarios: new Collection(),
  produtos: new Collection(),
  carrinhos: new Collection(),
  pedidos: new Collection(),
  sessoes: new Collection()
};

/** Apaga tudo e volta a carregar os dados de teste. */
function resetDatabase() {
  Object.values(db).forEach((colecao) => colecao.clear());
  seed.produtos.forEach((p) => db.produtos.insertOne({ ...p }));
  seed.usuarios.forEach(({ senha, ...u }) =>
    db.usuarios.insertOne({ ...u, senhaHash: hashSenha(senha) })
  );
}

resetDatabase();

module.exports = { db, resetDatabase, hashSenha, senhaConfere };
