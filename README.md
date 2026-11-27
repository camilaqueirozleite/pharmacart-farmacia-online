# PharmaCart – Farmácia Online

Projeto de Portfólio Pessoal da **Mentoria em Testes de Software 2.0** (Julio de Lima).

## O que é esta aplicação

A PharmaCart é uma **farmácia online fictícia**, composta por uma **API REST** e um **site**, que serve de base para praticar testes de software (manuais e automatizados).

O projeto parte do enunciado da mentoria (um e-commerce com Login, Registo, Carrinho e Finalização de Compra) e adapta-o ao **setor farmacêutico**, área onde trabalhei como farmacêutica comunitária e hospitalar desde 2008. Além das regras comuns de e-commerce, inclui regras próprias da dispensa de medicamentos: a distinção entre **MSRM** (Medicamentos Sujeitos a Receita Médica) e **MNSRM** (Medicamentos Não Sujeitos a Receita Médica), a obrigatoriedade de receita e o limite de embalagens por compra.

> ⚠️ Aplicação apenas para estudo. Os produtos, preços, utilizadores e regras são fictícios e não representam a legislação farmacêutica real.

**Funcionalidades**

| Funcionalidade | Site | API |
| --- | --- | --- |
| Registo de cliente | `/registo.html` | `POST /api/auth/registo` |
| Login | `/login.html` | `POST /api/auth/login` |
| Carrinho | `/` (adicionar) e `/carrinho.html` | `GET/POST/PUT/DELETE /api/carrinho...` |
| Finalização de compra | `/carrinho.html` | `POST /api/checkout` |

**Tecnologias:** Node.js, Express, base de dados em memória (no estilo do `mongodb-memory-server`), Swagger/OpenAPI 3 e HTML, CSS e JavaScript (sem frameworks).

## Como instalar

