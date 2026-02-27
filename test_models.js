const https = require('https');

const apiKey = "";

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${apiKey}`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => responseBody += chunk);
  res.on('end', () => {
    const data = JSON.parse(responseBody);
    if(data.models) {
        console.log("AVAILABLE MODELS:");
        data.models.forEach(m => console.log(m.name, "-", m.supportedGenerationMethods.join(',')));
    } else {
        console.log("RESPONSE:", data);
    }
  });
});

req.on('error', (e) => console.error('Error:', e));
req.end();
