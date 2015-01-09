ttApp.factory('GUI', function() {
  return require('nw.gui');
}).factory('GUIWin', ['GUI',
  function(gui) {
    return gui.Window.get();
  }
]).factory("Profile", ["$rootScope", "$firebase", function ($rootScope, $firebase) {
  return function (id) {
    var ref = new Firebase($rootScope.baseUrl).child('profiles').child(id);
    return $firebase(ref).$asObject();
  }
}]);
