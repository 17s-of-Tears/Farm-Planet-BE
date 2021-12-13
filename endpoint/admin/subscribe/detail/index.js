module.exports = (app, SubscribeModel) => {
  class SubscribeDetailModel extends SubscribeModel {
    constructor(req) {
      super(req);
      this.subscribeId = req.params?.subscribeId - 0;
    }

    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const subscribe = await db.get('select subscribe.id, farm.id as farmId, farm.name as farmName, user.name as userName, subscribe.createdAt, farm.imageUrl, count(subscribePlant.id) as plants from subscribe left join user on subscribe.userId=user.id left join farm on subscribe.farmId=farm.id left join subscribePlant on subscribe.id=subscribePlant.subscribeId where subscribe.id=? order by subscribe.id desc', [
          this.subscribeId
        ]);
        if(!subscribe[0]) {
          throw new SubscribeDetailModel.Error404();
        }
        res.json(subscribe[0]);
      });
    }
  }
  app(SubscribeDetailModel);
  app.read();
  app.child('/plant', require('./plant'));
}
