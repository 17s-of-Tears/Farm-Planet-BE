const path = require('path');
const loader = require('./loadModules').app;
const Make2Model = require('./loadModules').Make2Model;
const app = loader();
const ROOT = process.cwd();
const img = app('/img/*', {
  Read(req, res) {
    const dir = req.baseUrl;
    const file = req.path;
    res.sendFile(path.join(ROOT, dir, file));
  },
});
const api = app('/api/v1');
Make2Model(api, '/', null, require('./endpoint/route'));
const Model = require('./endpoint/model');
app.addErrorType(Model.Error400Parameter, {
  status: 400,
  message: 'INVALID_PARAMETER',
});
app.addErrorType(Model.Error400, {
  status: 400,
  message: e => e.message,
});
app.addErrorType(Model.Error401, {
  status: 401,
  message: 'UNAUTHORIZED',
});
app.addErrorType(Model.Error403Forbidden, {
  status: 403,
  message: 'FORBIDDEN',
});
app.addErrorType(Model.Error404, {
  status: 404,
  message: 'NOT_FOUND',
});

if(process.env.HTTPS==='1') {
  const proto = app.getProto();
  const https = require('https');
  const fs = require('fs');
  const credentials = {
    key: fs.readFileSync(process.env.SSL_KEY, 'utf8'),
    cert: fs.readFileSync(process.env.SSL_CERT, 'utf8'),
  };
  const server = https.createServer(credentials, proto);
  server.listen(process.env.PORT ? process.env.PORT - 0 : 49000);
} else {
  app.listen(process.env.PORT ? process.env.PORT - 0 : 49000);
}
