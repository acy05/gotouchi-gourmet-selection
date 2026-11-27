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

const contactForm = document.querySelector('#contact-form');
const contactFields = document.querySelector('#contact-fields');
const contactHelp = document.querySelector('#contact-help');
const contactSubmit = document.querySelector('#contact-submit');
const contactStatus = document.querySelector('#contact-status');
const bulkFields = document.querySelector('#bulk-fields');
const topic = contactForm.elements.namedItem('topic');
const message = contactForm.elements.namedItem('message');
const endpoint = contactForm.dataset.endpoint;

function updateBulkFields() {
  const isBulkOrder = topic.selectedIndex === 0;
  bulkFields.hidden = !isBulkOrder;
  for (const field of bulkFields.querySelectorAll('input')) {
    field.disabled = !isBulkOrder;
  }
}

topic.addEventListener('change', updateBulkFields);
message.addEventListener('input', () => message.setCustomValidity(''));

contactForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!endpoint || contactSubmit.disabled) return;

  const fields = new FormData(contactForm);
  const details = fields.get('message').trim();
  if (!details) {
    message.setCustomValidity('ご相談内容を入力してください。');
    message.reportValidity();
    return;
  }

  fields.set('message', details);
  fields.set('store', '八王子川口店');
  contactFields.disabled = true;
  contactSubmit.disabled = true;
  contactStatus.removeAttribute('data-error');
  contactStatus.textContent = '送信中です。';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: fields,
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) {
      contactStatus.setAttribute('data-error', '');
      contactStatus.textContent = '送信を受け付けられませんでした。入力内容を確認して、時間をおいてお試しください。';
      return;
    }
    contactForm.reset();
    updateBulkFields();
    contactStatus.textContent = '送信を受け付けました。店舗からの返信をお待ちください。';
  } catch {
    contactStatus.setAttribute('data-error', '');
    contactStatus.textContent = '送信結果を確認できませんでした。返信が届かない場合は店舗のInstagramからご連絡ください。';
  } finally {
    contactFields.disabled = false;
    contactSubmit.disabled = false;
  }
});

if (endpoint) {
  contactHelp.textContent = 'ご入力いただいた情報は、お問い合わせへの対応と返信に使用します。';
  contactFields.disabled = false;
  contactSubmit.disabled = false;
}
