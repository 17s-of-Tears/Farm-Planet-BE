module.exports = (app, PlantModel) => {
  class PlantDetailModel extends PlantModel {
    constructor(req) {
      super(req);
      this.plantId = req.params.plantId - 0;
    }
    async read(res) {
      this.checkParameters(this.plantId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const plants = await db.get('select * from plant where id=?', [
          this.plantId
        ]);
        if(!plants[0]) {
          throw new PlantDetailModel.Error404();
        }
        res.json(plants[0]);
      });
    }
    async update(res) {
      this.checkParameters(this.name, this.description, this.categoryId, this.plantId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const result = await db.run('update plant set plant.name=?, plant.description=?, plant.categoryId=? where plant.id=?', [
          this.name, this.description, this.categoryId, this.plantId
        ]);
        if(this.file.size()) {
          const plants = await db.get('select imageUrl from plant where plant.id=?', [
            this.plantId
          ]);
          await this.file.add(async file => {
            await db.run('update plant set plant.imageUrl=? where plant.id=?', [
              `img/plant/${file.uuid}`, this.plantId
            ]);
          });
          if(plants[0]?.imageUrl) {
            await this.file.del(remover => {
              remover(plants[0].imageUrl);
            });
          }
        }
        res.json({
          complete: true,
        });
      });
    }
    async delete(res) {
      this.checkParameters(this.plantId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const plants = await db.get('select imageUrl from plant where plant.id=?', [
          this.plantId
        ]);
        await db.run('delete from plant where id=?', [
          this.plantId
        ]);
        if(plants[0]?.imageUrl) {
          await this.file.del(remover => {
            remover(plants[0].imageUrl);
          });
        }
        res.json({
          complete: true,
        });
      });
    }
  }
  app(PlantDetailModel);
  app.read();
  app.update();
  app.delete();
};
