// COIL Fair: international partner discovery.
// Set apiUrl to an empty string to use the fictional demonstration data.
const CONFIG = {
  apiUrl: "https://script.google.com/macros/s/AKfycbwOvI3aN_TpnVe-lYUYtvzB_r_o7U-NEVf5Jkv0WYHHv-YSOD6h7xfZEFovYloDEKzCOg/exec"
};

const SAMPLE = {
  "demo@ufsm.br": {
    person: { name: "Marina Costa", country: "br", institution: "UFSM", category: "Ingeniería y Tecnología" },
    recommendations: {
      sameCategory: [
        { name: "Camila Rojas", institution: "INACAP", country: "cl", category: "Ingeniería y Tecnología", academicAreas: ["Desarrollo de software", "Innovación educativa"], email: "camila@example.org" },
        { name: "Tomás Silva", institution: "UST", country: "cl", category: "Ingeniería y Tecnología", academicAreas: ["Automatización", "Sistemas digitales"], email: "tomas@example.org" }
      ],
      otherCategories: [
        { name: "Valentina Fuentes", institution: "INACAP", country: "cl", category: "Negocios y Administración", academicAreas: ["Emprendimiento", "Gestión de proyectos"], email: "valentina@example.org" },
        { name: "Sofía Morales", institution: "UST", country: "cl", category: "Educación y Ciencias Sociales", academicAreas: ["Aprendizaje colaborativo", "Educación"], email: "sofia@example.org" }
      ]
    }
  },
  "demo@inacap.cl": {
    person: { name: "Camila Rojas", country: "cl", institution: "INACAP", category: "Ingeniería y Tecnología" },
    recommendations: {
      sameCategory: [
        { name: "Marina Costa", institution: "UFSM", country: "br", category: "Ingeniería y Tecnología", academicAreas: ["Computação", "Tecnologia educacional"], email: "marina@example.org" }
      ],
      otherCategories: [
        { name: "Pedro Almeida", institution: "UFSM", country: "br", category: "Negocios y Administración", academicAreas: ["Administração", "Empreendedorismo"], email: "pedro@example.org" },
        { name: "Ana Lima", institution: "UFSM", country: "br", category: "Educación y Ciencias Sociales", academicAreas: ["Formação docente", "Ensino"], email: "ana@example.org" }
      ]
    }
  }
};

const i18n = {
  pt: {
    eyebrow: "FEIRA COIL · ENCONTRO DE DOCENTES",
    title: "Encontre conexões.",
    subtitle: "Um ponto de partida para novas colaborações internacionais.",
    lookup: "Identifique-se",
    hint: "Use o e-mail informado na inscrição da Feira COIL.",
    label: "E-mail",
    button: "Buscar conexões ↗",
    demo: "Demonstração: experimente demo@ufsm.br ou demo@inacap.cl",
    result: "Perfil encontrado",
    resultHint: "Esta é a pessoa correspondente ao e-mail informado.",
    same: "Próximo da sua área",
    sameSub: "Primeiro, afinidades temáticas diretas.",
    other: "Explore outras áreas",
    otherSub: "Colaborações interdisciplinares também podem surpreender.",
    foot: "Uma ferramenta de descoberta.",
    none: "Nenhum parceiro nesta seção por enquanto.",
    notfound: "E-mail não encontrado. Confira o endereço informado na inscrição.",
    err: "Não foi possível consultar o serviço. Tente novamente.",
    load: "Consultando conexões...",
    contact: "Contato ✉",
    areasLabel: "Áreas acadêmicas específicas",
    previous: "Parceiro anterior",
    next: "Próximo parceiro",
    position: (index, total) => `${index} de ${total}`
  },
  es: {
    eyebrow: "FERIA COIL · ENCUENTRO DE DOCENTES",
    title: "Encuentra conexiones.",
    subtitle: "Un punto de partida para nuevas colaboraciones internacionales.",
    lookup: "Identifícate",
    hint: "Usa el correo que registraste en la Feria COIL.",
    label: "Correo electrónico",
    button: "Buscar conexiones ↗",
    demo: "Demostración: prueba demo@ufsm.br o demo@inacap.cl",
    result: "Perfil encontrado",
    resultHint: "Esta es la persona correspondiente al correo ingresado.",
    same: "Cerca de tu área",
    sameSub: "Primero, afinidades temáticas directas.",
    other: "Explora otras áreas",
    otherSub: "Las colaboraciones interdisciplinarias también pueden sorprender.",
    foot: "Una herramienta de descubrimiento.",
    none: "Aún no hay colaboradores en esta sección.",
    notfound: "Correo no encontrado. Revisa el correo utilizado en la inscripción.",
    err: "No fue posible consultar el servicio. Inténtalo nuevamente.",
    load: "Buscando conexiones...",
    contact: "Contacto ✉",
    areasLabel: "Áreas académicas específicas",
    previous: "Colaborador anterior",
    next: "Siguiente colaborador",
    position: (index, total) => `${index} de ${total}`
  }
};

let lang = "pt";
let current = null;
const carouselState = {
  same: { items: [], index: 0 },
  other: { items: [], index: 0 }
};

const $ = (id) => document.getElementById(id);
const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));

function flag(country) {
  return ({ br: "🇧🇷", cl: "🇨🇱" })[String(country || "").toLowerCase()] || "";
}