Pré-requisitos: [Node.js](https://nodejs.org/) 18 ou superior e Git.

```bash
git clone https://github.com/camilaqueirozleite/pharmacart-farmacia-online.git
cd pharmacart-farmacia-online
npm install
```

## Como executar

```bash
npm start
```

A aplicação arranca em `http://localhost:3000`. Para usar outra porta:

```bash
# Linux / macOS / Git Bash
PORT=4000 npm start

# Windows (PowerShell)
$env:PORT=4000; npm start
```

Para desenvolvimento (reinicia automaticamente ao guardar ficheiros): `npm run dev`.

> A base de dados vive **em memória**: sempre que o servidor é reiniciado, todos os dados voltam ao estado inicial descrito abaixo. Isto torna os testes repetíveis.

## Quais dados de teste estão incluídos

Os dados são carregados em `src/database/seed.js` sempre que a aplicação arranca.

### Utilizadores (palavra-passe de todos: `Teste@123`)

| Nome | Email | Total já gasto | VIP? | Para que serve |
| --- | --- | --- | --- | --- |
| Ana Sousa | `ana@pharmacart.pt` | 0,00 € | Não | Cliente novo: paga portes |
| Bruno Costa | `bruno@pharmacart.pt` | 350,00 € | **Sim** | Testar portes grátis |
| Carla Mendes | `carla@pharmacart.pt` | 290,00 € | Não | Está a 10 € de se tornar VIP |

### Produtos

| ID | Produto | Categoria | Preço | Stock | Para que serve |
| --- | --- | --- | --- | --- | --- |
| 1 | Paracetamol 1000 mg (18 comp.) | MNSRM | 3,50 € | 20 | Desconto em dinheiro, limite de 2 embalagens |
| 2 | Amoxicilina + Ácido Clavulânico 875/125 mg (16 comp.) | **MSRM** | 8,90 € | 5 | Exige receita; desconto **não** se aplica |
| 3 | Ibuprofeno 400 mg (20 comp.) | MNSRM | 4,20 € | **0** | Produto esgotado |

Números de receita válidos para teste: qualquer sequência de **19 dígitos**, por exemplo `1234567890123456789`.

## Quais são as regras de negócio

| # | Regra | Onde é validada | Resposta quando falha |
| --- | --- | --- | --- |
| 1 | Pagamento em **dinheiro** dá **10% de desconto**, aplicado **apenas ao subtotal dos MNSRM**. Os MSRM e os portes nunca têm desconto. | Resumo do carrinho e checkout | — (cálculo) |
| 2 | Um produto só pode ser adicionado ao carrinho se tiver **stock** suficiente. O stock é validado de novo na finalização. | Adicionar/alterar item e checkout | `422` |
| 3 | Clientes **VIP** têm **portes grátis**. Um cliente torna-se VIP quando o **total gasto atinge 300 €**. Os restantes pagam **4,99 €** de portes. O estado VIP conta **a partir da compra seguinte** à que atinge os 300 €. | Resumo do carrinho e checkout | — (cálculo) |
| 4 | Um pedido com pelo menos um **MSRM** só pode ser finalizado com um **número de receita com exatamente 19 dígitos**. | Checkout | `422` |
| 5 | Máximo de **2 embalagens do mesmo medicamento** por compra. | Adicionar/alterar item e checkout | `422` |

Outras validações:

- Registo: nome obrigatório, email válido e único (`409` se repetido), palavra-passe com pelo menos 6 caracteres.
- Login: devolve `401` para credenciais inválidas.
- Formas de pagamento aceites: `dinheiro`, `cartao`, `mbway`.
- O valor considerado para o estado VIP é o **total pago** (com desconto e portes).

**Exemplo de cálculo** (cliente não VIP, pagamento em dinheiro): 2 × Paracetamol (7,00 €) + 1 × Amoxicilina (8,90 €)

| Subtotal | Desconto (10% de 7,00 €) | Portes | Total |
| --- | --- | --- | --- |
| 15,90 € | − 0,70 € | 4,99 € | **20,19 €** |

## Quais são as URLs importantes

Com a aplicação em execução:

| O quê | URL |
| --- | --- |
| Site (catálogo de produtos) | http://localhost:3000 |
| Login | http://localhost:3000/login.html |
| Criar conta | http://localhost:3000/registo.html |
| Carrinho e finalização | http://localhost:3000/carrinho.html |
| Documentação da API (Swagger UI) | http://localhost:3000/api-docs |
| Especificação da API (ficheiro YAML) | http://localhost:3000/api-docs/swagger.yaml |
| Verificação de saúde da API | http://localhost:3000/api/health |

### Endpoints da API

| Método | Endpoint | Autenticação | Descrição |
| --- | --- | --- | --- |
| POST | `/api/auth/registo` | — | Registar cliente |
| POST | `/api/auth/login` | — | Login (devolve `token`) |
| GET | `/api/auth/me` | Bearer | Dados do cliente e estado VIP |
| POST | `/api/auth/logout` | Bearer | Terminar sessão |
| GET | `/api/produtos` | — | Listar produtos |
| GET | `/api/produtos/{id}` | — | Obter produto |
| GET | `/api/carrinho?formaPagamento=` | Bearer | Ver carrinho com resumo de valores |
| POST | `/api/carrinho/itens` | Bearer | Adicionar produto |
| PUT | `/api/carrinho/itens/{produtoId}` | Bearer | Alterar quantidade |
| DELETE | `/api/carrinho/itens/{produtoId}` | Bearer | Remover produto |
| POST | `/api/checkout` | Bearer | Finalizar compra |
| GET | `/api/pedidos` | Bearer | Histórico de pedidos |

Autenticação: envie o cabeçalho `Authorization: Bearer <token>` com o token devolvido pelo login. No Swagger, use o botão **Authorize**.

Todas as respostas de erro têm o formato `{ "erro": "mensagem" }`.

## Estrutura do projeto

```text
├── docs/swagger.yaml          # Especificação OpenAPI da API
├── public/                    # Site (HTML, CSS e JS)
├── src/
│   ├── app.js                 # Configuração do Express, rotas e Swagger
│   ├── server.js              # Arranque do servidor
│   ├── database/
│   │   ├── memoryDb.js        # Base de dados em memória (coleções estilo MongoDB)
│   │   └── seed.js            # Dados de teste
│   ├── middlewares/           # Autenticação e tratamento de erros
│   ├── routes/                # Endpoints da API
│   └── services/              # Regras de negócio
└── package.json
```

## Notas para quem vai testar

- O site tem atributos `data-testid` nos elementos principais, para facilitar uma futura automação.
- O botão "Adicionar ao carrinho" do produto esgotado continua ativo **de propósito**: assim é possível ver a mensagem da regra 2 devolvida pela API.
- Este repositório **não contém testes automatizados**; esse é o próximo passo do portfólio.

## Autora

**Camila Queiroz da Costa Leite**: farmacêutica em transição para Quality Assurance.
