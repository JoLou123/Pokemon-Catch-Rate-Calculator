// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var db = null;
/*
 setTimeout(
            function asyncBootstrap() {
                angular.bootstrap( document, [ "starter" ] );
            },
            ( 5000 )
        );
*/
angular.module('starter', ['ionic', 'ngCordova', 'ngResource', 'rzModule', 'ngAnimate', 'angularSpinner'])

.run(function($ionicPlatform, $cordovaSQLite, DBInit)
{
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
	//console.log("Hello");
	DBInit.init();
  });
})

.factory('DBInit', function($cordovaSQLite, $timeout, PokemonQueries, StatusQueries, PokeballQueries)
{
	var self=this;	
	self.init= function()
	{
		//console.log("Device Ready");
		//db = $cordovaSQLite.openDB({name:"pokemon.db", location:1});
		db = window.openDatabase("pokemon.db", "1.0", "Cordova Demo", 200000);
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS pokemon(id integer primary key, name text, baserate integer, primarytype text, secondarytype text)");
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS status(id integer primary key, type text, multiplier real)");
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS pokeball(id integer primary key, ball text, boostmultiplier real, basemultiplier real)");
		
		/*PokemonQueries.count().then(function(result)
		{
			if(result.rowsAffected==0)
				{PokemonQueries.add();}
		})
		
		StatusQueries.count().then(function(result)
		{
			if(result.rowsAffected==0)
				{StatusQueries.add();}
		})
		
		PokeballQueries.count().then(function(result)
		{
			if(result.rowsAffected==0)
				{PokeballQueries.add();}
		});*/
		PokemonQueries.add();
		StatusQueries.add();
		PokeballQueries.add();
/*		
		window.onload = function() 
		{
		console.log(window.location.hash);
		$timeout(2000);
		if(!window.location.hash) 
		{
			console.log("if statement");
			window.location = window.location + '#loaded';
			window.location.reload();
		}
		}*/
	}
	
	return self;
})

.factory('PokemonData', function($http, $q, $resource) {
  var dataSource = 'js/db/pokemon.json';
		var config = {headers: {
			'Access-Control-Allow-Origin': '*' 
			}
		};
		return $resource(dataSource, config);
})

.factory('StatusData', function($http, $q, $resource) {
  var dataSource = 'js/db/status.json';
		var config = {headers: {
			'Access-Control-Allow-Origin': '*' 
			}
		};
		return $resource(dataSource, config);
})

.factory('PokeballData', function($http, $q, $resource) {
  var dataSource = 'js/db/pokeballs.json';
		var config = {headers: {
			'Access-Control-Allow-Origin': '*' 
			}
		};
		return $resource(dataSource, config);
})

.factory('DBA', function($cordovaSQLite, $q, $ionicPlatform)
{
	var self = this;
	
	self.query = function(query, parameters)
	{
		parameters = parameters || [];
		var q = $q.defer();

		$ionicPlatform.ready(function () 
		{
			$cordovaSQLite.execute(db, query, parameters).then(function (result) 
			{
				//console.log($q.resolve(result));
				q.resolve(result);
			}, 	function (error) 
				{
					console.warn('I found an error');
					console.warn(error);
					q.reject(error);
				});
		});
		
    return q.promise;
	}
	
	self.getById = function(result) 
	{
		var output = null;
		output = angular.copy(result.rows.item(0));
		return output;
	}
	
	self.getAll = function(result)
	{
		var output = [];

		for (var i = 0; i < result.rows.length; i++) 
		{
			output.push(result.rows.item(i));
		}
    return output;
	}
	
	return self;
})

.factory('PokemonQueries', function($cordovaSQLite, DBA, PokemonData)
{
	var self= this;
	
	self.add = function()
	{	
		var pokemon=PokemonData.query(function()
		{
			//console.log(pokemon[0]);
			//console.log(pokemon[0].pokemon);
			//console.log(pokemon.length);
			for(var i=0; i<pokemon.length; i++)
			{
				var parameters=pokemon[i].pokemon;
				DBA.query("INSERT OR IGNORE INTO pokemon (id, name, baserate, primarytype, secondarytype) VALUES (?,?,?,?,?)", parameters);
			}
			
		}); 	
		
	}
	
	self.get = function(name) 
	{
		var parameters = [name];
		return DBA.query("SELECT name, baserate, primarytype, secondarytype FROM pokemon WHERE name = (?)", parameters)
		.then(function(result) 
		{
			return DBA.getById(result);
		});
	}
	
	self.all = function() 
	{
        return DBA.query('SELECT * FROM pokemon').then(function(result)
		{
            return DBA.getAll(result);
        });
    }
/*	
	self.count = function()
	{
		return DBA.query('SELECT COUNT(*) FROM pokemon');
	};
	*/
	return self;
})

