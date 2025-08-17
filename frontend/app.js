// IMPORTANT: Set this to your Render backend URL
const API_BASE = "https://paystack-ammn.onrender.com";

const form = document.getElementById('pay-form');
const statusEl = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Creating transaction...';

  const email = document.getElementById('email').value.trim();
  const amount = Number(document.getElementById('amount').value);

  try {
    const res = await fetch(`${API_BASE}/api/paystack/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        amount,
        currency: 'NGN'
      })
    });

    const data = await res.json();

    if (!res.ok || !data?.status) {
      throw new Error(data?.message || data?.error || 'Initialization failed');
    }

    // Redirect to Paystack checkout
    window.location.href = data.data.authorization_url;
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Error: ' + err.message;
  }
});
