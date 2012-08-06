var rootOfGlobalsInstall = process.env.GLOBALS_HOME;
var rootOfNodeInstall = process.env.nodeRoot;
var globals = require(rootOfNodeInstall+'\\cache');
var pathToGlobalsMGR = rootOfGlobalsInstall + '/mgr';
var assert=require('assert');

/*
 * this is an attempt to create a game similar to battleship,
 * but much larger and in 3 dimensions
 * 
 * this version will make better use of Globals than StarBattleshipOld
 * 
 * I think the game will revolve around planets and spaceships which move
 * as opposed to the static ships in regular battleship
 * 
 * current features:
 * can generate a map with planets
 * can create bases and ships
 * ships can move in a way that is relatively smart
 * can print everything that is interesting
 * map can be arbitrary-dimensional (requires minor changes in the hard-coding)
 * 
 * to see these features, run the program and start reading!
 * 
 * 
 * 
 * features to add:
 * vision (ie determining which things I can or can't see with my units)
 * attacking
 * turn-taking
 * gameplay/winning conditions
 * 
 * 
 * 
 * 
 * 
 */

/*
 * data will be stored as follows:
 * 

 * global: game
 * subscripts:
 * parameters //don't implement this yet
 * 		scaleLength=1000
 * 		etc
 * POI //POI=point(s) of interest
 * 		[0,0,0]
 * 			contents=base
 * 			alignment=blue
 * 		[500,123,456]
 * 			contents=planet
 * 			alignment=neutral
 * Constants
 * 		fighter
 * 			speed=100
 * 			range=20
 * 
 * 
 * by storing data like this, you take full advantage of globals
 * 
 * all objects in the game are stored as locations first,
 * so positions can be continuous (ie they don't have to be integers)
 * and they only store positions which have things
 * 
 */

 
var scaleLength=1000;
startGame();


/*
var a= "100.1232421421";
console.log("a: "+ a);
console.log("trimmed a: "+ trim(a)); */


//<intializing functions>
function startGame()
{
	console.log("Game started!");
	var board= initializeMap();
/*	console.log("\nWelcome to Star Battleship! This game is currently in a"+
			" very early version, but hopefully you can see some interesting features!");
	console.log("Let's add some randomly generated planets (only 2, but you can change that) to an empty 3-D map of space." +
			" Now I am going to add bases and a ship."); */
	
	addShip(board, [0,0,0],"fighter", "blue");
	addShip(board, [0,0,0],"fighter", "blue");
	addShip(board, [0,0,0],"fighter", "blue");
	addShip(board, [0,0,0],"fighter", "blue");
	addShip(board, [0,0,0],"fighter", "red");
//	console.log("\nLet's take a look at what we have added:");
	printAllPOIs(board);
/*	console.log("\nNow let's move that ship and take another look at the map.");
	move (board, [0,0,0], [200,100,100]);
	printAllPOIs(board);
	
	console.log("\nNote that the ship could only move 200 units, so it traveled as far as possible in that direction.");
	*/
	console.log("\n");

	printVisible(board, "blue");
	printVisible(board, "red");
	finishGame(board);
}

function initializeMap() //returns a new map that has been initialized with various things
{
	var board=emptyMap();
	board.kill("game");
	
	addConstants(board);
	addPlanets(board);
	addBases(board);
	
	return board;
}

function emptyMap() //returns a new empty global
{
	var board=new globals.Cache();
	board.open({
		path: pathToGlobalsMGR,
		username: "userName",
		password: "password",
		namespace: "itDoesntMatter"
	});
	return board;
}

