module.exports = (app, BoardModel) => {
  class NoticeModel extends BoardModel {
    constructor(req) {
      super(req);
      this.title = req.body?.title;
      this.content = req.body?.content;
    }
    async create(res) {
      this.checkParameters(this.title, this.content);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const result = await db.run('insert into notice (title, content) values (?, ?)', [
          this.title, this.content
        ]);
        if(!result.affectedRows) {
          throw new Error('DB_ERROR');
        }
        res.status(201).json({
          id: result.lastID,
          complete: true,
        });
      });
    }
    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
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
  app.create();
  app.read();
  app.child('/:id', require('./detail'));
}
