// Reads ?reference=... and asks backend to verify
const API_BASE = "https://your-app.onrender.com"; // same as in app.js

function getQuery(name){
  const p = new URLSearchParams(location.search);
  return p.get(name);
}

(async () => {
  const ref = getQuery('reference');
  const el = document.getElementById('result');
  if(!ref){
    el.textContent = 'No reference found in URL.';
    return;
  }
  el.textContent = 'Verifying reference: ' + ref + '...';

  try {
    const res = await fetch(`${API_BASE}/api/paystack/verify/${encodeURIComponent(ref)}`);
    const data = await res.json();
    if (!res.ok || data?.status === false) {
      throw new Error(data?.message || data?.error || 'Verification failed');
    }

    const status = data.data.status;
    const amount = (data.data.amount/100).toFixed(2);
    const currency = data.data.currency;
    const email = data.data.customer?.email;

    el.innerHTML = [
      `<strong>Status:</strong> ${status}`,
      `<strong>Amount:</strong> ${amount} ${currency}`,
      `<strong>Email:</strong> ${email}`,
      `<strong>Reference:</strong> ${ref}`
    ].join('\n');
  } catch (err) {
    console.error(err);
    el.textContent = 'Error: ' + err.message;
  }
})();
