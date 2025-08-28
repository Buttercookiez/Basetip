```js
async function sendTip(to, amount) {
  const tx = await signer.sendTransaction({ to, value: ethers.utils.parseEther(amount) });
  await tx.wait();
  return tx.hash;
}
```