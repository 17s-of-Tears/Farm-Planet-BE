module.exports = (app, NoticeModel) => {
  class NoticeDetailModel extends NoticeModel {
    async read(res) {
      this.checkParameters(this.contentID);
      await this.dao.serialize(async db => {
        const notices = await db.get('select notice.title, notice.content, notice.createdAt, notice.hit from notice where notice.id=?', [
          this.contentID
        ]);
        await db.run('update notice set notice.hit=notice.hit+1 where notice.id=?', [
          this.contentID
        ]);
        if(!notices[0]) {
          throw new NoticeDetailModel.Error404();
        }
        res.json(notices[0]);
      });
    }
  }
  app(NoticeDetailModel);
  app.read();
}