function addConstants(board) //adds constants like the speed and range of ships
{
	//note: these numbers may be WAY off, and should be subject to tweaking
	board.set("game", "constants", "fighter", "speed", 200/1000*scaleLength);
	board.set("game", "constants", "fighter", "sight", 100/1000*scaleLength);
	board.set("game", "constants", "fighter", "range", 40/1000*scaleLength);
	board.set("game", "constants", "fighter", "cost", 10/1000*scaleLength);
	
	board.set("game", "constants", "monitor", "speed", 150/1000*scaleLength);
	board.set("game", "constants", "monitor", "sight", 300/1000*scaleLength);
	board.set("game", "constants", "monitor", "range", 0/1000*scaleLength);
	board.set("game", "constants", "monitor", "cost", 0/1000*scaleLength);
	
	board.set("game", "constants", "harvester", "speed", 100/1000*scaleLength);
	board.set("game", "constants", "harvester", "sight", 50/1000*scaleLength);
	board.set("game", "constants", "harvester", "range", 0/1000*scaleLength);
	board.set("game", "constants", "harvester", "cost", 0/1000*scaleLength);

	board.set("game", "constants", "annihilator", "speed", 100/1000*scaleLength);
	board.set("game", "constants", "annihilator", "sight", 100/1000*scaleLength);
	board.set("game", "constants", "annihilator", "range", 100/1000*scaleLength);
	board.set("game", "constants", "annihilator", "cost", 30/1000*scaleLength);
	
	board.set("game", "constants", "bomb", "speed", 300/1000*scaleLength);
	board.set("game", "constants", "bomb", "sight", 10/1000*scaleLength);
	board.set("game", "constants", "bomb", "range", 10/1000*scaleLength);
	board.set("game", "constants", "bomb", "cost", 50/1000*scaleLength);
	
	board.set("game", "constants", "base", "speed", 0/1000*scaleLength);
	board.set("game", "constants", "base", "sight", 200/1000*scaleLength);
	board.set("game", "constants", "base", "range", 0/1000*scaleLength);
	board.set("game", "constants", "base", "cost", 0/1000*scaleLength);
}

function addPlanets(board) //adds planets to a board
{
	for (var i=0;i<5;i++)
	{
		addPlanet(board);
	}
}

function addPlanet(board)
{
	/*
	 * the algorithm for adding planets has been modified
	 * now they are added in a cube around the center
	 * this may need to be modified
	 */
	var randomXPosition=(Math.random()-.5)*1000/1000*scaleLength;
	var randomYPosition=(Math.random()-.5)*1000/1000*scaleLength;
	var randomZPosition=(Math.random()-.5)*1000/1000*scaleLength;
	board.set({
		global: "game",
		subscripts: ["POI", [randomXPosition, randomYPosition, randomZPosition], "contents"],
		data: "planet"
	});
	board.set({
		global: "game",
		subscripts: ["POI", [randomXPosition, randomYPosition, randomZPosition], "alignment"],
		data: "neutral"
	});
}

function addBases(board) //adds data for the bases of each player
{
	//bases are put on the x-axis
	board.set({
		global:"game",
		subscripts: ["POI", [.5*scaleLength,0,0], "contents"],
		data: "base"
	});
	board.set({
		global:"game",
		subscripts: ["POI", [.5*scaleLength,0,0], "alignment"],
		data: "red"
	});
	board.set({
		global:"game",
		subscripts: ["POI", [-.5*scaleLength,0,0], "contents"],
		data: "base"
	});
	board.set({
		global:"game",
		subscripts: ["POI", [-.5*scaleLength,0,0], "alignment"],
		data: "blue"
	});
}

//</intializing functions>

function finishGame(board) //clears the board and closes the database
{
	board.kill("game");
	board.close();
}

function computeDistance(position1, position2) //computes the distance between the two n-tuples
{
	assert.equal(position1.length, position2.length, "The positions must both be n-tuples for the same n!");
	var distanceSquared=0;
	for (var i=0;i<position1.length;i++)
	{
		var deltaICoord=position1[i]-position2[i];
		distanceSquared+=deltaICoord*deltaICoord;
	}
	return Math.sqrt(distanceSquared);
}


