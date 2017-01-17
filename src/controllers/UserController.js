import util from 'util';
import models from '../models/index';
import passwordHelper from '../helpers/passwordHelper';

function verifyRequiredParams(request) {
  request.assert('firstName', 'First Name is required').notEmpty();
  request.assert('lastName', 'Last Name is required').notEmpty();
  request.assert('email', 'Email address is required').notEmpty().isEmail();
  request.assert('username', 'username is required').notEmpty();
  request.assert('isAdmin', 'isAdmin is required').isBoolean();

  var errors = request.validationErrors();
  if (errors) {
    error_messages = {
      error: 'true',
      message: util.inspect(errors)
    };

    return false;
  } else {
    return true;
  }
}
let error_messages = null;

export class UserController {
  constructor() {}

  getAll(request, response, next) {
    models.User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'isAdmin']
    })
      .then((users) => {
        var data = {
          error: 'false',
          data: users
        };

        response.json(data);
        next();
      });
  }

  getById(request, response, next) {
    models.User.find({
      attributes: ['id', 'firstName', 'lastName', 'email', 'username', 'isAdmin'],
      where: {
        'id': request.params.id
      }
    }).then((user) => {
      var data = {
        error: 'false',
        data: user
      };

      response.json(data);
      next();
    });
  }

  add(request, response, next) {
    if (!verifyRequiredParams(request)) {
      response.json(422, error_messages);
      return;
    }

    models.User.create({
      firstName: request.body['firstName'],
      lastName: request.body['lastName'],
      email: request.body['email'],
      username: request.body['username'],
      isAdmin: request.body['isAdmin'],
    }).then((user) => {
      var data = {
        error: 'false',
        message: 'New user created successfully',
        data: user
      };

      response.json(data);
      next();
    });
  }

  update(request, response, next) {
    if (!verifyRequiredParams(request)) {
      response.json(422, error_messages);
      return;
    }

    models.User.find({
      where: {
        'id': request.params.id
      }
    }).then((user) => {
      if (user) {
        user.updateAttributes({
          firstName: request.body['firstName'],
          lastName: request.body['lastName'],
          email: request.body['email'],
          username: request.body['username'],
          isAdmin: request.body['isAdmin'],
        }).then((user) => {
          var data = {
            error: 'false',
            message: 'Updated user successfully',
            data: user
          };

          response.json(data);
          next();
        });
      }
    });
  }

  setPassword(request, response, next) {
    models.User.find({
      where: {
        'id': request.params.id
      }
    }).then((user) => {
      if (user) {
        user.updateAttributes({
          password: passwordHelper.cryptPassword(request.body['password']),
        }).then(() => {
          var data = {
            error: 'false',
            message: 'Updated user password successfully',
            data: { updated: true }
          };
          response.json(data);
          next();
        });
      }
    });
  }

  delete(request, response, next) {
    models.User.destroy({
      where: {
        id: request.params['id']
      }
    }).then((user) => {
      var data = {
        error: 'false',
        message: 'Deleted user successfully',
        data: user
      };

      response.json(data);
      next();
    });
  }
}