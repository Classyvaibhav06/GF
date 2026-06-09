const https = require('https');
const fs = require('fs');

https.get('https://openrouter.ai/api/v1/models', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const models = JSON.parse(data).data;
    const nemotron = models.filter(m => m.id.toLowerCase().includes('nemotron')).map(m => m.id);
    fs.writeFileSync('nemotron-models.txt', nemotron.join('\n'));
  });
});
