import util from 'util';
import models from '../models/index';
import sequelize from 'sequelize';

export class CategoryController {
  constructor() {
    this.error_messages = null;
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.add = this.add.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.verifyRequiredParams = this.verifyRequiredParams.bind(this);
  }

  getAll(request, response, next) {
    models.Category.findAll({
      attributes: ['id','name','createdAt','updatedAt', [sequelize.fn('COUNT', sequelize.col('Posts.id')), 'postCount']],
      group: ['Category.id', 'Posts.id'],
      include: [{
        model: models.Post,
        attributes: []
      }],
      order: [
        ['name', 'ASC']
      ],
    })
      .then((categories) => {
        var data = {
          error: 'false',
          data: categories
        };

        response.json(data);
        next();
      });
  }

  getById(request, response, next) {
    models.Category.find({
      where: {
        'id': request.params.id
      }
    }).then((category) => {
      var data = {
        error: 'false',
        data: category
      };

      response.json(data);
      next();
    });
  }

  add(request, response, next) {
    if (!this.verifyRequiredParams(request)) {
      response.json(422, this.error_messages);
      return;
    }

    models.Category.create({
      name: request.body['name'].trim(),
    }).then((category) => {
      var data = {
        error: 'false',
        message: 'New category created successfully',
        data: category
      };

      response.json(data);
      next();
    });
  }

  update(request, response, next) {
    if (!this.verifyRequiredParams(request)) {
      response.json(422, this.error_messages);
      return;
    }

    models.Category.find({
      where: {
        'id': request.params.id
      }
    }).then((category) => {
      if (category) {
        category.updateAttributes({
          name: request.body['name'].trim(),
        }).then((category) => {
          var data = {
            error: 'false',
            message: 'Updated category successfully',
            data: category
          };

          response.json(data);
          next();
        });
      }
    });
  }

  delete(request, response, next) {
    models.Category.destroy({
      where: {
        id: request.params['id']
      }
    }).then((category) => {
      var data = {
        error: 'false',
        message: 'Deleted category successfully',
        data: category
      };

      response.json(data);
      next();
    });
  }

  verifyRequiredParams(request) {
    request.assert('name', 'name field is required').notEmpty();

    var errors = request.validationErrors();
    if (errors) {
      this.error_messages = {
        error: 'true',
        message: util.inspect(errors)
      };

      return false;
    } else {
      return true;
    }
  }
}