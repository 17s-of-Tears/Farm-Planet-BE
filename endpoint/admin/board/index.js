module.exports = (app, AdminModel) => {
  class BoardModel extends AdminModel {
    constructor(req) {
      super(req);
      this.contentID = req.params.id;
    }
  }
  app(BoardModel);
  app.child('/notice', require('./notice'));
  app.child('/faq', require('./faq'));
}
