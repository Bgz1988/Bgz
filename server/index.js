const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

let prescriptions = [];
let orders = [];

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  });
}

function handleApi(req, res) {
  if (req.method === 'GET' && req.url === '/api/prescriptions') {
    return sendJSON(res, 200, prescriptions);
  }
  if (req.method === 'POST' && req.url === '/api/prescriptions') {
    return parseBody(req, (err, data) => {
      if (err) return sendJSON(res, 400, { error: 'Invalid JSON' });
      data.id = Date.now();
      prescriptions.push(data);
      sendJSON(res, 201, data);
    });
  }
  if (req.method === 'GET' && req.url === '/api/orders') {
    return sendJSON(res, 200, orders);
  }
  if (req.method === 'POST' && req.url === '/api/orders') {
    return parseBody(req, (err, data) => {
      if (err) return sendJSON(res, 400, { error: 'Invalid JSON' });
      data.id = Date.now();
      orders.push(data);
      sendJSON(res, 201, data);
    });
  }
  sendJSON(res, 404, { error: 'Not found' });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    return handleApi(req, res);
  }
  let filePath = path.join(__dirname, '..', 'app', req.url === '/' ? 'index.html' : req.url);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      const ext = path.extname(filePath);
      const type = ext === '.js' ? 'text/javascript' : 'text/html';
      res.writeHead(200, { 'Content-Type': type });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

