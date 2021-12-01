const bcrypt = require('bcrypt');
const uuidv4 = require('uuid').v4;
const ACCOUNT_TYPE_LOCAL = 0;
module.exports = (app, Model) => {
  class SignModel extends Model {
    static ACCOUNT_TYPE_LOCAL = 0;
    constructor(req) {
      super(req);
      this.accountID = req.body.id;
      this.rawPassword = req.body.password;
      this.rawNewPassword = req.body.newPassword;
      this.session = {
        sign: user => {
          req.session.userID = user.id;
          req.session.fresh = user.fresh;
          req.session.admin = 0;
          req.session.save();
        },
        destroy: () => {
          req.session.destroy();
        }
      };
    }

    async createHash(rawPassword) {
      return await bcrypt.hash(rawPassword, 10);
    }

    async verifyHash(hashPassword) {
      return await bcrypt.compare(this.rawPassword, hashPassword);
    }

    async read(res) {
      res.json({ userID: this.requestUserID });
    }

    createFresh() {
      return uuidv4();
    }

    async create(res) {
      // 세션 생성
      this.checkParameters(this.accountID);
      await this.dao.serialize(async db => {
        const users = await db.get('select user.id, user.password, user.fresh from user where user.accountID=? and user.accountType=?', [
          this.accountID, ACCOUNT_TYPE_LOCAL
        ]);
        if(!users[0] || !await this.verifyHash(users[0].password)) {
          throw new SignModel.Error400('INVALID_PASSWORD');
        }
        this.session.sign(users[0]);
        res.status(201).json({ id: users[0].id, complete: true });
      });
    }

    async update(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        // 현재 로그인중인 사용자 정보 획득
        const users = await db.get('select user.password from user where user.id=?', [
          this.requestUserID
        ]);
        // 현재 비밀번호와 일치하는지 검사
        if(!users[0] || !await this.verifyHash(users[0].password)) {
          throw new SignModel.Error400('INVALID_PASSWORD');
        }
        // 새 비밀번호 암호화 및 refresh 재생성
        const hashPassword = await this.createHash(this.rawNewPassword);
        const fresh = this.createFresh();
        // db에 적용
        await db.run('update user set user.password=? and user.fresh=? and user.id=?', [
          hashPassword, fresh, this.requestUserID
        ]);
        // 현재 세션에 적용
        this.session.sign({
          id: this.requestUserID,
          fresh,
        });
        res.json({ id: users[0].id, complete: true });
      });
    }

    async delete(res) {
      // 세션 삭제
      this.session.destroy();
      res.json({ complete: true });
    }
  }
  app(SignModel);
  app.create();
  app.read(); // 임시
  app.update();
  app.delete();
  app.child('/up', require('./up'));
}
