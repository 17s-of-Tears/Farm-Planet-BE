module.exports = (app, Model) => {
  class UserModel extends Model {
    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const users = await db.get('select user.id, user.name, user.createdAt as date, user.imageUrl as profileImg from user where user.id=?', [
          this.requestUserID
        ]);
        if(!users[0]) {
          throw new UserModel.Error404();
        }
        const farms = await db.get('select subscribe.id as subscribeId, farm.name, farm.yard, farm.imageUrl, farm.address, farm.locationX, farm.locationY from farm left join subscribe on farm.id=subscribe.farmId where subscribe.subscribed=1 and subscribe.userId=?', [
          this.requestUserID
        ])
        const plants = farms[0]?.subscribeId ? await db.get('select subscribePlant.id, subscribePlant.plantId, plant.name from plant left join subscribePlant on plant.id=subscribePlant.plantId where subscribePlant.subscribeId=?', [
          farms[0]?.subscribeId
        ]) : [];

        const farm = farms[0] ? {
          ...farms[0],
          plants,
        } : null;
        res.json({
          ...users[0],
          farm,
        });
      });
    }
  }
  app(UserModel);
  app.read();
};
