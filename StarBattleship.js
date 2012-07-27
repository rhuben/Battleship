var rootOfGlobalsInstall = process.env.GLOBALS_HOME;
var rootOfNodeInstall = process.env.nodeRoot;
var globals = require(rootOfNodeInstall+'\\cache');
var pathToGlobalsMGR = rootOfGlobalsInstall + '/mgr';
var assert=require('assert');

/*
 * this is an attempt to create a game similar to battleship,
 * but much larger and in 3 dimensions
 * 
 * I will attempt to make the game work this way:
 * there are two main bases
 * and planets
 * the bases produce starships
 * which try to secure planets
 * 
 * the types of ships will be:
 * 
 * monitors
 * harvesters
 * fighters
 * cruisers
 * bombs
 * 
 * current features:
 * initializes a map (which consists of almost nothing)
 * 
 * current design goals:
 * 
 * 
 * 
 */


/*
 * data will be stored as follows
 * global: game
 * subscripts:
 * parameters //don't implement this yet
 * 		maxSize=1000
 * 		etc
 * objects
 * 		neutral
 * 			1
 * 				category=planet
 * 				position= [x,y,z] //[x,y,z] should be integers between 0 and 1000
 * 			2
 * 				category=planet
 * 			3 
 * 			...etc
 * 		red
 * 			0
 * 				category=base
 * 				position=[0,0,0]
 * 				health=10 //change this?
 * 			1
 * 				category=ship
 * 				class=monitor
 * 				position= [x,y,z] //[x,y,z] should be integers between 0 and 1000
 * 			2
 * 				category=ship
 * 				class=fighter
 * 				position=...
 * 		blue
 * 			0
 * 				category=base
 * 				position=[1000,1000,1000]
 * 			//as red
 * 
 */


startGame();



function startGame()
{
	console.log("Game started!");
	var board= initializeMap();
	
	printAllObjects(board);
	
	board.kill("game");
	board.close();
}

function initializeMap()
{
	var board=emptyMap();
	addParameters(board);
	addPlanets(board);
	addBases(board);
	return board;
}

function emptyMap()
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

function addParameters(board)
{
	board.set({
		global: "parameters",
		subscripts: ["fighter", "range"],
		data: 50
	});
	//more later
}

function addPlanets(board)
{
	board.set({
		global: "game",
		subscripts: ["parameters", "numberOfPlanets"],
		data:0
	});
	board.kill({
		global: "game",
		subscripts: ["objects", "neutral"]
	}); //clears the current planets 
	//adds new ones
	for (var i=0;i<5;i++)
	{
		addPlanet(board);
	}
}

function addPlanet(board)
/*
 * places a planet at a random location
 * I may 
 */
{
	var randomXPosition=Math.floor(Math.random()*1001);
	var randomYPosition=Math.floor(Math.random()*1001);
	var randomZPosition=Math.floor(Math.random()*1001);
	var numberOfPlanets=Number(board.get({
		global: "game",
		subscripts: ["parameters", "numberOfPlanets"]
	}).data);

	board.set({
		global: "game",
		subscripts: ["parameters", "numberOfPlanets"],
		data: numberOfPlanets+1
	}); //increments the number of planets
	board.set({
		global: "game",
		subscripts:["objects", "neutral", numberOfPlanets+1, "category"],
		data: "planet"
	}); //states that there is a neutral object of category planet
	board.set({
		global: "game",
		subscripts:["objects", "neutral", numberOfPlanets+1, "position"],
		data: [randomXPosition, randomYPosition, randomZPosition]
	}); //states that the planet is at that position
}

function addBases(board)
{
	board.set({
		global:"game",
		subscripts: ["objects", "red", 0, "category"],
		data: "base"
	});
	board.set({
		global:"game",
		subscripts: ["objects", "red", 0, "position"],
		data: [0,0,0]
	});
	
	board.set({
		global:"game",
		subscripts: ["objects", "blue", 0, "category"],
		data: "base"
	});
	board.set({
		global:"game",
		subscripts: ["objects", "blue", 0, "position"],
		data: [1000,1000,1000]
	});
}

function printAllObjects(board)
{
	var teamsArray=["neutral", "red", "blue"];
	var ref1, s;
	for (var i=0;i<3;i++) //for each thing in teams array, print stuff for them
	{
		console.log("The map has the following " + teamsArray[i]+ " objects:");
		ref1="";
		ref1=board.order({
			global:"game",
			subscripts: ["objects", teamsArray[i], ref1]
		}).result;
		while (ref1!="")
		{
			s="\tA ";
			s+=board.get({
				global: "game",
				subscripts: ["objects", teamsArray[i], ref1, "category"]
			}).data;
			s+=" at position ";
			s+=board.get({
				global: "game",
				subscripts: ["objects", teamsArray[i], ref1, "position"]
			}).data;
			console.log(s);
			ref1=board.order({
				global:"game",
				subscripts: ["objects", teamsArray[i], ref1]
			}).result;
		}
	}
}

function inSightRange(board, viewer, object)
/*
 * board is the game board
 * viewer is a two-element array of the position and category of the viewer
 * ex: [[0,100,57], "fighter"]
 * 
 * object is the same but for the object
 * ex: [[10,400,800], "harvester"]
 * 
 */
{
	var distance= computeDistance(viewer[0], object[0]);
	var maxDistance=board.get({
		global: "parameters",
		subscripts: [viewer[1], "range"]
	}).data;
	assert.notEqual(maxDistance, "", "The range of " +viewer[1]+ " is not defined!");
	return distance<maxDistance;
}

function computeDistance(position1, position2)
{
	assert.equal(position1.length, 3, "The position of an object has to be a 3-tuple!");
	assert.equal(position2.length, 3, "The position of an object has to be a 3-tuple!");
	var deltaX=position1[0]-position2[0];
	var deltaY=position1[1]-position2[1];
	var deltaZ=position1[2]-position2[2];
	return Math.sqrt(deltaX*deltaX+deltaY*deltaY+deltaZ+deltaZ);
}