function printAllPOIs(board) //prints the location and some info for each POI
{
	var POIs=listPOI(board);
	printPOIList(board, POIs);
}

function printPOIList(board, list) //prints info about the POIs on the list
{
	var s;
	for (var i=0;i<list.length;i++)
	{
		var thisPlace=list[i];
		s="There is a ";
		s+=board.get({
			global:"game",
			subscripts: ["POI", thisPlace, "alignment"]
		}).data+" ";
		s+=board.get({
			global:"game",
			subscripts: ["POI", thisPlace, "contents"]
		}).data;
		s+=" at the location ";
		s+= toCoordinate(thisPlace);
		s+=".";
		console.log(s);
	}
}


function listPOI(board) //returns an array of the coordinates of each POI
//note that when returned, they have been parsed into an array, despite being gotten as a string
{
	var ref="";
	var returnable=[];
	ref=board.order({
		global: "game",
		subscripts: ["POI", ref]
	}).result;
	while (ref!="")
	{
		returnable.push(ref.split(","));
		ref=board.order({
			global: "game",
			subscripts: ["POI", ref]
		}).result;
	}
	return returnable;
}



function printDistances(board) //do not call, takes a long time to run
{
	var POIs=listPOI(board);
	for (var i=0;i<POIs.length;i++)
	{
		for (var j=i;j<POIs.length;j++)
		{
			var s="The distance from (";
			s+= POIs[i]+ ") to ("+ POIs[j]+ ") is "; 
			s+= computeDistance(POIs[i], POIs[j]);
			console.log(s);
		}
		
	}
}

function trim(input) 
/*
 * rounds a number to two decimal places
 * also handles arrays
 * strings
 * and arrays that have become strings
 * 
 */
{
	if (typeof(input)=="number")
		{return (Math.round(input*100)/100);}
	if(input instanceof Array)
	{
		var returnable=[];
		for (var i=0;i<input.length;i++)
		{
			returnable[i]=trim(input[i]);
		}
		return returnable;
	}
	if(typeof(input)=="string")
		{
		if (input.indexOf(",")==-1) //if input does not contain a comma
			{return trim (Number(input));}
		else //ie if it was secretly an array
			{return trim(input.split(","));}
		}
	assert.ok(false, "Trim() needs to be given a number, a string, or an array!");
}

function toCoordinate(position) //takes an array and returns a nice-looking string of the coordinates
{
	if (typeof(position)=="string")
	{
		return toCoordinate(position.split(","));
	}
	else
	{
		assert.ok(position instanceof Array, "toCoordinate() must be called on an array!");
		var returnable="(";
		for (var i=0;i<position.length;i++)
		{
			if (i!=0)
			{
				returnable+=", ";
			}
			returnable+=trim(position[i]);
		}
		returnable+=")";
		return returnable;
	}
	
}

//<gameplay mechanisms>

function addShip(board, position, type, alignment) //creates a ship
{
	//ensure that position is empty, and slightly change it if it is not
	var currentContents=" ";
	while (currentContents!="")
	{
		currentContents=board.get({
			global: "game",
			subscripts: ["POI", position, "contents"]
		}).data;
		if (currentContents!="")
		{
			position=epsilonPerturb(position);
		}
	}

	//actually add the ship:
	board.set({
		global: "game",
		subscripts: ["POI", position, "contents"],
		data: type
	});
	board.set({
		global: "game",
		subscripts: ["POI", position, "alignment"],
		data: alignment
	});
	console.log("Finished adding a ship!");
}

function epsilonPerturb(position)
{
	//changes position slightly in a random way
	var randomDirection=Math.floor(position.length*Math.random());
	position[randomDirection]+=2*(Math.random()-.5)*(scaleLength/10000);
	return position;
}

