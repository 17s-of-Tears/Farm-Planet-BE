module.exports = (app, CategoryModel) => {
  class CategoryDetailModel extends CategoryModel {
    constructor(req) {
      super(req);
      this.categoryId = req.params.categoryId - 0;
    }
    async read(res) {
      this.checkParameters(this.categoryId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const categories = await db.get('select * from plantCategory where id=?', [
          this.categoryId
        ]);
        if(!categories[0]) {
          throw new CategoryDetailModel.Error404();
        }
        res.json(categories[0]);
      });
    }
    async update(res) {
      this.checkParameters(this.name, this.categoryId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const result = await db.run('update plantCategory set plantCategory.name=? where plantCategory.id=?', [
          this.name, this.categoryId
        ]);
        if(this.file.size()) {
          const categories = await db.get('select imageUrl from plantCategory where plantCategory.id=?', [
            this.categoryId
          ]);
          await this.file.add(async file => {
            await db.run('update plantCategory set plantCategory.imageUrl=? where plantCategory.id=?', [
              `img/category/${file.uuid}`, this.plantId
            ]);
          });
          if(plants[0]?.imageUrl) {
            await this.file.del(remover => {
              remover(categories[0].imageUrl);
            });
          }
        }
        res.json({
          complete: true,
        });
      });
    }
    async delete(res) {
      this.checkParameters(this.categoryId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const categories = await db.get('select imageUrl from plantCategory where plantCategory.id=?', [
          this.categoryId
        ]);
        await db.run('delete from plantCategory where id=?', [
          this.categoryId
        ]);
        if(categories[0]?.imageUrl) {
          await this.file.del(remover => {
            remover(categories[0].imageUrl);
          });
        }
        res.json({
          complete: true,
        });
      });
    }
  }
  app(CategoryDetailModel);
  app.read();
  app.update();
  app.delete();
}
