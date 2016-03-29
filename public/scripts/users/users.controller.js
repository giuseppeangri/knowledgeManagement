(function () {

  'use strict';

  angular
    .module('app.users')
    .controller('UsersController', UsersController)
    .controller('UsersShowController', UsersShowController)
    .controller('UsersEditController', UsersEditController)
    .controller('AdminController', AdminController);


  UsersController.$inject = ['$scope', 'Users', 'user'];

  function UsersController($scope, Users, user) {

    var uc = this;

    uc.inizialize = inizialize;

    uc.inizialize();

    return uc;

    function inizialize() {

      user.$promise.then(function (res) {
        $scope.users = res;
      });

    }

  }

  UsersShowController.$inject = ['$scope', 'Users', 'user', 'Articles', 'Templates', 'Tutorials', 'Tools', 'Projects', '$q'];

  function UsersShowController($scope, Users, user, Articles, Templates, Tutorials, Tools, Projects, $q) {

    var uc = this;

    uc.inizialize = inizialize;
    uc.getUserContents = getUserContents;
    uc.getUserProject = getUserProject;

    uc.inizialize();

    return uc;

    function inizialize() {

      user.$promise.then(function (res) {

        $scope.user = res;
        $scope.userProjects = [];
        $scope.contents = [];

        getUserContents();
        getUserProject();

      });
    }

    function getUserContents() {

      $q.all([
        Articles.getByUserId({ userId: $scope.user._id }).$promise,
        Templates.getByUserId({ userId: $scope.user._id }).$promise,
        Tutorials.getByUserId({ userId: $scope.user._id }).$promise,
        Tools.getByUserId({ userId: $scope.user._id }).$promise
        // Projects.getByUserId({userId : $scope.user._id}).$promise
      ])
        .then(function (result) {
          result.forEach(function (elements, type) {
            elements.forEach(function (singleElement) {
              singleElement.type = type;
              $scope.contents.push(singleElement);
            }, this);
          }, this);
        });

    }

    function getUserProject() {
      Projects.getByComponentsId({ userId: $scope.user._id }).$promise
        .then(function (result) {
          $scope.userProjects = result;
          console.log($scope.userProjects);
        });
    }

  }

  UsersEditController.$inject = ['$scope', 'Users', 'user', '$state'];

  function UsersEditController($scope, Users, user, $state) {

    var uc = this;

    uc.inizialize = inizialize;
    uc.save = save;
    uc.remove = remove;

    uc.inizialize();

    return uc;

    function inizialize() {

      $scope.disableButton = true;

      user.$promise.then(function (res) {
        $scope.user = res;
        $scope.newUser = new Users();
        $scope.newUser.email = $scope.user.email;
        $scope.newUser.name = $scope.user.name;
        $scope.newUser.lastName = $scope.user.lastName;
        $scope.newUser.serialNumber = $scope.user.serialNumber;
        $scope.newUser.dataBirth = $scope.user.dataBirth;
        $scope.newUser.admin = $scope.user.admin;
        $scope.newUser.moderator = $scope.user.moderator;
        $scope.newUser._id = $scope.user._id;
      });

    }

    function save() {

      if ($scope.newPassword && $scope.passChange) {
        console.log("AGGIORNO LA PASSWORD");
        $scope.newUser.password = $scope.newPassword;
      }
      console.log("OK");
      $scope.newUser.$update(
        {
          id: $scope.newUser._id
        },
        successUpdate,
        errorUpdate
        );
    }
    
    function remove() {
      $scope.user.$delete({
        id: $scope.user._id
      },
      successDelete,
      errorDelete);
    }

    function successUpdate(res) {
      console.log("OK UPDATE");
      $state.go('app.usersShow', { id: res._id });
    }
    function errorUpdate() {
      console.log("ERROR UPDATE");
    }
    
    function successDelete(res) {
      console.log("OK UPDATE");
      $state.go('app.users');
    }
    function errorDelete() {
      console.log("ERROR UPDATE");
    }

  }


  AdminController.$inject = ['$scope', 'Users', 'Articles', 'Templates', '$q'];

  function AdminController($scope, Users, Articles, Templates, $q) {

    var ac = this;

    ac.inizialize = inizialize;

    ac.getInvalidContents = getInvalidContents;
    ac.getInvalidUsers = getInvalidUsers;

    ac.removeContent = removeContent;
    ac.acceptContent = acceptContent;

    ac.removeUser = removeUser;
    ac.acceptUser = acceptUser;

    ac.inizialize();

    return ac;

    function inizialize() {

      $scope.invalidContents = [];
      $scope.invalidUsers = [];

      getInvalidContents();
      getInvalidUsers();

    }

    function getInvalidContents() {
      $q.all([Articles.getInvalid().$promise, Templates.getInvalid().$promise])
        .then(function (result) {
          result.forEach(function (elements, type) {
            elements.forEach(function (singleElement) {
              singleElement.type = type;
              $scope.invalidContents.push(singleElement);
            }, this);
          }, this);
        });
    }
    function getInvalidUsers() {
      $q.all([Users.getInvalid().$promise])
        .then(function (result) {
          result.forEach(function (elements, type) {
            elements.forEach(function (singleElement) {
              singleElement.type = type;
              $scope.invalidUsers.push(singleElement);
            }, this);
          }, this);
        });
    }

    function removeContent(item) {
      item.$delete({
        id: item._id
      },
        successContentDelete(item),
        errorDelete);
    }
    function acceptContent(item) {

      if (item.type == 0) {

        if (item.father) {
          Article.get({
            id: item.father
          }).$promise.then(
            function (res) {
              item.comments = res.comments;
              item.preferences = res.preferences;

              res.$delete({
                id: res._id
              },
                function () {
                  item.valid = true;
                  item.$update({
                    id: item._id
                  },
                    successContentUpdate,
                    errorUpdate
                    );
                },
                errorDelete);
            }
            );
        }
        else {
          item.valid = true;
          item.$update({
            id: item._id
          },
            successContentUpdate,
            errorUpdate
            );
        }
      }
      else {
        item.valid = true;
        item.$update({
          id: item._id
        },
          successContentUpdate,
          errorUpdate
          );
      }
    }

    function removeUser(item) {
      item.$delete({
        id: item._id
      },
        successUserDelete(item),
        errorDelete);
    }
    function acceptUser(item) {
      item.valid = true;
      item.$update({
        id: item._id
      },
        successUserUpdate(item),
        errorUpdate);
    }


    function successContentDelete(item) {
      console.log("SUCCESS CONTENT DELETE");
      var i = $scope.invalidContents.indexOf(item);
      $scope.invalidContents.splice(i, 1);
    }
    function successUserDelete(item) {
      console.log("SUCCESS USER DELETE");
      var i = $scope.invalidUsers.indexOf(item);
      $scope.invalidUsers.splice(i, 1);
    }

    function errorDelete() {
      console.log("ERROR DELETE");
    }

    function successContentUpdate(item) {
      console.log("SUCCESS CONTENT UPDATE");
      var i = $scope.invalidContents.indexOf(item);
      $scope.invalidContents.splice(i, 1);

    }
    function successUserUpdate(item) {
      console.log("SUCCESS USER UPDATE");
      var i = $scope.invalidUsers.indexOf(item);
      $scope.invalidUsers.splice(i, 1);
    }

    function errorUpdate() {
      console.log("ERROR UPDATE");
    }
  }

})();