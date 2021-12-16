module.exports = (app, SubscribeModel) => {
  class SubscribePlantModel extends SubscribeModel {
    constructor(req) {
      super(req);
      const arr = req.body?.plants;
      this.plants = (arr?.map ? arr.map(r => r - 0) : NaN);
    }

    async checkSubscribed(db) {
      const subscribe = await db.get('select subscribe.id from subscribe where subscribe.userId=? and subscribe.subscribed=1 and subscribe.pending=1', [
        this.requestUserID
      ]);
      return !!subscribe.length;
    }

    async create(res) {
      /* 작물 재배 조건
          1. 구독이 subscribed=1이며 pending=1이어야 함
          2. 등록된 작물임(plant)
      */
      this.checkParameters(this.plants);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);

        if(!await this.checkSubscribed(db)) {
          // 작물 재배 조건 1
          throw new SubscribePlantModel.Error400('SUBSCRIBE_PENDING_NOT_EXISTS');
        }
        for(const plantId of this.plants) {
          // toString을 사용해 where ~ in을 사용할 수 있지만 sql인젝션의 가능성을 대비해서 성능의 희생을 감수함
          const plants = await db.get('select plant.id from plant where plant.id=?', [
            plantId
          ]);
          if(!plants[0]) {
            // 작물 재배 조건 2
            throw new SubscribePlantModel.Error400('PLANT_NOT_EXISTS');
          }
          const result = await db.run('insert into subscribePlant(plantId, subscribeId) select ? as plantId, subscribe.id from subscribe where subscribe.userId=? and subscribe.subscribed=1 and subscribe.pending=1', [
            plantId, this.requestUserID
          ]);
          if(!result.affectedRows) {
            throw new SubscribePlantModel.Error403Forbidden();
          }
        }
        await db.run('update subscribe set pending=0 where subscribe.userId=? and subscribe.subscribed=1 and subscribe.pending=1', [
          this.requestUserID
        ]);
        res.status(201).json({
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
          throw new SubscribePlantModel.Error404();
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
