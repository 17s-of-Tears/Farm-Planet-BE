module.exports = (app, Model) => {
  class AdminModel extends Model {
    async checkAuthorized(db) {
      if(!this.requestUserID || this.admin !== 1) {
        throw new AdminModel.Error401();
      }
      const admins = await db.get('select admin.fresh from admin where admin.id=?', [
        this.requestUserID
      ]);
      const fresh = admins[0]?.fresh;
      if(fresh !== this.fresh) {
        throw new AdminModel.Error401();
      }
    }

    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const admins = await db.get('select id, name from admin where id=?', [
          this.requestUserID
        ]);
        if(!admins[0]) {
          throw new AdminModel.Error403();
        }
        res.json(admins[0]);
      });
    }
  }

  app(AdminModel);
  app.read();
  app.middlewares(AdminModel.SingleFile);
  app.child('/account', require('./account'));
  app.child('/board', require('./board'));
  app.child('/category', require('./category'));
  app.child('/farm', require('./farm'));
  app.child('/sign', require('./sign'));
  app.child('/subscribe', require('./subscribe'));
  app.child('/user', require('./user'));
}
