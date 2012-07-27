var rootOfGlobalsInstall = process.env.GLOBALS_HOME;
var rootOfNodeInstall = process.env.nodeRoot;
var globals = require(rootOfNodeInstall+'\\cache');
var pathToGlobalsMGR = rootOfGlobalsInstall + '/mgr';
var assert=require('assert');

/*
 * this program will attempt to simulate the game of battleship
 * 
 * current features:
 * make a random board with ships
 * print the board from either perspective
 * make a random move
 * detect when the game is over
 * 
 * current goals:
 * take user input to make a move
 * enable both players to do stuff
 * 
 * once the above are implemented, it should be a fully functional game of battleship
 * 
 * optional goals:
 * provide a warning when you would attack a previously attacked square
 * choose where to place ships
 * make the map bigger
 * 
 */

/*
 * how data will be stored:
 * 
 * global name: player1/player2
 * 
 * subscripting patterns:
 * 		map
 * 			a  <- column
 * 				1   <- row
 * 					contents=submarine			<- may need changing
 * 					struck=true
 * 				2
 * 					struck=false
 * 			b	
 * 				1
 * 		...
 * 
 * 		objects
 * 			ships
 * 				battleship
 * 					locations
 * 						1= [b,4]
 * 						2= [b,5]
 * 						3= [b,6] etc
 * 					hitLocations
 * 				submarine
 * 					locations
 * 			[others later]
 */


var letters="abcdefghij";
var turnNumber=0;
startGame();


function startGame()
{
	var board=initializeMap();
	var gameOver=false;
	
//	takeTurn(board); //takes one turn on an empty board
	
	while (!gameOver) //plays the whole game
	{
		gameOver=takeTurn(board);
	}
	console.log("The game ended on turn "+ turnNumber); 

	
	board.kill("Player1");
	board.close();
}



function initializeMap()
{
	var board=new globals.Cache(); //the board is a global
	board.open({
		path: pathToGlobalsMGR,
		username: "userName",
		password: "password",
		namespace: "namespace"
	});
	board.kill("Player1");
	addShips(board);
	return board;
}

function addShips(board)
{
	addShip(board, 2, "patrol boat");
	addShip(board, 3, "submarine");
	addShip(board, 3, "destroyer");
	addShip(board, 4, "battleship");
	addShip(board, 5, "aircraft carrier");  
}

function addShip(board, length,name)
{
	var randomNumber= Math.floor(Math.random()*2);
	var vertical=[true, false];
	vertical=vertical[randomNumber]; //if vertical is true then the ships will be placed vertically
	var validPlacement, randomXPosition, randomYPosition, attempts;
	attempts=0;
	validPlacement=false;
	while (!validPlacement)
	{
		/*
		 * choose a random spot
		 * check for going off the edge and collisions
		 * if there are some, choose a different spot
		 * if there are none, place the ship
		 */
		attempts++;
		assert.notEqual(attempts, 100, "The program was unable to find a valid placement for a ship.");

		validPlacement=true;
		randomYPosition=Math.floor(Math.random()*(10-length));
		randomXPosition=Math.floor(Math.random()*(10));
		for (var i=0;i<length;i++) //checks each position 
		{
			var toCheckX=randomXPosition;
			var toCheckY=randomYPosition+i;
			if (vertical)
			{
				var temp=toCheckX;
				toCheckX=toCheckY;
				toCheckY=temp;
			}
			var currentOccupant=board.get({
				global: "Player1",
				subscripts: ["map", letters.charAt(toCheckX), toCheckY+1, "contents"]
			}).data;
			if (currentOccupant!="") //if there is something there
			{
				validPlacement=false; //then it is not a valid placement
			}
		}
	}
	for (var i=0;i<length;i++)
	{
		var toWriteX=randomXPosition;
		var toWriteY=randomYPosition+i;
		if (vertical)
		{
			var temp=toWriteX;
			toWriteX=toWriteY;
			toWriteY=temp;
		}
		board.set({
			global: "Player1",
			subscripts: ["map", letters.charAt(toWriteX), toWriteY+1, "contents"],
			data: name
		});
	}


}

function printBoard(board, boardOwner, viewer)
{
	if (viewer!=boardOwner)
	{
		printEnemyBoard(board, boardOwner);
	}
	else
	{
		printOwnBoard(board, boardOwner);
	}
}

