import fetch from 'node-fetch';
import fs from 'fs';

async function testSTT() {
  const apiKey = "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";
  
  const urls = [
    "https://integrate.api.nvidia.com/v1/audio/transcriptions",
    "https://ai.api.nvidia.com/v1/audio/transcriptions"
  ];
  
  for (const url of urls) {
    try {
      console.log("Testing", url);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
      console.log(res.status, await res.text());
    } catch(e) {
      console.error(e);
    }
  }
}

testSTT();