.factory('StatusQueries', function($cordovaSQLite, DBA, StatusData)
{
	var self = this;
	
	self.add = function()
	{	
		var status=StatusData.query(function()
		{
			//console.log(status[0]);
			//console.log(status[0].status);
			
			for(var i=0; i<status.length; i++)
			{
				var parameters=status[i].status;
				DBA.query("INSERT OR IGNORE INTO status (id, type, multiplier) VALUES (?,?,?)", parameters);
			}
			
		}); 		
	}
	
	self.get = function(type) 
	{
		var parameters = [type];
		return DBA.query("SELECT multiplier FROM status WHERE type = (?)", parameters).then(function(result) 
		{
			return DBA.getById(result);
		});
	}
	
	self.all = function() 
	{
        return DBA.query('SELECT * FROM status').then(function(result)
		{
            return DBA.getAll(result);
        });
    }
/*	
	self.count = function()
	{
		return DBA.query('SELECT COUNT(*) FROM status');
	};*/
	
	return self;
})

.factory('PokeballQueries', function($cordovaSQLite, DBA, PokeballData)
{
	var self= this;
	
	self.add = function()
	{	
		var pokeball=PokeballData.query(function()
		{
			//console.log(pokeball[0]);
			//console.log(pokeball[0].pokeball);
			
			for(var i=0; i<pokeball.length; i++)
			{
				var parameters=pokeball[i].pokeball;
				DBA.query("INSERT OR IGNORE INTO pokeball (id, ball, boostmultiplier, basemultiplier) VALUES (?,?,?,?)", parameters);
			}
			
		}); 	
		
	}
	
	self.get = function(ball) 
	{
		var parameters = [ball];
		return DBA.query("SELECT ball, boostmultiplier, basemultiplier FROM pokeball WHERE ball = (?)", parameters)
		.then(function(result) 
		{
			return DBA.getById(result);
		});
	}
	
	self.all = function() 
	{
        return DBA.query('SELECT * FROM pokeball').then(function(result)
		{
            return DBA.getAll(result);
        });
    }
/*	
	self.count = function()
	{
		return DBA.query('SELECT COUNT(*) FROM pokeball');
	};*/
	
	return self;
})

