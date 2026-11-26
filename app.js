const filters = document.querySelector('.filters');
const filterButtons = Array.from(filters.querySelectorAll('button'));
const products = Array.from(document.querySelectorAll('.product'));
const moreProducts = document.querySelector('#more-products');
const lineupStatus = document.querySelector('#lineup-status');
let category = 'all';
let showAllProducts = false;

function updateProducts() {
  let visible = 0;
  for (const product of products) {
    const matches = product.dataset.category === category;
    product.hidden = category === 'all'
      ? product.hasAttribute('data-more') && !showAllProducts
      : !matches;
    visible += Number(!product.hidden);
  }
  for (const button of filterButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  }
  moreProducts.hidden = category !== 'all';
  moreProducts.setAttribute('aria-expanded', String(showAllProducts));
  moreProducts.textContent = showAllProducts ? '表示を戻す' : 'すべての商品例を見る';
  lineupStatus.textContent = `${visible}件の商品例を表示中`;
}

for (const button of filterButtons) {
  button.addEventListener('click', () => {
    category = button.dataset.filter;
    updateProducts();
  });
}
moreProducts.addEventListener('click', () => {
  showAllProducts = !showAllProducts;
  updateProducts();
});
filters.hidden = false;
updateProducts();

const shopForm = document.querySelector('#shop-form');
const prefecture = document.querySelector('#prefecture');
const shopQuery = document.querySelector('#shop-query');
const shopCount = document.querySelector('#shop-count');
const shopResults = document.querySelector('#shop-results');
const moreShops = document.querySelector('#more-shops');
const pageSize = 6;
let shownShops = pageSize;
let shops = [];

function renderShops() {
  const query = shopQuery.value.trim().normalize('NFKC').toLocaleLowerCase('ja');
  const matches = shops.filter(shop => {
    const inPrefecture = !prefecture.value || shop.prefecture === prefecture.value;
    const searchable = `${shop.prefecture} ${shop.name} ${shop.address}`.normalize('NFKC').toLocaleLowerCase('ja');
    return inPrefecture && query.split(/\s+/).every(word => searchable.includes(word));
  });
  const visible = matches.slice(0, shownShops);
  const rows = visible.map(shop => {
    const row = document.createElement('li');
    const link = document.createElement('a');
    const name = document.createElement('strong');
    const address = document.createElement('span');
    const detail = document.createElement('span');
    link.href = shop.url;
    name.textContent = shop.name;
    address.textContent = shop.address;
    detail.className = 'store-detail';
    detail.textContent = '店舗詳細';
    link.append(name, address, detail);
    row.append(link);
    return row;
  });
  shopResults.replaceChildren(...rows);
  shopCount.textContent = matches.length
    ? `${matches.length}件中 ${visible.length}件を表示`
    : '条件に合う店舗が見つかりません。都道府県やキーワードを変えて検索してください。';
  moreShops.hidden = visible.length >= matches.length;
}

shopForm.addEventListener('submit', event => {
  event.preventDefault();
  shownShops = pageSize;
  renderShops();
});
prefecture.addEventListener('change', () => {
  shownShops = pageSize;
  renderShops();
});
moreShops.addEventListener('click', () => {
  const firstNewIndex = shownShops;
  shownShops += pageSize;
  renderShops();
  shopResults.children[firstNewIndex]?.firstElementChild.focus();
});

fetch('shops.json')
  .then(response => {
    if (!response.ok) throw new Error('Shop list unavailable');
    return response.json();
  })
  .then(data => {
    shops = data;
    for (const name of new Set(shops.map(shop => shop.prefecture))) {
      prefecture.add(new Option(name, name));
    }
    shopForm.hidden = false;
    renderShops();
  })
  .catch(() => {
    shopCount.textContent = '店舗情報を読み込めませんでした。公式の店舗一覧をご利用ください。';
  });