function printEnemyBoard(board, boardOwner)
{
	var s="\t";
	for (var i=0;i<10;i++)
	{
		s+=letters.charAt(i).toUpperCase();
		s+=" ";
	}
	console.log(s+ "\n");
	
	for (var i=0;i<10;i++) //for each row...
	{
		s=i+1+"\t"; // make a string representation of that row
		for (var j=0;j<10;j++)
		{
			struck=board.get({
				global: boardOwner,
				subscripts:["map", letters.charAt(j), i+1, "struck"]
			}).data;
			if (!struck) //if the player has not hit it yet
			{
				s+=". ";
			}
			else //if the player has hit the square
			{
				var contents= board.get({
					global: boardOwner,
					subscripts: ["map", letters.charAt(j), i+1, "contents"]	
				}).data;
				if (contents!="")
				{
					s+="H ";	
				}
				else
				{
					s+="M ";
				}
			}
		}
		console.log(s); //and print it
	}
}


function printOwnBoard(board, boardOwner)
{
	var s="\t";
	for (var i=0;i<10;i++)
	{
		s+=letters.charAt(i).toUpperCase();
		s+=" ";
	}
	console.log(s+ "\n");
	
	for (var i=0;i<10;i++) //for each row...
	{
		s=i+1+"\t"; // make a string representation of that row
		for (var j=0;j<10;j++)
		{
			var contents= board.get({
				global: boardOwner,
				subscripts: ["map", letters.charAt(j), i+1, "contents"]	
			}).data;
			/*
			 * representation of the position
			 * .=Empty
			 * other letter= that ship
			 * 
			 */
			if (contents=="")
			{
				s+=". ";
			}
			else
			{
				s+=contents.charAt(0).toUpperCase()+ " ";
			}
		}
		console.log(s);
	}
}

function takeTurn(board)
{
	turnNumber++;
	//choose where to attack
	console.log("Cheating, you can see the following:");
	printBoard(board, "Player1", "Player1");
	var question="What column would you like to attack?";
	var columnToAttack, rowToAttack;
/*	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdout.write(question);
	process.stdin.on('data', function(column){
		columnToAttack=column.charAt(0).toLowerCase();
		process.exit();
	});
	question="What row would you like to attack?";
	columnToAttack=ask (question); */
	var randomNumber=Math.floor(Math.random()*10);
	columnToAttack=letters.charAt(randomNumber);
	randomNumber=Math.floor(Math.random()*10);
	rowToAttack=randomNumber+1;
	console.log("You are attacking "+columnToAttack.toUpperCase()+rowToAttack);
	
	//make the attack
	var contents=board.get({
		global: "Player1",
		subscripts: ["map", columnToAttack, rowToAttack, "contents"]
	}).data;
	board.set({
		global: "Player1",
		subscripts: ["map", columnToAttack, rowToAttack, "struck"],
		data: true
	});
	if (contents=="")
	{
		console.log ("You missed!");
	}
	else 
	{
		console.log("You hit the " +contents);
	}
	
	//print board now:
	console.log("Non-cheating, you now see:");
	printBoard(board, "Player1", "Player2");
	console.log("\n");
	
	//check if game is over
	return isGameOver(board);
}

function isGameOver(board)
{
	var returnable=true;
	var ref1=ref2="";
	ref1=board.order({
		global: "Player1",
		subscripts: ["map", ref1]
	}).result;
	while (ref1!="")
	{
		ref2=board.order({
			global: "Player1",
			subscripts: ["map", ref1, ref2]
		}).result;
		while (ref2!="")
		{
			var contents= board.get({
				global:"Player1",
				subscripts: ["map", ref1,ref2, "contents"]
			}).data;
			var struck=board.get({
				global:"Player1",
				subscripts: ["map", ref1,ref2, "struck"]
			}).data;
			if (contents!=""&&!struck)
			{
				returnable=false;
			}
			ref2=board.order({
				global: "Player1",
			subscripts: ["map", ref1, ref2]
			}).result;
		}
		ref1=board.order({
			global: "Player1",
			subscripts: ["map", ref1]
		}).result;
	}
	return returnable;
}

