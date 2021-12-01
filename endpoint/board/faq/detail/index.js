module.exports = (app, FAQModel) => {
  class FAQDetailModel extends FAQModel {
    async read(res) {
      this.checkParameters(this.contentID);
      await this.dao.serialize(async db => {
        const faqs = await db.get('select faq.title, faq.question, faq.answer, faq.createdAt, faq.hit from faq where faq.id=?', [
          this.contentID
        ]);
        await db.run('update faq set faq.hit=faq.hit+1 where faq.id=?', [
          this.contentID
        ]);
        if(!faqs[0]) {
          throw new FAQDetailModel.Error404();
        }
        res.json(faqs[0]);
      });
    }
  }
  app(FAQDetailModel);
  app.read();
}
