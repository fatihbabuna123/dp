const LANGS = {
  tr: {
    productTable: "Ürün Tablosu",
    productCode: "Ürün Kodu",
    productName: "Ürün Adı",
    brand: "Marka",
    type: "Tipi",
    category: "Kategori",
    searchPlaceholder: "Arama yap...",
    noRecord: "Kayıt bulunamadı.",
    selectLanguage: "Dil Seç",
    close: "Kapat"
  },
  en: {
    productTable: "Product Table",
    productCode: "Product Code",
    productName: "Product Name",
    brand: "Brand",
    type: "Type",
    category: "Category",
    searchPlaceholder: "Search...",
    noRecord: "No records found.",
    selectLanguage: "Select Language",
    close: "Close"
  },
  sq: {
    productTable: "Tabela e Produkteve",
    productCode: "Kodi i Produktit",
    productName: "Emri i Produktit",
    brand: "Marka",
    type: "Lloji",
    category: "Kategoria",
    searchPlaceholder: "Kërko...",
    noRecord: "Nuk u gjetën të dhëna.",
    selectLanguage: "Zgjidh Gjuhën",
    close: "Mbyll"
  }
};

let currentLang = 'sq';
let currentTypeFilter = null;


// Önce kategoriye göre (Femer, Mashkull, Unisex), sonra koda göre sırala
function normalizeCategory(cat) {
  cat = (cat || '').toLowerCase();
  if (cat.includes('woman') || cat.includes('femer') || cat.includes('femër') || cat.includes('bayan')) return 'woman';
  if (cat.includes('man') || cat.includes('mashkull') || cat.includes('bay') || cat.includes('erkek')) return 'man';
  if (cat.includes('unisex')) return 'unisex';
  return 'other';
}

function customSort(a, b) {
  const categoryOrder = ['woman', 'man', 'unisex', 'other'];
  const catA = categoryOrder.indexOf(normalizeCategory(a.category));
  const catB = categoryOrder.indexOf(normalizeCategory(b.category));
  if (catA !== catB) return catA - catB;
  // Kodun başındaki harf ve rakamı ayırıp doğal sıralama uygula
  const re = /(\D+)-(\d+)/i;
  const ma = a.code.match(re);
  const mb = b.code.match(re);
  if (ma && mb && ma[1] === mb[1]) {
    return parseInt(ma[2]) - parseInt(mb[2]);
  }
  return a.code.localeCompare(b.code);
}

function renderTable() {
  const t = LANGS[currentLang];
  document.getElementById('tableTitle').textContent = t.productTable;
  // Geri butonu metni
  const backBtn = document.getElementById('backToCards');
  if (backBtn) {
    let backText = '← Geri';
    if (currentLang === 'en') backText = '← Back';
    if (currentLang === 'sq') backText = '← Kthehu';
    backBtn.textContent = backText;
  }
  document.getElementById('thCode').textContent = t.productCode;
  document.getElementById('thName').textContent = t.productName;
  document.getElementById('thBrand').textContent = t.brand;
  document.getElementById('thType').textContent = t.type;
  document.getElementById('thCategory').textContent = t.category;
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.placeholder = t.searchPlaceholder;
  document.querySelector('span[style*="font-weight:500"]').textContent = t.selectLanguage + ":";

  let filtered = PRODUCTS;
  if (currentTypeFilter && currentTypeFilter !== 'All') {
    filtered = filtered.filter(p => (p.type || '').toLowerCase() === currentTypeFilter.toLowerCase());
  }
  const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const terms = search.split(/\s+/).filter(Boolean);
  filtered = filtered.filter(p =>
    terms.every(term =>
      p.code.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.type.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    )
  ).sort(customSort);

  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  if (filtered.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.className = 'text-center';
    td.textContent = t.noRecord;
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  filtered.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    // Kategori birden fazla ise ilkini al
    let cat = (p.category || '').split('/')[0].trim().toLowerCase();
    let catTextClass = '';
    if (cat === 'femer' || cat === 'femër' || cat === 'woman' || cat === 'bayan') catTextClass = 'text-femer';
    else if (cat === 'mashkull' || cat === 'man' || cat === 'bay' || cat === 'erkek') catTextClass = 'text-mashkull';
    tr.onclick = () => showModal(p);
    tr.innerHTML = `
      <td>${p.code}</td>
      <td>${p.name}</td>
      <td>${p.brand}</td>
      <td>${p.type}</td>
      <td class='${catTextClass}'>${p.category}</td>
    `;
    tbody.appendChild(tr);
  });
}

function showModal(product) {
  const t = LANGS[currentLang];
  document.getElementById('modalTitle').textContent = product.name;
  // Kategoriye göre class belirle
  let cat = (product.category || '').split('/')[0].trim().toLowerCase();
  let catTextClass = '';
  if (cat === 'femer' || cat === 'femër' || cat === 'woman' || cat === 'bayan') catTextClass = 'text-femer';
  else if (cat === 'mashkull' || cat === 'man' || cat === 'bay' || cat === 'erkek') catTextClass = 'text-mashkull';
  document.getElementById('modalBody').innerHTML = `
    ${product.image ? `<img src="${product.image}" alt="${product.name}" style="max-width:250px;max-height:200px;margin-bottom:16px;" />` : ''}
    <ul class="list-group text-start">
      <li class="list-group-item"><b>${t.productCode}:</b> ${product.code}</li>
      <li class="list-group-item"><b>${t.productName}:</b> ${product.name}</li>
      <li class="list-group-item"><b>${t.brand}:</b> ${product.brand}</li>
      <li class="list-group-item"><b>${t.type}:</b> ${product.type}</li>
      <li class="list-group-item ${catTextClass}"><b>${t.category}:</b> ${product.category}</li>
    </ul>
  `;
  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

document.getElementById('langSelect').addEventListener('change', function() {
  currentLang = this.value;
  renderTable();
});
document.getElementById('searchInput').addEventListener('input', renderTable);

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.card-filter').forEach(card => {
    card.addEventListener('click', function() {
      currentTypeFilter = this.getAttribute('data-type');
      document.getElementById('filterCards').style.display = 'none';
      document.getElementById('tableArea').style.display = '';
      renderTable();
    });
  });
  // Geri butonu ile kartlara dön
  const backBtn = document.getElementById('backToCards');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      document.getElementById('filterCards').style.display = '';
      document.getElementById('tableArea').style.display = 'none';
      currentTypeFilter = null;
    });
  }
  renderTable();
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', renderTable);
  }
});
