/**
 * Dados de teste carregados sempre que a aplicação arranca.
 * Todos os utilizadores usam a palavra-passe: Teste@123
 *
 * Os dados foram escolhidos para exercitar as regras de negócio:
 *  - Ibuprofeno está SEM stock (regra 2).
 *  - Amoxicilina é MSRM e exige receita (regra 4).
 *  - Bruno já é VIP; Carla está a 10 € de se tornar VIP (regra 3).
 */
const produtos = [
  {
    id: 1,
    nome: 'Paracetamol 1000 mg',
    descricao: 'Analgésico e antipirético. Caixa com 18 comprimidos.',
    categoria: 'MNSRM',
    preco: 3.5,
    stock: 20
  },
  {
    id: 2,
    nome: 'Amoxicilina + Ácido Clavulânico 875/125 mg',
    descricao: 'Antibiótico. Caixa com 16 comprimidos revestidos.',
    categoria: 'MSRM',
    preco: 8.9,
    stock: 5
  },
  {
    id: 3,
    nome: 'Ibuprofeno 400 mg',
    descricao: 'Anti-inflamatório não esteroide. Caixa com 20 comprimidos.',
    categoria: 'MNSRM',
    preco: 4.2,
    stock: 0
  }
];

const usuarios = [
  {
    id: 1,
    nome: 'Ana Sousa',
    email: 'ana@pharmacart.pt',
    senha: 'Teste@123',
    totalGasto: 0
  },
  {
    id: 2,
    nome: 'Bruno Costa',
    email: 'bruno@pharmacart.pt',
    senha: 'Teste@123',
    totalGasto: 350
  },
  {
    id: 3,
    nome: 'Carla Mendes',
    email: 'carla@pharmacart.pt',
    senha: 'Teste@123',
    totalGasto: 290
  }
];

module.exports = { produtos, usuarios };
