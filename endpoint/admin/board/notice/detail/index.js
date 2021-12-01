module.exports = (app, NoticeModel) => {
  class NoticeDetailModel extends NoticeModel {
    async read(res) {
      this.checkParameters(this.contentID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const notices = await db.get('select notice.title, notice.content, notice.createdAt, notice.hit from notice where notice.id=?', [
          this.contentID
        ]);
        if(!notices[0]) {
          throw new NoticeDetailModel.Error404();
        }
        res.json(notices[0]);
      });
    }
    async update(res) {
      this.checkParameters(this.title, this.content, this.contentID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const result = await db.run('update notice set notice.title=?, notice.content=? where notice.id=?', [
          this.title, this.content, this.contentID
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
        const result = await db.run('delete from notice where notice.id=?', [
          this.contentID
        ]);
        if(!result.affectedRows) {
          throw new NoticeDetailModel.Error403();
        }
        res.json({ complete: true });
      });
    }
  }
  app(NoticeDetailModel);
  app.read();
  app.update();
  app.delete();
}
