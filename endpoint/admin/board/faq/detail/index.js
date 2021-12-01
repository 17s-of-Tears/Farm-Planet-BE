module.exports = (app, FAQModel) => {
  class FAQDetailModel extends FAQModel {
    async read(res) {
      this.checkParameters(this.contentID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const faqs = await db.get('select faq.title, faq.question, faq.ask, faq.createdAt, faq.hit from faq where faq.id=?', [
          this.contentID
        ]);
        if(!faqs[0]) {
          throw new FAQDetailModel.Error404();
        }
        res.json(faqs[0]);
      });
    }
    async update(res) {
      this.checkParameters(this.title, this.question, this.ask, this.contentID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const result = await db.run('update faq set faq.title=?, faq.question=?, faq.ask=? where faq.id=?', [
          this.title, this.question, this.ask, this.contentID
        ]);
        if(!result.affectedRows) {
          throw new NoticeDetailModel.Error403();
        }
        res.json({ complete: true });
      });
    }
    async delete(res) {
      this.checkParameters(this.contentID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const result = await db.run('delete from faq where faq.id=?', [
          this.contentID
        ]);
        if(!result.affectedRows) {
          throw new NoticeDetailModel.Error403();
        }
        res.json({ complete: true });
      });
    }
  }
  app(FAQDetailModel);
  app.read();
  app.update();
  app.delete();
}
