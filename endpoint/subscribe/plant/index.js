module.exports = (app, SubscribeModel) => {
  class SubscribePlantModel extends SubscribeModel {
    constructor(req) {
      super(req);
      this.plantId = req.body?.plantId - 0;
    }

    async create(res) {
      /* 작물 재배 조건
          1. 밭 구독중임(subscribe)
          2. 등록된 작물임(plant)
          3. 재배중이지 않은 작물임(subscribePlant)
      */
      this.checkParameters(this.plantId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);

        if(!await this.checkSubscribed(db)) {
          // 작물 재배 조건 1
          throw new SubscribePlantModel.Error400('SUBSCRIBE_NOT_EXIST');
        }
        const plants = await db.get('select plant.id, count(subscribePlant.expired=0)=0 as isCanBePublish from plant left join subscribePlant on plant.id=subscribePlant.plantId left join subscribe on subscribePlant.subscribeId=subscribe.id where plant.id=?', [
          this.plantId
        ]);
        if(!plants[0]) {
          // 작물 재배 조건 2
          throw new SubscribePlantModel.Error400('PLANT_NOT_EXISTS');
        }
        if(!plants[0].isCanBePublish) {
          // 작물 재배 조건 3
          throw new SubscribePlantModel.Error400('PLANT_SUBSCRIBE_EXISTS');
        }

        const result = await db.run('insert into subscribePlant(plantId, subscribeId) select ? as plantId, subscribe.id from subscribe where subscribe.userId=? and subscribe.subscribed=1', [
          this.plantId, this.requestUserID
        ]);
        res.status(201).json({
          subscribePlantId: result.lastID,
          complete: true,
        });
      });
    }

    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const subscribe = await db.get('select * from subscribe where subscribe.subscribed=1 and subscribe.userId=?', [
          this.requestUserID
        ]);
        if(!subscribe[0]) {
          SubscribePlantModel.Error404();
        }
        const plants = await db.get(`select plant.name, plant.description, concat('[', group_concat('{"imageUrl":"', subscribePlantState.imageUrl, '", "createdAt":"', subscribePlantState.createdAt, '"}' order by subscribePlantState.id desc), ']') as json from subscribe left join subscribePlant on subscribe.id=subscribePlant.subscribeId left join plant on subscribePlant.plantId=plant.id left join subscribePlantState on subscribePlant.id=subscribePlantState.subscribePlantId where subscribe.id=? group by subscribePlant.id`, [
          subscribe[0].id,
        ]);
        const parsed = plants.map(row => ({
          name: row.name,
          states: JSON.parse(row.json),
        }));
        res.json(parsed);
      });
    }
  }
  app(SubscribePlantModel);
  app.create();
  app.read();
};
