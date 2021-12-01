module.exports = (app, AdminModel) => {
  class CategoryModel extends AdminModel {
    constructor(req) {
      super(req);
      this.id = req.body?.id - 0;
      this.name = req.body?.name ?? null;
      this.description = req.body?.description ?? null;
      this.useFilesystem(req.file, '/img/category');
    }

    async create(res) {
      this.checkParameters(this.name);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        if(!this.file.size()) {
          throw new CategoryModel.Error400Parameter();
        }
        const result = await db.run('insert into plantCategory(name) values (?)', [
          this.name
        ]);
        await this.file.add(async file => {
          await db.run('update plantCategory set plantCategory.imageUrl=? where plantCategory.id=?', [
            `img/category/${file.uuid}`, result.lastID
          ]);
        });
        res.status(201).json({
          id: result.lastID,
        });
      }).catch(err => {
        this.file.withdraw && this.file.withdraw();
        throw err;
      });
    }

    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const categories = await db.get('select * from plantCategory limit ?,?', [
          (this.page - 1) * this.pageSize, this.pageSize
        ]);
        const meta = await db.get('select count(*) as length from plantCategory');
        const len = meta[0].length;
        res.json({
          _meta: {
            page: {
              current: this.page,
              last: Math.ceil(len / this.pageSize),
            }
          },
          categories,
        });
      });
    }
  }
  app(CategoryModel);
  app.create();
  app.read();
  app.child('/banner', require('./banner'));
  app.child('/plant', require('./plant'));
  app.child('/:categoryId', require('./detail'));
};
