angular.module('starter', ['ionic', 'ngCordova'])

.controller('QueriesCtrl', function($scope, Queries)
{
	Queries.add();
});
