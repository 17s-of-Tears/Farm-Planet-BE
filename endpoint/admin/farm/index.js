module.exports = (app, AdminModel) => {
  class FarmModel extends AdminModel {
    constructor(req) {
      super(req);
      this.name = req.body?.name ?? null;
      this.yard = req.body?.yard ?? null;
      this.address = req.body?.address ?? null;
      this.locationX = req.body?.locationX - 0;
      this.locationY = req.body?.locationY - 0;
      this.useFilesystem(req.file, 'img/farm');
    }

    async create(res) {
      await this.file.serialize(async files => {
        this.checkParameters(this.name, this.yard, this.address, this.locationX, this.locationY);
        await this.dao.serialize(async db => {
          await this.checkAuthorized(db);
          const result = await db.run('insert into farm(name, yard, address, locationX, locationY) values(?, ?, ?, ?, ?)', [
            this.name, this.yard, this.address, this.locationX, this.locationY
          ]);
          if(files.size()) {
            for(const file of files) {
              await db.run('update farm set farm.imageUrl=? where farm.id=? limit 1', [
                `${file.saveDir}/${file.saveName}`, result.lastID
              ]);
            }
          }
          res.status(201).json({
            id: result.lastID,
            complete: true,
          });
        });
      });
    }

    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const farms = await db.get('select * from farm limit ?,?', [
          (this.page - 1) * this.pageSize, this.pageSize
        ]);
        const meta = await db.get('select count(*) as length from farm');
        const len = meta[0].length;
        res.json({
          _meta: {
            page: {
              current: this.page,
              last: Math.ceil(len / this.pageSize),
            },
          },
          farms,
        });
      });
    }
  }
  app(FarmModel);
  app.create();
  app.read();
  app.child('/:farmID', require('./detail'));
}
