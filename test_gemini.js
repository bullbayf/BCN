const https = require('https');

const apiKey = "AIzaSyBQ_WB1zu7x2SicI3P27J_tw1toOD0asCg";
const model = "gemini-1.5-flash-latest";

const data = JSON.stringify({
  contents: [{ parts: [{ text: "Hola" }] }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => responseBody += chunk);
  res.on('end', () => console.log('Response:', responseBody));
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
