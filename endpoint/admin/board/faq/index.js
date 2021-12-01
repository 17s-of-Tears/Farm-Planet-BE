module.exports = (app, BoardModel) => {
  class FAQModel extends BoardModel {
    constructor(req) {
      super(req);
      this.title = req.body?.title;
      this.question = req.body?.question;
      this.ask = req.body?.ask;
    }

    async create(res) {
      this.checkParameters(this.title, this.question, this.ask);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const result = await db.run('insert into faq (title, question, ask) values (?, ?, ?)', [
          this.title, this.question, this.ask
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
        const faqs = await db.get('select faq.id, faq.title, faq.createdAt, faq.hit from faq order by faq.id desc limit ?,?', [
          (this.page - 1) * this.pageSize, this.pageSize
        ]);
        const meta = await db.get('select count(*) as length from faq');
        const len = meta[0].length;
        const _meta = {
          page: {
            current: this.page,
            last: Math.ceil(len / this.pageSize),
          },
        };
        res.json({
          _meta,
          faqs,
        });
      });
    }
  }
  app(FAQModel);
  app.create();
  app.read();
  app.child('/:id', require('./detail'));
}
