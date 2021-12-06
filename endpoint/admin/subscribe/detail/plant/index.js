module.exports = (app, SubscribeDetailModel) => {
  class SubscribePlantModel extends SubscribeDetailModel {
    async read(res) {
      this.checkParameters(this.subscribeId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const plants = await db.get('select subscribePlant.id, plant.name from subscribePlant left join plant on subscribePlant.plantId=plant.id where subscribePlant.subscribeId=?', [
          this.subscribeId,
        ]);
        if(!plants[0]) {
          throw new SubscribePlantModel.Error404();
        }
        res.json(plants[0]);
      });
    }
  }
  app(SubscribePlantModel);
  app.read();
  app.child('/:subscribePlantId', require('./detail'));
};
