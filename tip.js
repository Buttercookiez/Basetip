// tip.js - tip page: connect wallet, send transaction, log to supabase
const SUPABASE_URL = "https://uzvczcmoihyruzsvcism.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6dmN6Y21vaWh5cnV6c3ZjaXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NjI3ODAsImV4cCI6MjA3MDIzODc4MH0.hZkW-YzKL6MxORxHwE5Zu1A19_Mb9LhM0YfXZ2xHQ40";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const params = new URLSearchParams(window.location.search);
const tipId = params.get('id');

const threadBox = document.getElementById('threadBox');
const recipientEl = document.getElementById('recipient');
const connectBtn = document.getElementById('connectBtn');
const connectedAddr = document.getElementById('connectedAddr');
const amountInput = document.getElementById('amount');
const sendBtn = document.getElementById('sendBtn');
const statusEl = document.getElementById('status');
const txHistoryEl = document.getElementById('txHistory');

let provider, signer, userAddress;
let recipientAddress = null;

async function loadTip() {
  if (!tipId) { statusEl.textContent = 'Invalid link'; return; }
  const { data, error } = await supabase
    .from('tip_links')
    .select('*')
    .eq('id', tipId)
    .single();
  if (error || !data) { statusEl.textContent = 'Tip link not found'; return; }
  threadBox.innerHTML = '<a href="' + data.thread_link + '" target="_blank">' + data.thread_link + '</a>';
  recipientEl.textContent = data.wallet_address;
  recipientAddress = data.wallet_address;
  await loadTxHistory();
}

connectBtn.addEventListener('click', async () => {
  if (!window.ethereum) return alert('Please install MetaMask');
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();
  connectedAddr.textContent = 'Connected: ' + userAddress;

  // switch to Base Sepolia
  const baseChainIdHex = '0x14a34';
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: baseChainIdHex }] });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: baseChainIdHex,
            chainName: 'Base Sepolia',
            rpcUrls: ['https://sepolia.base.org'],
            nativeCurrency: { name: 'Base ETH', symbol: 'ETH', decimals: 18 },
            blockExplorerUrls: ['https://sepolia.basescan.org']
          }]
        });
      } catch (addErr) {
        console.error('Add chain error', addErr);
      }
    }
  }
});

sendBtn.addEventListener('click', async () => {
  if (!signer) return alert('Please connect your wallet first');
  const amount = amountInput.value;
  if (!amount || Number(amount) <= 0) return alert('Enter an amount');
  try {
    statusEl.textContent = 'Sending transaction...';
    const tx = await signer.sendTransaction({ to: recipientAddress, value: ethers.utils.parseEther(amount) });
    statusEl.innerHTML = 'Transaction sent: <a href="https://sepolia.basescan.org/tx/' + tx.hash + '" target="_blank">' + tx.hash + '</a>';
    const receipt = await tx.wait();
    statusEl.textContent = '✅ Transaction confirmed: ' + receipt.transactionHash;

    // Save transaction to Supabase
    await supabase.from('transactions').insert([{ tip_id: tipId, tx_hash: receipt.transactionHash, from_address: userAddress, to_address: recipientAddress, amount_eth: amount }]);
    await loadTxHistory();
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Transaction failed: ' + (err.message || err);
  }
});

async function loadTxHistory() {
  txHistoryEl.innerHTML = 'Loading...';
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('tip_id', tipId)
    .order('created_at', { ascending: false });
  if (error) { txHistoryEl.textContent = 'Failed to load history'; return; }
  if (!data || data.length === 0) { txHistoryEl.textContent = 'No transactions yet'; return; }
  txHistoryEl.innerHTML = data.map(t => `
    <div style="padding:8px;border-bottom:1px solid #eee">
      <div><strong>${t.amount_eth} ETH</strong> → <code>${t.to_address}</code></div>
      <div>From: <code>${t.from_address}</code></div>
      <div>Tx: <a href="https://sepolia.basescan.org/tx/${t.tx_hash}" target="_blank">${t.tx_hash}</a></div>
      <div style="font-size:12px;color:#666">${t.created_at}</div>
    </div>
  `).join('');
}

loadTip();
