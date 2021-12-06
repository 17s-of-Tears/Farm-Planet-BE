module.exports = (app, AdminModel) => {
  class UserModel extends AdminModel {
    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const users = await db.get('select user.id, user.name, user.accountID, user.createdAt, user.imageUrl from user order by user.id desc limit ?,?', [
          (this.page - 1) * this.pageSize, this.pageSize
        ]);
        const meta = await db.get('select count(*) as length from user');
        const len = meta[0].length;
        const _meta = {
          page: {
            current: this.page,
            last: Math.ceil(len / this.pageSize),
          },
        };
        res.json({
          _meta,
          users,
        });
      });
    }
  }
  app(UserModel);
  app.read();
  app.child('/:userID', require('./detail'));
}
