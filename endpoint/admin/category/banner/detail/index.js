module.exports = (app, BannerModel) => {
  class BannerDetailModel extends BannerModel {
    constructor(req) {
      super(req);
      this.bannerID = req.params?.bannerID - 0;
    }
    async delete(res) {
      await this.dao.serialize(async db => {
        const files = await db.get('select banner.imageUrl from banner where banner.id=?', [
          this.bannerID
        ]);
        if(files[0].imageUrl) {
          await this.file.del(rm => {
            rm(files[0].imageUrl);
          });
          await db.run('delete from banner where banner.id=?', [
            this.bannerID
          ]);
        }
        res.json({
          complete: true
        });
      });
    }
  }
  app(BannerDetailModel);
  app.delete();
}
