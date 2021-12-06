const bcrypt = require('bcrypt');
const crypto = require('crypto');
const uuidv4 = require('uuid').v4;
module.exports = (app, AdminModel) => {
  class AdminAccountModel extends AdminModel {
    constructor(req) {
      super(req);
      this.accountID = req.body?.accountID;
      this.name = req.body?.name;
    }

    async createRandomPassword() {
      const password = crypto.randomBytes(8).toString('hex');
      const hash = await bcrypt.hash(password, 10);
      return {
        password,
        hash,
      };
    }

    createFresh() {
      return uuidv4();
    }

    async create(res) {
      this.checkParameters(this.name, this.accountID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const admins = await db.get('select * from admin where admin.accountID=?', [
          this.accountID
        ]);
        if(admins[0]) {
          throw new AdminAccountModel.Error400('ACCOUNT_EXISTS');
        }
        const { password, hash } = await this.createRandomPassword();
        const fresh = this.createFresh();
        const result = await db.run('insert into admin (name, accountID, password, fresh) values (?, ?, ?, ?)', [
          this.name, this.accountID, hash, fresh
        ]);
        if(!result.affectedRows) {
          throw new Error('DB_ERROR');
        }
        res.status(201).json({ id: result.lastID, complete: true, password, });
      });
    }

    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const admins = await db.get('select admin.id, admin.name, admin.accountID, admin.createdAt from admin order by admin.id desc limit ?,?', [
          (this.page - 1) * this.pageSize, this.pageSize
        ]);
        const meta = await db.get('select count(*) as length from admin');
        const len = meta[0].length;
        const _meta = {
          page: {
            current: this.page,
            last: Math.ceil(len / this.pageSize),
          },
        };
        res.json({
          _meta,
          admins,
        });
      });
    }
  }
  app(AdminAccountModel);
  app.create();
  app.read();
  app.child('/:adminID', require('./detail'));
}
