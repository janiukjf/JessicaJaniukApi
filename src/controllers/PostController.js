import util from 'util';
import models from '../models/index';

export class PostController {
  constructor() {
    this.error_messages = null;
    this.getAll = this.getAll.bind(this);
    this.getAllPublished = this.getAllPublished.bind(this);
    this.getById = this.getById.bind(this);
    this.add = this.add.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.verifyRequiredParams = this.verifyRequiredParams.bind(this);
    this.addTagsToPost = this.addTagsToPost.bind(this);
  }

  getAll(request, response, next) {
    let page = request.query.page || 1;
    models.Post.findAndCountAll({
      include: [models.Category, models.Tag],
      order: [
        ['publishDate', 'DESC']
      ],
      limit: 10,
      offset: (page - 1) * 10
    })
      .then((posts) => {
        var data = {
          error: 'false',
          data: {
            posts: posts.rows,
            page: page,
            count: posts.count
          }
        };

        response.json(data);
        next();
      });
  }

  getAllPublished(request, response, next) {
    let page = request.query.page || 1;
    models.Post.findAndCountAll({
      include: [models.Category, models.Tag],
      where: {
        'published': true,
        'publishDate': {
          $lte: new Date() 
        }
      },
      order: [
        ['publishDate', 'DESC']
      ],
      limit: 10,
      offset: (page - 1) * 10
    })
      .then((posts) => {
        var data = {
          error: 'false',
          data: {
            posts: posts.rows,
            page: page,
            count: posts.count
          }
        };

        response.json(data);
      });
  }

  getById(request, response, next) {
    models.Post.find({
      include: [models.Category, models.Tag],
      where: {
        'id': request.params.id
      }
    }).then((post) => {
      var data = {
        error: 'false',
        data: post
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

    models.Post.create({
      title: request.body['title'],
      content: request.body['content'],
      published: request.body['published'],
      publishDate: request.body['publishDate'],
      categoryId: request.body['categoryId'],
    }).then((post) => {
      var data = {
        error: 'false',
        message: 'New post created successfully',
        data: post
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

    models.Post.find({
      where: {
        'id': request.params.id
      }
    }).then((post) => {
      if (post) {

        post.updateAttributes({
          title: request.body['title'],
          content: request.body['content'],
          published: request.body['published'],
          publishDate: request.body['publishDate'],
          categoryId: request.body['categoryId'],
        })
        .then((post) => {
          this.addTagsToPost(request.body['tags'], post.Id);
        })
        .finally((post) => {
          var data = {
            error: 'false',
            message: 'Updated post successfully',
            data: post
          };

          response.json(data);
          next();
        });
      }
    });
  }

  delete(request, response, next) {
    models.Post.destroy({
      where: {
        id: request.params['id']
      }
    }).then((post) => {
      var data = {
        error: 'false',
        message: 'Deleted post successfully',
        data: post
      };

      response.json(data);
      next();
    });
  }

  verifyRequiredParams(request) {
    request.assert('title', 'title field is required').notEmpty();
    request.assert('published', 'published field is required').notEmpty();
    request.assert('publishDate', 'publish date field must be a date').isDate();
    request.assert('categoryId', 'category is required').notEmpty();

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

  addTagsToPost(tagNames, postId) {
    tagNames.forEach(tag => tag.toLowerCase);
    models.Tag.findAll({
      where: {
        'name': {'$in': tagNames}
      }
    }).then((tags) => {
      let newTags = tags.filter((tag) => {
        return tagNames.find((name) => name === tag.name) === undefined;
      });

      new Promise((resolve, reject) => {
        newTags.forEach((tag) => {
          models.Tag.create({
            name: tag.trim().toLowerCase(),
          })
          .then((newTag) => {
            tags.push(newTag);
          });
        });
        resolve();
      }).then(() => {
        tags.forEach((postTag) => {
          models.PostTag.create({
            tagId: postTag.id,
            postId: postId,
          });
        });
      });
    });
  }
}
