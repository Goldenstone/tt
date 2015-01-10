ttApp.factory('GUI', function() {
  return require('nw.gui');
}).factory('GUIWin', ['GUI',
  function(gui) {
    return gui.Window.get();
  }
]).factory("Profile", ["$rootScope", "$firebase", function ($rootScope, $firebase) {
  return function (email) {
    var ref = new Firebase($rootScope.baseUrl).child('profiles').child($rootScope.escapeUserEmail(email));
    return $firebase(ref).$asObject();
  }
}]);
