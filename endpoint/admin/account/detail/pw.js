module.exports = (app, AdminAccountDetailModel) => {
  class PasswordResetModel extends AdminAccountDetailModel {
    async update(res) {
      this.checkParameters(this.adminID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const { password, hash } = await this.createRandomPassword();
        const fresh = this.createFresh();
        const result = await db.run('update admin set admin.password=?, admin.fresh=? where admin.id=? limit 1', [
          hash, fresh, this.adminID
        ]);
        if(!result.affectedRows) {
          throw new AdminAccountDetailModel.Error403();
        }
        res.json({ complete: true, password, });
      });
    }
  }
  app(PasswordResetModel);
  app.update();
};
