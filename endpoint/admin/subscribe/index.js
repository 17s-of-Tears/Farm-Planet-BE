module.exports = (app, AdminModel) => {
  class SubscribeModel extends AdminModel {
    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const users = await db.get('select subscribe.id, subscribe.name as farmName, user.name as userName, subscribe.createdAt, subscribe.expiredAt, subscribe.subscribed, subscribe.pending, subscribe.level, count(subscribePlant.id) as plants from subscribe left join user on subscribe.userId=user.id left join subscribePlant on subscribe.id=subscribePlant.subscribeId order by subscribe.pending desc, subscribe.subscribed desc, subscribe.id desc limit ?,?', [
          (this.page - 1) * this.pageSize, this.pageSize
        ]);
        const meta = await db.get('select count(*) as length from subscribe where subscribe.subscribed=1');
        const len = meta[0].length;
        const _meta = {
          page: {
            current: this.page,
            last: Math.ceil(len / this.pageSize),
          },
        };
        res.json({
          _meta,
          users,
        });
      });
    }
  }
  app(SubscribeModel);
  app.read();
  app.child('/:subscribeId', require('./detail'));
}
