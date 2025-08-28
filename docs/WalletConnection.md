```js
async function connectWallet() {
  if (!window.ethereum) return alert('Wallet not found');
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
}
```