const test = async () => {
  const res = await fetch('http://localhost:3000/api/user/wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'test', amount: 1000 })
  });
  console.log(res.status, await res.text());
};
test();