.controller('Selections', function($scope, $timeout, PokemonQueries, StatusQueries, PokeballQueries)
{
	
	
$timeout(function()
{
	$scope.startingapp=false;
	$timeout(function()
	{
		$scope.startingapp=true;
	}, 7000)
	//$timeout(function() {$scope.startingapp=false;},50)
	
	$scope.pokemon = [];
	$scope.itemList=[];
	
//Load names of pokemon into dropdown
	PokemonQueries.all().then(function(pokemon)
	{
		$scope.pokemon = pokemon;
		$scope.selectedpokemon=pokemon[41];
		$scope.itemList[0]=pokemon[41];
		$scope.DoTheMath();
		//console.log($scope.pokemon);
	});	
//Loads statuses into dropdown
	$scope.status = [];
	StatusQueries.all().then(function(status)
	{
		$scope.status = status;
		$scope.selectedstatus=status[0];
		$scope.itemList[1]=status[0];
		$scope.DoTheMath();
	});
	
//Loading pokeballs into dropdown	
	$scope.pokeball=[];
	PokeballQueries.all().then(function(pokeball)
	{
		$scope.pokeball=pokeball;
		$scope.selectedball=pokeball[0];
		$scope.itemList[2]=pokeball[0];
		//console.log($scope.itemList[2]);
		$scope.DoTheMath();
	});

//Loading required Data	
	
	$scope.changedpokemon=function(item)
	{
		PokemonQueries.get(item.name).then(function(pokemon)
		{
			$scope.itemList[0]=pokemon;
			$scope.DoTheMath();
			//console.log($scope.itemList[0].baserate);			
		})
	}

	/*
	$scope.SearchNotEmpty=false;
	//console.log($scope.SearchNotEmpty);
	$scope.changedsearch=function()
	{
		//console.log($scope.searched.mon);
		$scope.SearchNotEmpty=false;
		//console.log($scope.SearchNotEmpty);
		if($scope.searched.mon!=undefined || $scope.searched.mon!="")
		{
			$scope.SearchNotEmpty=true;
			if($scope.searched.mon=="")
			{
				$scope.mon.results="No results";
				console.log($scope.mon.results);
			}
			//console.log($scope.SearchNotEmpty);
		}
		//console.log($scope.SearchNotEmpty);
		
	}*/

	$scope.Showslider=true;
		$scope.slider = 
		{
			value: 100,
			options: 
			{
				showSelectionBar: true,
				floor: 1,
				getSelectionBarColor: function(value) 
				{
					if (value <= 10)
						return 'red';
					if (value <= 25)
						return 'orange';
					if (value <= 50)
						return 'yellow';
					
					$scope.itemList[4]=$scope.slider.value;
					$scope.DoTheMath();
					
					return '#2AE02A';
				}
			}
		};
	
	$scope.changedstatus=function(item)
	{
		StatusQueries.get(item.type).then(function(status)
		{
			$scope.itemList[1]=status;
			
			//console.log($scope.itemList[1].multiplier);	
			$scope.DoTheMath();					
		})
	}
	
	$scope.changedball=function(item)
	{
		PokeballQueries.get(item.ball).then(function(ball)
		{
			
			$scope.NestEnabled=false;
			
			var newmult;
			if(ball.ball=="Nest Ball")
			{
				$scope.NestEnabled = true;
				$scope.changedlevel=function(level)
				{				
					var level=$scope.pokeball.boostmultiplier;
					//console.log(level);
					newmult=8-0.2*(level-1);
					//console.log(newmult);
					ball.basemultiplier=Math.max(1, newmult);
					$scope.itemList[2]=ball;
					$scope.DoTheMath();						
				}
			}
			
			$scope.NetEnabled=false;
			if(ball.ball=="Net Ball")
			{
				$scope.NetEnabled=true;
				$scope.changedpokemon=function(item)
				{
					PokemonQueries.get(item.name).then(function(pokemon)
					{
						if(pokemon.primarytype=="Water" || pokemon.primarytype=="Bug" || pokemon.secondarytype=="Water" || pokemon.secondarytype=="Bug")
						{
							ball.basemultiplier=ball.boostmultiplier;
						}
						else
						{
							ball.basemultiplier=1.0;
						}
						$scope.itemList[2]=ball;
						$scope.DoTheMath();
					})	
				}				
			}
			
			$scope.TimerEnabled=false;
			if(ball.ball=="Timer Ball")
			{
				$scope.TimerEnabled=true;
				$scope.changedturn=function(turn)
				{
					var turns=$scope.pokeball.boostmultiplier;
					var newmult = 1+(0.3*turns);
					ball.basemultiplier=Math.min(4, newmult);
					$scope.itemList[2]=ball;
					$scope.DoTheMath();
				}
			}
				
			
			$scope.changedlocation=function()
			{
				if($scope.pokeball.boostmultiplier==true)
				{
					ball.basemultiplier=ball.boostmultiplier;
				}
				else
				{
					if(ball.ball=="Beast Ball")
						{ball.basemultiplier=0.1;}
					else
						{ball.basemultiplier=1.0;}
				}
				$scope.itemList[2]=ball;
				$scope.DoTheMath();
			}
				
			$scope.DiveEnabled=false;
			if(ball.ball=="Dive Ball")
			{
				$scope.DiveEnabled=true;
				$scope.changedlocation();								
			}
			
			$scope.RepeatEnabled=false;
			if(ball.ball=="Repeat Ball")
			{
				$scope.RepeatEnabled=true;
				$scope.changedlocation();
			}
			
			$scope.DuskEnabled=false;
			if(ball.ball=="Dusk Ball")
			{
				$scope.DuskEnabled=true;
				$scope.changedlocation();
			}
			
			$scope.QuickEnabled=false;
			if(ball.ball=="Quick Ball")
			{
				$scope.QuickEnabled=true;
				$scope.changedlocation();
			}
			
			$scope.BeastEnabled=false;
			if(ball.ball=="Beast Ball")
			{
				$scope.BeastEnabled=true;
				$scope.changedlocation();
			}
			
			//console.log(ball.basemultiplier);
			
			$scope.itemList[2]=ball;
			$scope.DoTheMath();
		})
	}
	
	$scope.changeddexno=function()
	{
		$scope.invalid=false;
		var dexno=$scope.pokedex.no;
		//console.log(dexno);
		if(dexno>=0 && dexno<=30)
			{$scope.itemList[3]=0;}
		else if(dexno>=31 && dexno<=150)
			{$scope.itemList[3]=0.5;}
		else if(dexno>=151 && dexno<=300)
			{$scope.itemList[3]=1.0;}
		else if(dexno>=301 && dexno<=450)
			{$scope.itemList[3]=1.5;}
		else if(dexno>=451 && dexno<=600)
			{$scope.itemList[3]=2.0;}
		else if(dexno>=601)
			{$scope.itemList[3]=2.5;}
		else
			{$scope.invalid=true;}
		$scope.DoTheMath();
	}
//Do the math	 
$scope.DoTheMath=function()
{
	var baserate=1;
	var statusmultiplier=1;
	var ballmultiplier=1;
	var dexnomultiplier=0;
	var hppercent=100;
	
	if($scope.itemList[0]!=undefined)
		{baserate=$scope.itemList[0].baserate;}
	
	//if($scope.itemList[1].multiplier==undefined ||)
	if($scope.itemList[1]!=undefined)
		{statusmultiplier=$scope.itemList[1].multiplier; }
	//else
	//{ statusmultiplier=$scope.itemList[1].multiplier; }

	if($scope.itemList[2]!=undefined)
		{ballmultiplier=$scope.itemList[2].basemultiplier; }
	//else
	//{ ballmultiplier=$scope.itemList[2].basemultiplier; }

	//console.log($scope.itemList[3]);
	if($scope.itemList[3]!=undefined)
		{dexnomultiplier=$scope.itemList[3];}
	
	//console.log($scope.itemList[4]);
	if($scope.itemList[4]!=undefined)
		{hppercent=$scope.itemList[4];}
	 
	var moddedval;
	var shakecheck;
	var criticalcapture;
	//var ccprob;
	//var normalprob;
	
	moddedval=((3-2*(hppercent/100))*(baserate*ballmultiplier)/3)*statusmultiplier;
	//console.log(moddedval);
	shakecheck=65536/(Math.pow((255/moddedval),0.1875));
	//console.log(shakecheck);
	criticalcapture=(Math.min(255,moddedval)*dexnomultiplier)/6;
	//console.log(criticalcapture);
	$scope.ccprob=(criticalcapture/256)*(shakecheck/65536)*100;
	$scope.normalprob=Math.pow((moddedval/255), 0.75)*100;
	
	if($scope.itemList[2]!=undefined && $scope.itemList[2].ball=="Master Ball")
		{$scope.catchrate=100;}
	else
		{$scope.catchrate = ($scope.ccprob+$scope.normalprob);}
	
	$scope.ccprob=Math.min($scope.ccprob.toFixed(2),100);
	$scope.normalprob=Math.min($scope.normalprob.toFixed(2),100);
	$scope.catchrate=Math.min($scope.catchrate.toFixed(2),100);
	
}	
}, 7000);

})

.directive("mAppLoading",function($animate, $timeout) 
{
	
   // Return the directive configuration.
                return({
                    link: link,
                    restrict: "C"
                });
			
                // I bind the JavaScript events to the scope.
                function link( scope, element, attributes ) 
				{
					$timeout(function()
					{ 
                    // Due to the way AngularJS prevents animation during the bootstrap
                    // of the application, we can't animate the top-level container; but,
                    // since we added "ngAnimateChildren", we can animated the inner
                    // container during this phase.
                    // --
                    // NOTE: Am using .eq(1) so that we don't animate the Style block.
                    $animate.leave( element.children().eq( 1 ) ).then(
                        function cleanupAfterAnimation() {
                            // Remove the root directive element.
                            element.remove();
                            // Clear the closed-over variable references.
                            scope = element = attributes = null;
                        }
                    );
					},7000);
                }
  
});