function areasFor(partner) {
  const raw = partner.academicAreas || [];
  return (Array.isArray(raw) ? raw : String(raw).split(/[;,]/))
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function partnerCard(partner) {
  const areas = areasFor(partner);
  const category = partner.category
    ? `<span class="partner-category">${safe(partner.category)}</span>`
    : "";
  const areaChips = areas.length
    ? `<ul class="partner-area-chips" aria-label="${safe(i18n[lang].areasLabel)}">
        ${areas.map((area) => `<li class="partner-area-chip">${safe(area)}</li>`).join("\n        ")}
      </ul>`
    : "";
  const contact = partner.email
    ? `<a class="email-link" href="mailto:${encodeURIComponent(partner.email)}">${safe(i18n[lang].contact)}</a>`
    : "";

  return `
    <article class="partner-card">
      <h3 class="partner-name">
        ${safe(partner.name)}
        <span class="partner-flag" aria-label="${safe(partner.country || "")}">${flag(partner.country)}</span>
      </h3>
      ${partner.institution ? `<p class="partner-institution">${safe(partner.institution)}</p>` : ""}
      ${category ? `<div class="partner-category-row">${category}</div>` : ""}
      ${areaChips}
      ${contact ? `<div class="partner-actions">${contact}</div>` : ""}
    </article>
  `;
}

function displayCarousel(kind) {
  const state = carouselState[kind];
  const viewport = $(`${kind}-list`);
  const controls = $(`${kind}-controls`);
  const previous = $(`${kind}-prev`);
  const next = $(`${kind}-next`);
  const position = $(`${kind}-position`);

  if (!state.items.length) {
    viewport.innerHTML = `<p class="empty">${safe(i18n[lang].none)}</p>`;
    controls.hidden = true;
    return;
  }

  viewport.innerHTML = partnerCard(state.items[state.index]);
  position.textContent = i18n[lang].position(state.index + 1, state.items.length);
  previous.disabled = state.index === 0;
  next.disabled = state.index === state.items.length - 1;
  previous.setAttribute("aria-label", i18n[lang].previous);
  next.setAttribute("aria-label", i18n[lang].next);
  controls.hidden = state.items.length <= 1;
}

function changeSlide(kind, delta) {
  const state = carouselState[kind];
  const newIndex = Math.max(0, Math.min(state.items.length - 1, state.index + delta));
  if (newIndex === state.index) return;
  state.index = newIndex;
  displayCarousel(kind);
}

function render(data, reset = true) {
  const person = data.person;
  $("results").classList.remove("hidden");
  $("profile-content").innerHTML = `
    <div class="profile-pill">
      <div>
        <strong>${safe(person.name)}</strong>
        <p>${[person.institution, person.category].filter(Boolean).map(safe).join(" · ")}</p>
      </div>
      <span class="country">${flag(person.country)} ${safe((person.country || "").toUpperCase())}</span>
    </div>
  `;

  const pairs = [
    ["same", data.recommendations?.sameCategory || []],
    ["other", data.recommendations?.otherCategories || []]
  ];

  for (const [kind, items] of pairs) {
    carouselState[kind].items = items;
    if (reset) carouselState[kind].index = 0;
    $( `${kind}-count` ).textContent = items.length;
    displayCarousel(kind);
  }
}

function setLanguage(language) {
  lang = language;
  document.documentElement.lang = language === "pt" ? "pt-BR" : "es";
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === language);
  });

  const ids = {
    "eyebrow": "eyebrow", "hero-title": "title", "hero-subtitle": "subtitle",
    "lookup-title": "lookup", "lookup-hint": "hint", "email-label": "label",
    "search-button": "button", "demo-hint": "demo", "results-title": "result",
    "results-hint": "resultHint", "same-title": "same", "same-subtitle": "sameSub",
    "other-title": "other", "other-subtitle": "otherSub", "footer-note": "foot"
  };

  for (const [id, key] of Object.entries(ids)) {
    $(id).textContent = i18n[language][key];
  }
  if (current) render(current, false);
  $("demo-hint").hidden = Boolean(CONFIG.apiUrl);
}

async function getData(email) {
  if (!CONFIG.apiUrl) return SAMPLE[email] || null;

  const url = new URL(CONFIG.apiUrl);
  url.searchParams.set("email", email);
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.success === false) throw new Error(data.error || "API error");
  return data.person ? data : null;
}

$("lookup-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("email").value.trim().toLowerCase();
  $("status").textContent = i18n[lang].load;
  $("results").classList.add("hidden");

  try {
    const data = await getData(email);
    current = data;
    $("status").textContent = data ? "" : i18n[lang].notfound;
    if (data) render(data);
  } catch (error) {
    console.error(error);
    $("status").textContent = i18n[lang].err;
  }
});

for (const button of document.querySelectorAll("[data-lang]")) {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
}

for (const kind of ["same", "other"]) {
  $(`${kind}-prev`).addEventListener("click", () => changeSlide(kind, -1));
  $(`${kind}-next`).addEventListener("click", () => changeSlide(kind, 1));

  const viewport = $(`${kind}-list`);
  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      changeSlide(kind, event.key === "ArrowLeft" ? -1 : 1);
    }
  });

  let touchStartX = null;
  viewport.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });
  viewport.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].screenX - touchStartX;
    touchStartX = null;
    if (Math.abs(delta) > 55) changeSlide(kind, delta < 0 ? 1 : -1);
  }, { passive: true });
}

setLanguage("pt");
