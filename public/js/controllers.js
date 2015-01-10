ttApp.controller('LoginCtrl', ['$window', '$rootScope', '$scope', '$state', function($window, $rootScope, $scope, $state) {

  $scope.login = {
    email: '',
    password: ''
  };

  $scope.loginUser = function() {
    $rootScope.show('正在为您验证...');

    var email = this.login.email;
    var password = this.login.password;

    $rootScope.auth.$login('password', {
      email: email,
      password: password
    }).then(function(user) {
      $rootScope.hide();
      $rootScope.userEmail = user.email;
      $state.go("home");
    }).catch(function(error) {
      $rootScope.hide();
      if (error.code == 'INVALID_EMAIL') {
        $rootScope.notify('邮箱地址错误');
      } else if (error.code == 'INVALID_PASSWORD') {
        $rootScope.notify('密码错误');
      } else if (error.code == 'INVALID_USER') {
        $rootScope.notify('没有该用户');
      } else {
        $rootScope.notify('服务器发生错误，请稍后再试');
      }
    });
  }

}]).controller('SignupCtrl', ['$firebase', '$rootScope', '$scope', '$state', function($firebase, $rootScope, $scope, $state) {

  $scope.signup = {
    username: '',
    email: '',
    password: '',
    gender: ''
  };

  $scope.signupUser = function() {

    var email = this.signup.email;
    var password = this.signup.password;
    var username = this.signup.username;
    var gender = this.signup.gender;

    $rootScope.show('正在为您验证...');

    $scope.auth.$createUser(email, password)
      .then(function(user) {
        $rootScope.hide();
        var profileRef = new Firebase($rootScope.baseUrl).child('profiles').child($rootScope.escapeUserEmail(user.email));
        $rootScope.profile = $firebase(profileRef);
        $rootScope.profile.$set({
          name: username,
          gender: gender,
          email: email
        });
        $rootScope.userEmail = user.email;
        $state.go("home");
      }, function(error) {
        $rootScope.hide();
        if (error.code == 'INVALID_EMAIL') {
          $rootScope.notify('邮箱地址错误');
        } else if (error.code == 'EMAIL_TAKEN') {
          $rootScope.notify('邮箱地址已被使用');
        } else {
          $rootScope.notify('服务器发生错误，请稍后再试');
        }
      });

  }

}]).controller('HomeCtrl', ['$rootScope', '$scope', '$firebase', 'GUI', 'GUIWin', 'Profile', function($rootScope, $scope, $firebase, gui, win, Profile) {
  $scope.users = [];

  var olUsersRef = new Firebase($rootScope.baseUrl + 'onlineUsers');
  var olUserSync = $firebase(olUsersRef);
  $scope.users = olUserSync.$asArray();

  // broadcast the user's presence
  $rootScope.profileObj = Profile($rootScope.userEmail);
  $rootScope.profileObj.$loaded(function (user) {
    $rootScope.userName = user.name;
    olUserSync.$push({
      user: user.name,
      gender: user.gender,
      email: user.email,
      login: Date.now()
    }).then(function (data) {
      $rootScope.presenceID = data.key();
      console.log($rootScope.presenceID);
    });
  });

  $scope.triggerChat = function(chatToUser) {
    $rootScope.chatToUser.push(chatToUser);
    spawnner(chatToUser.email);
  }

  $scope.randomChat = function () {
    var random = Math.floor(Math.random() * $scope.users.length);
    var chatToUser = $scope.users[random];
    $rootScope.chatToUser.push(chatToUser);
    spawnner(chatToUser.email);
  }

  function spawnner(user) { // other user
    x = gui.Window.open('chat/' + user + '/' + $rootScope.userEmail, {
      width: 300,
      height: 450,
      toolbar: true
    });

    x.on('loaded', function() {
      $rootScope.openchats.push("win_" + $rootScope.escapeUserEmail(user));
    });

    x.on('close', function() {
      for (var i = $rootScope.openchats.length - 1; i >= 0; i--) {
        if ($rootScope.openchats[i] === "win_" + $rootScope.escapeUserEmail(user)) {
          $rootScope.openchats.splice(i, 1);
          return;
        }
      }
      this.close(true);
    });
  }

  // broadcast the user's presence
  $rootScope.offlineUser = function() {
      olUserSync.$remove($rootScope.presenceID);
  }
  // on window close broadcast the user's presence
  win.on('close', function() {
    $rootScope.offlineUser();
    this.close(true);
  });

  // register for other's user to chat
  var triggerChatRef = new Firebase($rootScope.baseUrl + 'chats');
  obj = $firebase(triggerChatRef).$asArray();
  var unwatch = obj.$watch(function(snap) {
    if (snap.event == 'child_added' || snap.event == 'child_changed') {
      if (snap.key.indexOf($rootScope.escapeUserEmail($rootScope.userEmail)) >= 0) {
        // check and spawn
        var otherUser = snap.key.replace(/_/g, '').replace('chat', '').replace($rootScope.escapeUserEmail($rootScope.userEmail), '');
        console.log(otherUser);
        if ($rootScope.openchats.join('').indexOf($rootScope.escapeUserEmail(otherUser)) < 0) {
          spawnner(otherUser);
        }
      }
    }
  });

}]).controller('ChatCtrl', ['$rootScope', '$scope', '$stateParams', '$timeout', '$ionicScrollDelegate', '$firebase', 'Profile', function($rootScope, $scope, $stateParams, $timeout, $ionicScrollDelegate, $firebase, Profile) {
  $scope.chatToUser = $stateParams.chatToUser;
  Profile($scope.chatToUser).$loaded(function (data) {
    $scope.chatToUserName = data.name;
  });
  $scope.loggedInUser = $stateParams.loggedInUser;
  Profile($scope.loggedInUser).$loaded(function (data) {
    $scope.loggedInUserName = data.name;
  });
  var chatRef = new Firebase($rootScope.baseUrl + 'chats/chat_' + $rootScope.getHash($scope.chatToUser, $scope.loggedInUser));
  var sync = $firebase(chatRef);
  $scope.messages = sync.$asArray();

  $scope.sendMessage = function(chatMsg) {
    if (chatMsg !== '') {
      var d = new Date();
      d = d.toLocaleTimeString().replace(/:\d+ /, ' ');
      sync.$push({
        content: '<p>' + $scope.loggedInUserName + ' ' + d + '<br/>' + chatMsg + '</p> <hr/>',
        time: d
      });

      $scope.chatMsg = chatMsg = '';
      $ionicScrollDelegate.scrollBottom(true);
    } else {
      $rootScope.notify('信息不能为空');
    }
  }
}])

