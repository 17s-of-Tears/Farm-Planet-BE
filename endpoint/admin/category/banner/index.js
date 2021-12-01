module.exports = (app, CategoryModel) => {
  class BannerModel extends CategoryModel {
    constructor(req) {
      super(req);
      this.useFilesystem(req.file, '/img/banner');
    }
    async create(res) {
      await this.dao.serialize(async db => {
        if(!this.file.size()) {
          throw new BannerModel.Error400Parameter();
        }
        await this.file.add(async file => {
          await this.checkAuthorized(db);
          const relativePath = `img/banner/${file.uuid}`;
          const result = await db.run('insert into banner(imageUrl) values(?)', [
            relativePath
          ]);
          if(!result.affectedRows) {
            throw new Error('DB_ERROR');
          }
          res.status(201).json({
            id: result.lastID,
            imageUrl: relativePath,
            complete: true,
          });
        });
      }).catch(err => {
        this.file.withdraw && this.file.withdraw();
        throw err;
      });
    }
    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const banners = await db.get('select * from banner');
        res.json(banners);
      });
    }
  }
  app(BannerModel);
  app.middlewares([
    BannerModel.SingleFile
  ]);
  app.create();
  app.read();
  app.child('/:bannerID', require('./detail'));
}
