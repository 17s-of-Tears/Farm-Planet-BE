module.exports = (app, Model) => {
  class BoardModel extends Model {
    constructor(req) {
      super(req);
      this.contentID = req.params.id;
      this.page = (req.query.page ?? 1) - 0;
      if(this.page < 1) {
        this.page = 1;
      }
      this.pageSize = (req.query.pageSize ?? 15) - 0;
    }
  }
  app(BoardModel);
  app.child('/notice', require('./notice'));
  app.child('/faq', require('./faq'));
}