function move(board, currentPosition, desiredPosition) //moves the ship from currentPosition towards desiredPosition
{
	if (typeof(currentPosition)==="string")
		{ currentPosition=currentPosition.split(",");}
	if (typeof(desiredPosition)==="string")
		{ desiredPosition=desiredPosition.split(",");}
	
	var type=board.get({
		global: "game",
		subscripts: ["POI", currentPosition, "contents"]
	}).data;
	assert.notEqual(type, "", "There must be something at this position in order to move it!");
	assert.notEqual(type, "planet", "You can't move a planet!");
	
	var distanceLimit=Number(board.get({
		global: "game",
		subscripts: ["constants", type, "speed"]
	}).data);
	var validDestination=computeDestination(currentPosition, desiredPosition, distanceLimit);
	
	board.merge({
		to: {global: "game",
			subscripts: ["POI", validDestination]},
		from: {global: "game",
			subscripts: ["POI", currentPosition]},
	});
	board.kill({
		global:"game",
		subscripts:["POI", currentPosition]
	});
	console.log("Movement successful!");	
}

function computeDestination(currentPosition, desiredPosition, maxRange)
/*
 * takes ordered n-tuples and a positive number maxRange
 * and tells you where you end up if you try to go up to desiredPosition
 * but not more than maxRange
 */
{
	assert.ok(maxRange>0, "You can't have a destination if you are travelling a non-positive distance!");
	assert.equal(currentPosition.length, desiredPosition.length, "The positions must be n-tuples for the same n!");
	var distanceToTravel=computeDistance(currentPosition, desiredPosition);
	if (distanceToTravel<=maxRange)
	{
		return desiredPosition;
	}
	else
	{
		var directionVector=[];
		var finalPosition=[];
		for (var i=0;i<currentPosition.length;i++)
		{
			directionVector[i]=(desiredPosition[i]-currentPosition[i])/distanceToTravel; //unit vector in the direction you want to go
			finalPosition[i]=currentPosition[i]+maxRange*directionVector[i]; //vector math! Wheeeee!
		}
		return finalPosition;
	}
}

function listClosePOI(board, position, maxDistance) //returns an array of all POIs within maxDistance of position
{
	assert.ok(maxDistance>=0, "The max distance must be non-negative");
	var POIArray=listPOI(board);
	var returnable=[]; //returnable with be a 2D array with positions in the first space
					   //and distances in the second
	for (var i=0; i<POIArray.length; i++)
	{
		var distance=computeDistance(position, POIArray[i]);
		if (distance<=maxDistance)
		{
			returnable.push ([POIArray[i], distance]);
		}
	}
	return returnable;
}

function printVisible(board, player)
//prints all POIs not owned by the player that are visible to player
{
	var visiblePOIs=listVisible(board, player);
	console.log("The following things are visible to the "+ player+ " player:");
	printPOIList(board, visiblePOIs);
}

function listVisible(board, player)
{
	var POIs=listPOI(board);
	var visiblePOIs=[];
	for (var i=0;i<POIs.length;i++)
	{
		var notOwned= board.get({
			global: "game",
			subscripts: ["POI", POIs[i], "alignment"]
		}).data!=player; //if this thing is not owned by the player
		if (notOwned)
		{
			var visible=false;
			for (var j=0;j<POIs.length;j++) //for each POI
			{
				if (!visible&&j!=i) //if it is not already seen
				{
					var owned= board.get({
						global: "game",
						subscripts: ["POI", POIs[j], "alignment"]
					}).data==player;
					if (owned) //if j is owned by the player
					{
						var type= board.get({
								global: "game",
						subscripts: ["POI", POIs[j], "contents"]
						}).data;
						var sightRange=board.get({
							global: "game",
							subscripts: ["constants", type, "sight"]
						}).data;
						if (computeDistance(POIs[i], POIs[j])<=sightRange) //and i is within j's sight range
						{
							visible=true; //then it is seen
						}
					}
				}
			}
			if (visible)
				{visiblePOIs.push(POIs[i]);}
		}
	}
	return visiblePOIs;
}

//<gameplay mechanisms>