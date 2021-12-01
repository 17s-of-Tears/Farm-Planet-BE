module.exports = (app, Model) => {
  class UserModel extends Model {
    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const users = await db.get('select user.name, user.createdAt as date, user.imageUrl as profileImg from user where user.id=?', [
          this.requestUserID
        ]);
        if(!users[0]) {
          throw new UserModel.Error404();
        }
        res.json(users[0]);
      });
    }
  }
  app(UserModel);
  app.read();
};
