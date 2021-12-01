const DAO = require('../loadModules').DAO;
const FileSystem = require('../loadModules').FileSystem;
const multer = require('./file');
class Error400Parameter extends Error {}
class Error400 extends Error {}
class Error401 extends Error {}
class Error403Forbidden extends Error {}
class Error404 extends Error {}

class Model {
  static Error400Parameter = Error400Parameter;
  static Error400 = Error400;
  static Error401 = Error401;
  static Error403Forbidden = Error403Forbidden;
  static Error404 = Error404;
  static SingleFile = multer.single('image');

  constructor(req) {
    this.dao = new DAO(); // db 상호작용에 사용
    this.requestUserID = req.session?.userID;
    this.fresh = req.session?.fresh;
    this.admin = req.session?.admin
    this.file = null; // useFilesystem을 호출하는 자식 생성자에서만 사용.

    this.page = (req.query.page ?? 1) - 0;
    this.pageSize = (req.query.pageSize ?? 15) - 0;
  }

  useFilesystem(file, dir) {
    this.file = new FileSystem(file, dir);
  }

  async checkAuthorized(db) {
    if(!this.requestUserID || this.admin !== 0) {
      throw new Error401();
    }
    const users = await db.get('select user.fresh from user where user.id=?', [
      this.requestUserID
    ]);
    const fresh = users[0]?.fresh;
    if(fresh !== this.fresh) {
      throw new Error401();
    }
  }

  checkParameters() {
    for(const arg of arguments) {
      if(arg === undefined || arg === NaN) {
        throw new Error400Parameter();
      }
    }
  }
}
module.exports = Model;
