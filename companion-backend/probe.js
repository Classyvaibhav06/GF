import fetch from 'node-fetch';
import fs from 'fs';

async function probe() {
  const apiKey = "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";

  // Create a dummy WAV file
  const buffer = Buffer.from(
    "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
    "base64"
  );

  const urls = [
    "https://integrate.api.nvidia.com/v1/audio/transcriptions",
    "https://ai.api.nvidia.com/v1/audio/transcriptions",
    "https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/ea256795-3642-45e3-a417-6d2c4b5bb80a", // Parakeet UUID if it exists
    "https://ai.api.nvidia.com/v1/riva/speech/recognition"
  ];

  for (const url of urls) {
    try {
      console.log(`\nProbing ${url}...`);
      
      const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
      const body = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.wav"\r\nContent-Type: audio/wav\r\n\r\n${buffer.toString('binary')}\r\n--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nparakeet-rnnt-1.1b\r\n--${boundary}--`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Accept": "application/json"
        },
        body: body
      });
      
      const text = await res.text();
      console.log(`Status: ${res.status}`);
      console.log(`Response: ${text.substring(0, 100)}...`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

probe();
