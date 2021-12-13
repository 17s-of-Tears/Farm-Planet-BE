module.exports = (app, SubscribePlantModel) => {
  class SubscribePlantDetailModel extends SubscribePlantModel {
    constructor(req) {
      super(req);
      this.subscribePlantId = req.params?.subscribePlantId - 0;
      this.useFilesystem(req.file, 'img/state');
    }

    async create(res) {
      this.checkParameters(this.subscribeId, this.subscribePlantId);
      await this.file.serialize(async files => {
        await this.dao.serialize(async db => {
          /* 사진 등록 조건
              1. 구독중인 밭
              2. 신청된 작물
              3. 사진이 있음
          */
          await this.checkAuthorized(db);
          const subscribe = await db.get('select subscribe.id from subscribe left join subscribePlant on subscribe.id=subscribePlant.subscribeId where subscribe.subscribed=1 and subscribe.id=? and subscribePlant.id=?', [
            this.subscribeId, this.subscribePlantId
          ]);
          if(!subscribe[0]) {
            // 사진 등록 조건 1, 2
            throw new SubscribePlantDetailModel.Error400('SUBSCRIBE_NOT_EXISTS');
          }
          if(!files.size()) {
            // 사진 등록 조건 3
            throw new SubscribePlantDetailModel.Error400('FILE_NOT_EXISTS');
          }
          for(const file of files) {
            await db.run('insert into subscribePlantState(subscribePlantId, imageUrl) values (?, ?)', [
              this.subscribePlantId, `${file.saveDir}/${file.saveName}`
            ]);
          }

          res.status(201).json({
            complete: true,
          });
          /*
          select * from subscribe where subscribe.id=2
          select * from subscribePlant where subscribePlant.subscribeId=2
          select * from subscribePlant where subscribePlant.id=4;
          select * from subscribePlant left join subscribePlantState on subscribePlant.id=subscribePlantState.subscribePlantId

          select subscribePlantState.imageUrl, subscribePlantState.createdAt from subscribePlantState where subscribePlantState.subscribePlantId=4;
          */
        });
      });

    }

    async read(res) {
      this.checkParameters(this.subscribeId, this.subscribePlantId);
      await this.dao.serialize(async db => {
        const infos = await db.get('select plant.name, plant.description, plant.imageUrl from subscribe left join subscribePlant on subscribe.id=subscribePlant.subscribeId left join plant on subscribePlant.plantId=plant.id where subscribe.id=? and subscribePlant.id=?', [
          this.subscribeId, this.subscribePlantId
        ]);
        if(!infos[0]) {
          throw new SubscribePlantDetailModel.Error404();
        }
        const states = await db.get('select subscribePlantState.imageUrl, subscribePlantState.createdAt from subscribe left join subscribePlant on subscribe.id=subscribePlant.subscribeId left join subscribePlantState on subscribePlant.id=subscribePlantState.subscribePlantId where subscribe.id=? and subscribePlant.id=? order by subscribePlantState.id desc', [
          this.subscribeId, this.subscribePlantId
        ]);
        res.json({
          ...infos[0],
          states,
        });
      });
    }

    async update(res) {
      this.checkParameters(this.subscribeId, this.subscribePlantId);
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);

        const subscribe = await db.get('select subscribePlant.id from subscribePlant where subscribePlant.expired=0 and subscribePlant.subscribeId=? and subscribePlant.id=?', [
          this.subscribeId, this.subscribePlantId
        ]);
        if(!subscribe[0]) {
          // 완료 조건: 완료되지 않음, 존재하는 구독, 존재하는 재배 작물
          throw new SubscribePlantDetailModel.Error403();
        }

        await db.run('update subscribePlant set subscribePlant.expired=1 where subscribePlant.subscribeId and subscribePlant.id=?', [
          this.subscribeId, this.subscribePlantId
        ]);
        res.json({
          complete: true,
        });
      });
    }
  }
  app(SubscribePlantDetailModel);
  app.create();
  app.read();
  app.update();
}
