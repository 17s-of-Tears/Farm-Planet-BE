module.exports = (app, CategoryModel) => {
  class PlantModel extends CategoryModel {
    constructor(req) {
      super(req);
      this.categoryId = req.body?.categoryId - 0 || null;
      this.useFilesystem(req.file, '/img/plant');
    }

    async create(res) {
      this.checkParameters(this.name, this.description, this.categoryId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const result = await db.run('insert into plant(name, description, categoryId) values (?, ?, ?)', [
          this.name, this.description, this.categoryId
        ]);
        if(this.file.size()) {
          await this.file.add(async file => {
            await db.run('update plant set plant.imageUrl=? where plant.id=?', [
              `img/plant/${file.uuid}`, result.lastID
            ]);
          });
        }
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
        const plants = await db.get('select * from plant limit ?,?', [
          (this.page - 1) * this.pageSize, this.pageSize
        ]);
        const meta = await db.get('select count(*) as length from plant');
        const len = meta[0].length;
        res.json({
          _meta: {
            page: {
              current: this.page,
              last: Math.ceil(len / this.pageSize),
            }
          },
          plants,
        });
      });
    }
  }
  app(PlantModel);
  app.create();
  app.read();
  app.child('/:plantId', require('./detail'));
};
