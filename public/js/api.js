/* Funções partilhadas por todas as páginas do site. */

const Sessao = {
  get token() { return localStorage.getItem('pharmacart_token'); },
  get usuario() {
    try { return JSON.parse(localStorage.getItem('pharmacart_usuario')); } catch { return null; }
  },
  guardar(token, usuario) {
    localStorage.setItem('pharmacart_token', token);
    localStorage.setItem('pharmacart_usuario', JSON.stringify(usuario));
  },
  atualizarUsuario(usuario) {
    localStorage.setItem('pharmacart_usuario', JSON.stringify(usuario));
  },
  limpar() {
    localStorage.removeItem('pharmacart_token');
    localStorage.removeItem('pharmacart_usuario');
  }
};

async function api(caminho, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (Sessao.token) headers.Authorization = `Bearer ${Sessao.token}`;

  const resposta = await fetch(caminho, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (resposta.status === 401 && Sessao.token) {
    // Token expirado (por exemplo, o servidor foi reiniciado): volta ao login.
    Sessao.limpar();
  }

  const dados = resposta.status === 204 ? null : await resposta.json();
  if (!resposta.ok) throw new Error(dados?.erro || 'Ocorreu um erro inesperado.');
  return dados;
}

const euros = (valor) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(valor);

function mostrarMensagem(texto, tipo = 'erro') {
  const caixa = document.getElementById('mensagem');
  caixa.textContent = texto;
  caixa.className = `mensagem ${tipo} visivel`;
  caixa.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function limparMensagem() {
  const caixa = document.getElementById('mensagem');
  caixa.className = 'mensagem';
  caixa.textContent = '';
}

async function atualizarContadorCarrinho() {
  const contador = document.getElementById('contador-carrinho');
  if (!contador || !Sessao.token) return;
  try {
    const carrinho = await api('/api/carrinho');
    contador.textContent = carrinho.itens.reduce((soma, i) => soma + i.quantidade, 0);
  } catch {
    contador.textContent = '0';
  }
}

/** Monta o menu do topo conforme o cliente esteja ou não autenticado. */
function montarMenu() {
  const nav = document.getElementById('menu');
  const usuario = Sessao.usuario;

  if (Sessao.token && usuario) {
    nav.innerHTML = `
      <a href="/" data-testid="menu-produtos">Produtos</a>
      <a href="/carrinho.html" data-testid="menu-carrinho">Carrinho <span class="contador" id="contador-carrinho">0</span></a>
      <span data-testid="menu-usuario">Olá, ${usuario.nome.split(' ')[0]}</span>
      ${usuario.vip ? '<span class="etiqueta vip" data-testid="selo-vip">VIP</span>' : ''}
      <a href="#" id="sair" data-testid="menu-sair">Sair</a>`;
    document.getElementById('sair').addEventListener('click', async (e) => {
      e.preventDefault();
      try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* sessão já inválida */ }
      Sessao.limpar();
      window.location.href = '/login.html';
    });
    atualizarContadorCarrinho();
  } else {
    nav.innerHTML = `
      <a href="/" data-testid="menu-produtos">Produtos</a>
      <a href="/login.html" data-testid="menu-login">Entrar</a>
      <a href="/registo.html" data-testid="menu-registo">Criar conta</a>`;
  }
}

document.addEventListener('DOMContentLoaded', montarMenu);
