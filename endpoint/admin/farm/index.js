module.exports = (app, AdminModel) => {
  class FarmModel extends AdminModel {
    async read(res) {
      await this.dao.serialize(async db => {
        await this.checkAuthorized(db);
        const farms = await db.get('select * from farm limit ?,?', [
          this.page, this.pageSize
        ]);
        res.json({
          _meta: {
            page: {
              current: this.page,
              last: Math.ceil(len / this.pageSize),
            },
          },
          farms,
        });
      });
    }
  }
  app(FarmModel);
  app.read();
}
