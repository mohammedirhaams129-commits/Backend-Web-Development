require('dotenv').config();
process.env.ACCESS_SECRET = process.env.ACCESS_SECRET || 'lu54-test-secret-do-not-use-in-production-32chars';
const http = require('http');
const jwt = require('jsonwebtoken');
const SECRET = process.env.ACCESS_SECRET;
const token = (sub, role) => jwt.sign({ sub, role }, SECRET, { algorithm: 'HS256', expiresIn: '1h' });
const originalLog = console.log;
console.log = () => {};
const app = require('../src/app');
console.log = originalLog;
const server = http.createServer(app);
function request(options, body) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const req = http.request({
      hostname: '127.0.0.1', port: addr.port, path: options.path || '/',
      method: options.method || 'GET', headers: options.headers || {}
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}
let passed = 0, failed = 0;
function assert(ok, message) {
  if (ok) { console.log('  ✓ ' + message); passed++; }
  else { console.log('  ✗ ' + message); failed++; }
}
function as(role, sub, method, path, body) {
  return request({ method, path, headers: {
    Authorization: 'Bearer ' + token(sub, role), 'Content-Type': 'application/json'
  }}, body);
}
async function runTests() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  console.log('\nLU 54 — Authorization & RBAC Tests\n');
  console.log('Test 1: Owner edits own post → 200');
  { const r = await as('member','u-A','PATCH','/posts/1',{title:'mine'}); assert(r.status===200,'Status 200 (got '+r.status+')'); }
  console.log('\nTest 2: Member B edits member A post → 403');
  { const r = await as('member','u-B','PATCH','/posts/1',{title:'hacked'}); assert(r.status===403,'Status 403 (got '+r.status+')'); assert(r.body?.error?.code==='FORBIDDEN','error.code FORBIDDEN'); }
  console.log('\nTest 3: Moderator deletes any post → 200');
  { const r = await as('moderator','u-mod','DELETE','/posts/2'); assert(r.status===200,'Status 200 (got '+r.status+')'); }
  console.log('\nTest 4: Member hides post → 403');
  { const r = await as('member','u-A','POST','/posts/1/hide'); assert(r.status===403,'Status 403 (got '+r.status+')'); assert(r.body?.error?.code==='FORBIDDEN','error.code FORBIDDEN'); }
  console.log('\nTest 5: Moderator hides post → 200');
  { const r = await as('moderator','u-mod','POST','/posts/1/hide'); assert(r.status===200,'Status 200 (got '+r.status+')'); }
  console.log('\nTest 6: Member calls admin route → 403');
  { const r = await as('member','u-B','DELETE','/users/u-A'); assert(r.status===403,'Status 403 (got '+r.status+')'); assert(r.body?.error?.code==='FORBIDDEN','error.code FORBIDDEN'); }
  console.log('\nTest 7: Admin calls admin route → 200');
  { const r = await as('admin','u-admin','DELETE','/users/u-A'); assert(r.status===200,'Status 200 (got '+r.status+')'); }
  console.log('\nTest 8: Missing post → 404');
  { const r = await as('member','u-A','PATCH','/posts/999',{title:'x'}); assert(r.status===404,'Status 404 (got '+r.status+')'); }
  console.log('\nTest 9: No token → 401');
  { const r = await request({path:'/posts'}); assert(r.status===401,'Status 401 (got '+r.status+')'); }
  server.close();
  console.log('\nResults: '+passed+' passed, '+failed+' failed');
  if (failed) process.exit(1);
  console.log('All tests passed! ✓');
}
runTests().catch(err => { console.error(err); process.exit(1); });
