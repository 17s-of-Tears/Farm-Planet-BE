module.exports = (app, Model) => {
  class SubscribeModel extends Model {
    constructor(req) {
      super(req);
      this.farmId = req.body?.farmId - 0;
    }

    async checkSubscribed(db) {
      const subscribe = await db.get('select subscribe.id, subscribe.farmId, subscribe.createdAt from subscribe where subscribe.userId=? and subscribe.subscribed=1', [
        this.requestUserID
      ]);
      return !!subscribe.length;
    }

    async create(res) {
      /* 구독 조건
          1. 구독중인 밭이 아님
          2. 등록된 밭임
          3. 내가 구독중인 밭이 없음
      */
      this.checkParameters(this.farmId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);

        if(await this.checkSubscribed(db)) {
          // 구독조건 3
          throw new SubscribeModel.Error400('SUBSCRIBE_EXISTS');
        }

        const farms = await db.get('select farm.id, sum(subscribe.subscribed) as subscribed from farm left join subscribe on farm.id=subscribe.farmId where farm.id=? group by farm.id', [
          this.farmId
        ]);
        if(!farms[0]) {
          // 구독조건 2
          throw new SubscribeModel.Error400('FARM_NOT_EXISTS');
        }
        if(farms[0].subscribed > 0) {
          // 구독조건 1
          throw new SubscribeModel.Error400('SUBSCRIBE_EXISTS');
        }

        const result = await db.run('insert into subscribe(farmId, userId, subscribed) values (?, ?, 1)', [
          this.farmId, this.requestUserID
        ]);
        res.status(201).json({
          subscribeId: result.lastID,
          complete: true,
        });
      });
    }

    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const subscribe = await db.get('select * from subscribe where subscribe.userId=? and subscribe.subscribed=1', [
          this.requestUserID
        ]);
        if(!subscribe[0]) {
          throw new SubscribeModel.Error404();
        }
        res.json(subscribe[0]);
      });
    }
  }
  app(SubscribeModel);
  app.create();
  app.child('/plant', require('./plant'));
};
