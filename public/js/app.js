ttApp = angular.module('tt', ['ionic', 'firebase'])

.run(function($rootScope, $firebaseSimpleLogin, $window, $ionicLoading, Profile, $state) {

  $rootScope.baseUrl = 'https://talktalk.firebaseio.com/';
  var authRef = new Firebase($rootScope.baseUrl);
  $rootScope.auth = $firebaseSimpleLogin(authRef);

  $rootScope.openchats = [];

  $rootScope.show = function(text) {
    this.modal = $ionicLoading.show({
      content: text ? text : 'Loading..',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
  };

  $rootScope.hide = function() {
    this.modal.hide();
  };

  $rootScope.notify = function(text) {
    $rootScope.show(text);
    $window.setTimeout(function() {
      $rootScope.hide();
    }, 1999);
  };

  $rootScope.logout = function() {
    $rootScope.auth.$logout();
    $rootScope.offlineUser();
    $rootScope.checkSession();
  };

  $rootScope.checkSession = function() {
    var auth = new FirebaseSimpleLogin(authRef, function(error, user) {
      if (error) {
        // no action yet.. redirect to default route
        $rootScope.userId = null;
        $window.location.href = '#/';
      } else if (user) {
        // user authenticated with Firebase
        $rootScope.userId = user.id;
        $window.location.href = ('#/home');
      } else {
        // user is logged out
        console.log('logged out');
        $rootScope.userId = null;
        $window.location.href = '#/';
      }
    });
  }

  // globals
  $rootScope.chatToUser = [];
  $rootScope.userName = '';
  $rootScope.escapeUserName = function(name) {
    if (!name) return false
      // Replace '.' (not allowed in a Firebase key) with ','
    name = name.toLowerCase();
    name = name.replace(/\./g, ',');
    return name.trim();
  }

  $rootScope.getHash = function(chatToUser, loggedInUser) {
    var hash = '';
    if (chatToUser > loggedInUser) {
      hash = this.escapeUserName(chatToUser) + '_' + this.escapeUserName(loggedInUser);
    } else {
      hash = this.escapeUserName(loggedInUser) + '_' + this.escapeUserName(chatToUser);
    }
    return hash;
  }


}).config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('login', {
      url: '/',
      templateUrl: 'partials/login.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'partials/signup.html'
    }).state('home', {
      url: '/home',
      templateUrl: 'partials/home.html'
    }).state('chat', {
      url: '/chat/:chatToUser/:loggedInUser',
      templateUrl: 'partials/chat.html'
    });

  $urlRouterProvider.otherwise('/');

});