'use strict';
module.exports = (sequelize, DataTypes) => {
  var Post = sequelize.define('Post', {
    title: DataTypes.STRING,
    key: DataTypes.STRING,
    content: DataTypes.TEXT,
    published: DataTypes.BOOLEAN,
    publishDate: DataTypes.DATE
  }, {
    classMethods: {
      associate: (models) => {
        // associations can be defined here
        Post.belongsTo(models.Category, { foreignKey: 'categoryId'});
        Post.belongsToMany(models.Tag, {through: models.PostTag});
        Post.hasMany(models.Meta, { foreignKey: 'postId'});
      }
    }
  });
  return Post;
};
