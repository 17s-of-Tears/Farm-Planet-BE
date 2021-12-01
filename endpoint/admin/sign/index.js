const bcrypt = require('bcrypt');
const uuidv4 = require('uuid').v4;
module.exports = (app, AdminModel) => {
  class SignModel extends AdminModel {
    constructor(req) {
      super(req);
      this.accountID = req.body.id;
      this.rawPassword = req.body.password;
      this.rawNewPassword = req.body.newPassword;
      this.session = {
        sign: user => {
          req.session.userID = user.id;
          req.session.fresh = user.fresh;
          req.session.admin = 1;
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

    createFresh() {
      return uuidv4();
    }

    async create(res) {
      // 세션 생성
      this.checkParameters(this.accountID);
      await this.dao.serialize(async db => {
        const admins = await db.get('select admin.id, admin.password, admin.fresh from admin where admin.accountID=?', [
          this.accountID
        ]);
        if(!admins[0] || !await this.verifyHash(admins[0].password)) {
          throw new SignModel.Error400('INVALID_PASSWORD');
        }
        this.session.sign(admins[0]);
        res.status(201).json({ id: admins[0].id, complete: true });
      });
    }

    async update(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        // 현재 로그인중인 사용자 정보 획득
        const admins = await db.get('select admin.password from admin where admin.id=?', [
          this.requestUserID
        ]);
        // 현재 비밀번호와 일치하는지 검사
        if(!admins[0] || !await this.verifyHash(admins[0].password)) {
          throw new SignModel.Error400('INVALID_PASSWORD');
        }
        // 새 비밀번호 암호화 및 refresh 재생성
        const hashPassword = await this.createHash(this.rawNewPassword);
        const fresh = this.createFresh();
        // db에 적용
        await db.run('update admin set admin.password=? and admin.fresh=? and admin.id=?', [
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
  app.update();
  app.delete();
}
