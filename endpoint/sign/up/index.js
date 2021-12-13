module.exports = (app, SignModel) => {
  class SignUpModel extends SignModel {
    constructor(req) {
      super(req);
      this.name = req.body?.name ?? null;
    }

    async create(res) {
      this.checkParameters(this.name, this.accountID, this.rawPassword);
      await this.dao.serialize(async db => {
        const users = await db.get('select * from user where user.accountID=? and user.accountType=?', [
          this.accountID, SignUpModel.ACCOUNT_TYPE_LOCAL
        ]);
        if(users[0]) {
          throw new SignUpModel.Error400('USER_EXISTS');
        }
        // rawPassword 암호화
        const hashPassword = await this.createHash(this.rawPassword);
        const fresh = this.createFresh();
        const result = await db.run('insert into user (name, accountID, accountType, password, fresh) values (?, ?, ?, ?, ?)', [
          this.name, this.accountID, SignUpModel.ACCOUNT_TYPE_LOCAL, hashPassword, fresh
        ]);
        if(!result.affectedRows) {
          throw new Error('DB_ERROR');
        }
        res.status(201).json({ id: result.lastID, complete: true });
      });
    }
  }
  app(SignUpModel);
  app.create();
}
