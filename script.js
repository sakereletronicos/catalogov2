/* ===== CARROSSEL ===== */
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-item');
const container = document.querySelector('.carousel-container');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

function showSlide(index) {
  if (index >= slides.length) currentSlide = 0;
  else if (index < 0) currentSlide = slides.length - 1;
  else currentSlide = index;
  container.style.transform = `translateX(-${currentSlide * 100}%)`;
}
nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
setInterval(() => showSlide(currentSlide + 1), 4000);

/* ===== DARK MODE + TRANSIÇÕES ===== */
const fadeBtn = document.getElementById('fadeModeBtn');
const slideBtn = document.getElementById('slideModeBtn');

function toggleDarkMode(type) {
  document.body.classList.toggle('dark');
  document.body.classList.remove('fade-transition', 'slide-transition');
  if (type === 'fade') {
    document.body.classList.add('fade-transition');
  } else if (type === 'slide') {
    document.body.classList.add('slide-transition');
  }
}
fadeBtn.addEventListener('click', () => toggleDarkMode('fade'));
slideBtn.addEventListener('click', () => toggleDarkMode('slide'));

/* ===== GOOGLE SHEETS: CARREGAR PRODUTOS ===== */
const SHEET_ID = "1yJqq-aL5oUnBtxb93bJy2JwLx3ccwuaoQz_UbHAI5_s"; // 🔹 substitua pelo ID real
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

async function carregarProdutos() {
  try {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();

    const linhas = csvText.split("\n").map(l => l.split(","));
    const cabecalho = linhas.shift().map(c => c.trim().toLowerCase());

    const produtos = linhas.map(linha => {
      const item = {};
      cabecalho.forEach((col, i) => item[col] = linha[i]?.trim());
      return item;
    }).filter(p => p.nome);

    renderizarProdutos(produtos);
    criarBotoesCategorias(produtos);
    configurarBusca(produtos);

  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
  }
}

/* ===== RENDERIZAÇÃO DOS PRODUTOS ===== */
function renderizarProdutos(produtos) {
  const container = document.getElementById("product-cards");
  container.innerHTML = "";

  produtos.forEach(p => {
    const precoOriginal = parseFloat(p.preço || p.preco) || 0;
    const desconto = parseFloat(p.desconto) || 0;
    const ativo = (p.ativo || "").toLowerCase() === "sim";
    const temDesconto = desconto > 0 && desconto < 100;

    const precoFinal = temDesconto
      ? precoOriginal - (precoOriginal * (desconto / 100))
      : precoOriginal;

    const card = document.createElement("div");
    card.classList.add("product-card");
    if (!ativo) card.classList.add("inativo");

    const img = document.createElement("img");
    img.src = p.imagem;
    img.alt = p.nome;

    const nome = document.createElement("p");
    nome.textContent = p.nome;

    const preco = document.createElement("span");
    preco.classList.add("preco");

    if (temDesconto) {
      preco.innerHTML = `
        <span class="preco-antigo">R$ ${precoOriginal.toFixed(2).replace('.', ',')}</span>
        <span class="preco-novo">R$ ${precoFinal.toFixed(2).replace('.', ',')}</span>
        <span class="etiqueta-desconto">-${desconto}% OFF</span>
      `;
    } else {
      preco.textContent = `R$ ${precoOriginal.toFixed(2).replace('.', ',')}`;
    }

    if (ativo && p.link) {
      card.addEventListener("click", () => window.open(p.link, "_blank"));
    }

    card.appendChild(img);
    card.appendChild(nome);
    card.appendChild(preco);
    container.appendChild(card);
  });
}

/* ===== CATEGORIAS ===== */
function criarBotoesCategorias(produtos) {
  const categoriasContainer = document.querySelector(".categories");
  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];

  categoriasContainer.innerHTML = categorias.map(cat => `
    <button class="category" data-cat="${cat}">${cat}</button>
  `).join("");

  // Botão "Todos"
  const btnTodos = document.createElement("button");
  btnTodos.textContent = "Todos";
  btnTodos.classList.add("category");
  btnTodos.dataset.cat = "Todos";
  categoriasContainer.prepend(btnTodos);

  categoriasContainer.addEventListener("click", e => {
    if (e.target.classList.contains("category")) {
      const catSelecionada = e.target.dataset.cat;
      const botoes = document.querySelectorAll(".category");
      botoes.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      filtrarPorCategoria(catSelecionada, produtos);
    }
  });
}

/* ===== FILTRO DE CATEGORIA ===== */
function filtrarPorCategoria(categoria, produtos) {
  let filtrados = categoria === "Todos"
    ? produtos
    : produtos.filter(p => p.categoria === categoria);
  renderizarProdutos(filtrados);
}

/* ===== BARRA DE PESQUISA ===== */
function configurarBusca(produtos) {
  const inputBusca = document.querySelector(".search-bar input");
  inputBusca.addEventListener("input", e => {
    const termo = e.target.value.toLowerCase();
    const filtrados = produtos.filter(p =>
      p.nome.toLowerCase().includes(termo) ||
      p.categoria.toLowerCase().includes(termo)
    );
    renderizarProdutos(filtrados);
  });
}

carregarProdutos();

