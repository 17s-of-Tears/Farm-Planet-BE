module.exports = (app, SubscribeDetailModel) => {
  class SubscribePlantModel extends SubscribeDetailModel {
    async read(res) {
      this.checkParameters(this.subscribeId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const plants = await db.get('select subscribePlant.id, plant.name, plant.imageUrl from subscribePlant left join plant on subscribePlant.plantId=plant.id where subscribePlant.subscribeId=?', [
          this.subscribeId,
        ]);
        res.json(plants);
      });
    }
  }
  app(SubscribePlantModel);
  app.read();
  app.child('/:subscribePlantId', require('./detail'));
};
