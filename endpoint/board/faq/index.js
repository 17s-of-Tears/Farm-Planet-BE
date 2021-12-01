module.exports = (app, BoardModel) => {
  class FAQModel extends BoardModel {
    constructor(req) {
      super(req);
    }
    async read(res) {
      await this.dao.serialize(async db => {
        const faqs = await db.get('select faq.id, faq.title, faq.createdAt, faq.hit from faq order by faq.id desc limit ?,?', [
          (this.page - 1) * this.pageSize, this.pageSize
        ]);
        const meta = await db.get('select count(*) as length from faq');
        const len = meta[0].length;
        const _meta = {
          page: {
            page: this.page,
            pageSize: this.pageSize,
            last: Math.ceil(len / this.pageSize),
            total: len,
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
  app.read();
  app.child('/:id', require('./detail'));
}
