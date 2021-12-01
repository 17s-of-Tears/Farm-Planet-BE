module.exports = (app) => {
  const Model = require('./model');
  app(Model);
  app.child('/admin', require('./admin'));
  app.child('/board', require('./board'));
  app.child('/sign', require('./sign'));
  app.child('/user/me', require('./user'));
  app.child('/category', require('./category'));
}
