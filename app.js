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

const contactForm = document.querySelector('#contact-draft');
const bulkFields = document.querySelector('#bulk-fields');
const contactResult = document.querySelector('#contact-result');
const contactText = document.querySelector('#contact-text');
const copyStatus = document.querySelector('#copy-status');
const topic = contactForm.elements.namedItem('topic');
const message = contactForm.elements.namedItem('message');

topic.addEventListener('change', () => {
  const isBulkOrder = topic.selectedIndex === 0;
  bulkFields.hidden = !isBulkOrder;
  bulkFields.disabled = !isBulkOrder;
});

contactForm.addEventListener('input', () => {
  message.setCustomValidity('');
  contactResult.hidden = true;
  copyStatus.textContent = '';
});

contactForm.addEventListener('submit', event => {
  event.preventDefault();
  const fields = new FormData(contactForm);
  const details = fields.get('message').trim();
  if (!details) {
    message.setCustomValidity('ご相談内容を入力してください。');
    message.reportValidity();
    return;
  }
  const lines = ['店舗：八王子川口店', `ご用件：${fields.get('topic')}`];
  const items = fields.get('items')?.trim();
  const pickup = fields.get('pickup');
  if (items) lines.push(`商品名・数量：${items}`);
  if (pickup) lines.push(`希望受取日：${pickup}`);
  lines.push('', 'ご相談内容', details);
  contactText.value = lines.join('\n');
  contactResult.hidden = false;
  contactText.focus();
});

document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(contactText.value);
    copyStatus.textContent = 'コピーしました。公式フォームの「お問い合わせ内容」に貼り付けてください。';
  } catch {
    contactText.focus();
    contactText.select();
    copyStatus.textContent = '選択された内容をコピーし、公式フォームに貼り付けてください。';
  }
});

contactForm.hidden = false;
