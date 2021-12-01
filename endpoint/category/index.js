module.exports = (app, Model) => {
  class PlantModel extends Model {
    async read(res) {
      await this.dao.serialize(async db => {
        const banners = await db.get('select * from banner');
        const categories = await db.get(`select plantCategory.id, plantCategory.name, concat('[', substring_index(group_concat('{ "name":"', plant.name, '", "imageUrl": "', plant.imageUrl, '", "id" : ', plant.id, ' }' SEPARATOR ','), ',', 16), ']') as plants from plantCategory left join plant on plantCategory.id=plant.categoryId group by plantCategory.id order by plant.id asc, plantCategory.id asc`);
        const parsed = categories.map(row => {
          return {
            ...row,
            plants: JSON.parse(row.plants),
          };
        });
        res.json({
          _meta: null,
          categories: parsed,
          banners,
        });
      });
    }
  }
  app(PlantModel);
  app.read();
  app.child('/:categoryId', require('./detail'));
};
