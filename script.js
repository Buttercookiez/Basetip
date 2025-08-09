// script.js - Create tip link (creator) - no wallet connection required for generation
const SUPABASE_URL = "https://uzvczcmoihyruzsvcism.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6dmN6Y21vaWh5cnV6c3ZjaXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NjI3ODAsImV4cCI6MjA3MDIzODc4MH0.hZkW-YzKL6MxORxHwE5Zu1A19_Mb9LhM0YfXZ2xHQ40";

// initialize supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const threadInput = document.getElementById('threadLink');
  const walletInput = document.getElementById('walletAddress');
  const generateBtn = document.getElementById('generateBtn');
  const statusEl = document.getElementById('status');

  generateBtn.addEventListener('click', async () => {
    statusEl.style.color = 'black';
    statusEl.textContent = '';
    const thread = threadInput.value.trim();
    const wallet = walletInput.value.trim();

    if (!thread || !wallet) {
      statusEl.style.color = 'red';
      statusEl.textContent = 'Please fill both fields.';
      return;
    }

    statusEl.textContent = 'Saving...';

    try {
      const { data, error } = await supabase
        .from('tip_links')
        .insert([{ thread_link: thread, wallet_address: wallet }])
        .select()
        .single();

      if (error) throw error;

      const id = data.id;
      const url = `${window.location.origin}/tip.html?id=${id}`;
      statusEl.style.color = 'green';
      statusEl.innerHTML = `✅ Tip link created: <a href="${url}" target="_blank">${url}</a> <button id="copyBtn">Copy</button>`;
      document.getElementById('copyBtn').addEventListener('click', () => {
        navigator.clipboard.writeText(url);
        alert('Copied to clipboard');
      });
    } catch (err) {
      console.error('Insert error', err);
      statusEl.style.color = 'red';
      statusEl.textContent = 'Failed to create tip link. See console for details.';
    }
  });
});
