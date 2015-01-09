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
      $rootScope.userId = user.id;
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
    password: ''
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
        var profileRef = new Firebase($rootScope.baseUrl).child('profiles').child(user.id);
        $rootScope.profile = $firebase(profileRef);
        $rootScope.profile.$set({
          name: username,
          gender: gender
        });
        $rootScope.userId = user.id;
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
  $rootScope.profileObj = Profile($rootScope.userId);
  $rootScope.profileObj.$loaded(function (user) {
    $rootScope.userName = user.name;
    olUserSync.$push({
      user: user.name,
      gender: user.gender,
      login: Date.now()
    }).then(function (data) {
      $rootScope.presenceID = data.key();
      console.log($rootScope.presenceID);
    });
  });

  $scope.triggerChat = function(chatToUser) {
    $rootScope.chatToUser.push(chatToUser);
    spawnner(chatToUser.user);
  }

  $scope.randomChat = function () {
    var random = Math.floor(Math.random() * $scope.users.length);
    var chatToUser = $scope.users[random];
    $rootScope.chatToUser.push(chatToUser);
    spawnner(chatToUser.user);
  }

  function spawnner(user) { // other user
    var x = gui.Window.open('chat/' + user + '/' + $rootScope.userName, {
      width: 300,
      height: 450,
      toolbar: false
    });

    x.on('loaded', function() {
      $rootScope.openchats.push("win_" + $rootScope.escapeUserName(user));
    });

    x.on('close', function() {
      for (var i = $rootScope.openchats.length - 1; i >= 0; i--) {
        if ($rootScope.openchats[i] === "win_" + $rootScope.escapeUserName(user)) {
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
      if (snap.key.indexOf($rootScope.escapeUserName($rootScope.userName)) >= 0) {
        // check and spawn
        var otherUser = snap.key.replace(/_/g, '').replace('chat', '').replace($rootScope.escapeUserName($rootScope.userName), '');
        if ($rootScope.openchats.join('').indexOf($rootScope.escapeUserName(otherUser)) < 0) {
          spawnner(otherUser);
        }
      }
    }
  });

}]).controller('ChatCtrl', ['$rootScope', '$scope', '$stateParams', '$timeout', '$ionicScrollDelegate', '$firebase', function($rootScope, $scope, $stateParams, $timeout, $ionicScrollDelegate, $firebase) {
  $scope.chatToUser = $stateParams.chatToUser;
  console.log($scope.chatToUser);
  $scope.loggedInUser = $stateParams.loggedInUser;
  var chatRef = new Firebase($rootScope.baseUrl + 'chats/chat_' + $rootScope.getHash($scope.chatToUser, $scope.loggedInUser));
  var sync = $firebase(chatRef);
  $scope.messages = sync.$asArray();

  $scope.sendMessage = function(chatMsg) {
    var d = new Date();
    d = d.toLocaleTimeString().replace(/:\d+ /, ' ');
    sync.$push({
      content: '<p>' + $scope.loggedInUser + ' ' + d + '<br/>' + chatMsg + '</p> <hr/>',
      time: d
    });

    $scope.chatMsg = chatMsg = '';
    $ionicScrollDelegate.scrollBottom(true);
  }
}])

