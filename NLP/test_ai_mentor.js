const http = require('http');

const body = JSON.stringify({
  userData: {
    role: "Data Analyst",
    score: 42,
    gaps: ["SQL", "Power BI"]
  },
  question: "Why am I getting rejected?"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/ai-mentor',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

console.log('Testing POST /api/ai-mentor ...\n');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ STATUS:', res.statusCode);
      console.log('\n--- AI Mentor Response ---');
      console.log('🧠 INSIGHT:', json.insight);
      console.log('\n📊 REASON:', json.reason);
      console.log('\n✅ ACTIONS:');
      (json.actions || []).forEach((a, i) => console.log(`  ${i+1}. ${a}`));
      console.log('\n📅 ROADMAP:');
      (json.roadmap || []).forEach((r, i) => console.log(`  ${i+1}. ${r}`));
      console.log('\n⚡ TODAY TASK:', json.today_task);
      console.log('\n📌 META:', JSON.stringify(json.meta));
    } catch(e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => console.error('❌ Error:', e.message));
req.write(body);
req.end();
