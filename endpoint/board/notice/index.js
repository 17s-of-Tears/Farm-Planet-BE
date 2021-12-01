module.exports = (app, BoardModel) => {
  class NoticeModel extends BoardModel {
    constructor(req) {
      super(req);
    }
    async read(res) {
      await this.dao.serialize(async db => {
        const notices = await db.get('select notice.id, notice.title, notice.createdAt, notice.hit from notice order by notice.id desc limit ?,?', [
          (this.page - 1) * this.pageSize, this.pageSize
        ]);
        const meta = await db.get('select count(*) as length from notice');
        const len = meta[0].length;
        const _meta = {
          page: {
            current: this.page,
            last: Math.ceil(len / this.pageSize),
          },
        };
        res.json({
          _meta,
          notices,
        });
      });
    }
  }
  app(NoticeModel);
  app.read();
  app.child('/:id', require('./detail'));
}
