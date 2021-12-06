module.exports = (app, FarmModel) => {
  class FarmDetailModel extends FarmModel {
    constructor(req) {
      super(req);
      this.farmID = req.params.farmID - 0;
    }
    async read(res) {
      this.checkParameters(this.farmID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const farms = await db.get('select * from farm where id=?', [
          this.farmID
        ]);
        if(!farms[0]) {
          throw new FarmDetailModel.Error404();
        }
        res.json(farms[0]);
      });
    }

    async delete(res) {
      this.checkParameters(this.farmID);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const files = await db.get('select farm.imageUrl from farm where farm.id=?', [
          this.farmID
        ]);
        if(files[0].imageUrl) {
          await this.file.del(rm => {
            rm(files[0].imageUrl);
          });
        }
        await db.run('delete from farm where farm.id=? limit 1', [
          this.farmID
        ]);
        res.json({
          complete: true
        });
      });
    }
  }
  app(FarmDetailModel);
  app.read();
  app.delete();
}
