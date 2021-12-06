module.exports = (app, AdminAccountModel) => {
  class AdminAccountDetailModel extends AdminAccountModel {
    constructor(req) {
      super(req);
      this.adminID = req.params.adminID - 0;
    }

    async update(res) {
      this.checkParameters(this.name, this.adminID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const result = await db.run('update admin set admin.name=? where admin.id=? limit 1', [
          this.name, this.adminID
        ]);
        if(!result.affectedRows) {
          throw new AdminAccountDetailModel.Error403();
        }
        res.json({ complete: true });
      });
    }
  }

  app(AdminAccountDetailModel);
  app.update();
  app.child('/pw', require('./pw'));
}
