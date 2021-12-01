module.exports = (app, Model) => {
  class BannerModel extends Model {
    constructor(req) {
      super(req);
      this.categoryId = req.params.categoryId;
    }
    async read(res) {
      await this.dao.serialize(async db => {
        const categories = await db.get('select * from plantCategory where plantCategory.id=?', [
          this.categoryId
        ]);
        const plants = await db.get('select * from plant where plant.categoryId=?', [
          this.categoryId
        ]);
        res.json({
          _meta: null,
          ...categories[0],
          plants,
        });
      });
    }
  }
  app(BannerModel);
  app.read();
}
