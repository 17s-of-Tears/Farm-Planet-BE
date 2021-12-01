// upload
const Model = require('./model');
const multer = require('multer');
const uuidv4 = require('uuid').v4;
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, '/home/ky/tmp');
  },
  filename(req, file, cb) {
    const extname = checkMimetype(file);
    if(extname) {
      const uuid = uuidv4().replace(/-/gi, '');
      cb(null, `${uuid}.${extname}`);
    } else {
      //cb(new Model.Error400('INVALID_FILE_TYPE'));
      cb(new Error('INVALID_FILE_TYPE'));
    }
  }
});
function checkMimetype(file) {
  let type;
  if(file.mimetype === 'image/png') {
    return 'png';
  }
  if(file.mimetype === 'image/jpeg') {
    return 'jpg';
  }
  if(file.mimetype === 'image/gif') {
    return 'gif';
  }
  return false;
}
module.exports = multer({
  storage,
  limits: {
    fieldSize: '2MB',
    fields: 5,
    fileSize: '10MB'
  },
});
