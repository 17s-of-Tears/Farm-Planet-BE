module.exports = (app, Model) => {
  class SubscribeModel extends Model {
    constructor(req) {
      super(req);
      this.farmName = req.body?.farmName;
      this.level = req.body?.level - 0;
    }

    async checkSubscribed(db) {
      const subscribe = await db.get('select subscribe.id, subscribe.createdAt from subscribe where subscribe.userId=? and subscribe.subscribed=1', [
        this.requestUserID
      ]);
      return !!subscribe.length;
    }

    async create(res) {
      /* 구독 조건
          1. 내가 구독중인 것이 없음(subscribed=1이 하나도 있어서는 안됨)
      */
      this.checkParameters(this.farmName, this.level);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);

        if(await this.checkSubscribed(db)) {
          // 구독조건 1
          throw new SubscribeModel.Error400('SUBSCRIBE_EXISTS');
        }

        const result = await db.run('insert into subscribe(name, level, userId, subscribed, pending) values (?, ?, ?, 1, 1)', [
          this.farmName, this.level, this.requestUserID
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
  app.read();
  app.child('/plant', require('./plant'));
};
