module.exports = (app, SubscribeModel) => {
  class SubscribeDetailModel extends SubscribeModel {
    constructor(req) {
      super(req);
      this.subscribeId = req.params?.subscribeId - 0;
      this.name = req.body?.farmName ?? null;
      this.yard = req.body?.yard ?? null;
      this.address = req.body?.address ?? null;
      this.locationX = req.body?.locationX - 0;
      this.locationY = req.body?.locationY - 0;
      this.useFilesystem(req.file, 'img/farm');
    }

    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const subscribe = await db.get('select subscribe.id, subscribe.name as farmName, user.name as userName, subscribe.createdAt, subscribe.expiredAt, subscribe.level, subscribe.yard, subscribe.address, subscribe.locationX, subscribe.locationY, subscribe.imageUrl, count(subscribePlant.id) as plants, subscribe.subscribed, subscribe.pending from subscribe left join user on subscribe.userId=user.id left join subscribePlant on subscribe.id=subscribePlant.subscribeId where subscribe.id=? order by subscribe.id desc', [
          this.subscribeId
        ]);
        if(!subscribe[0]) {
          throw new SubscribeDetailModel.Error404();
        }
        res.json(subscribe[0]);
      });
    }

    async update(res) {
      await this.file.serialize(async files => {
        this.checkParameters(this.name, this.yard, this.address, this.locationX, this.locationY);
        await this.dao.serialize(async db => {
          await this.checkAuthorized(db);
          await db.run('update subscribe set subscribe.name=?, subscribe.yard=?, subscribe.address=?, subscribe.locationX=?, subscribe.locationY=? where subscribe.id=?', [
            this.name, this.yard, this.address, this.locationX, this.locationY, this.subscribeId
          ]);
          if(files.size()) {
            for(const file of files) {
              await db.run('update subscribe set subscribe.imageUrl=? where subscribe.id=? limit 1', [
                `${file.saveDir}/${file.saveName}`, this.subscribeId
              ]);
            }
          }
          res.json({
            complete: true,
          });
        });
      });
    }

    async delete(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        await db.run('update subscribe set subscribe.subscribed=0, subscribe.expiredAt=current_timestamp where subscribe.id=?', [
          this.subscribeId
        ]);
        res.json({
          complete: true,
        });
      });
    }
  }
  app(SubscribeDetailModel);
  app.read();
  app.update();
  app.delete();
  app.child('/plant', require('./plant'));
}
