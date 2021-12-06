module.exports = (app, UserModel) => {
  class UserDetailModel extends UserModel {
    constructor(req) {
      super(req);
      this.userID = req.params.userID - 0;
      this.name = req.body?.name ?? null;
    }

    async update(res) {
      this.checkParameters(this.name, this.userID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const result = await db.run('update user set user.name=? where user.id=? limit 1', [
          this.name, this.userID
        ]);
        if(!result.affectedRows) {
          throw new UserDetailModel.Error403();
        }
        res.json({ complete: true });
      });
    }

    async delete(res) {
      this.checkParameters(this.userID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const result = await db.run('delete from user where user.id=? limit 1', [
          this.userID
        ]);
        if(!result.affectedRows) {
          throw new UserDetailModel.Error403();
        }
        res.json({ complete: true });
      });
    }
  }

  app(UserDetailModel);
  app.update();
  app.delete();
}
