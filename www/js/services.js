angular.module('starter', [])

.factory('DBA', function($cordovaSQLite, $q, $ionicPlatform)
{
	var self = this;
	
	self.query = function(query, parameters)
	{
		parameters = parameters || [];
    var q = $q.defer();

    $ionicPlatform.ready(function () {
      $cordovaSQLite.execute(db, query, parameters)
        .then(function (result) {
          q.resolve(result);
        }, function (error) {
          console.warn('I found an error');
          console.warn(error);
          q.reject(error);
        });
    });
    return q.promise;
	}
})

.factory('Queries', function($cordovaSQLite, DBA)
{
	var parameters=[1, 'Rowlet', 25, 'Grass', 'Flying'];
	DBA.query("INSERT INTO pokemon (id, name, baserate, primarytype, secondarytype) VALUES (?,?,?,?,?)", parameters);
})