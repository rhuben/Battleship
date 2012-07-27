These programs are the prototypes and other files for a game designed with the intent of making use of Globals' features,
in particular its ability to store sparse information.

The basis of this game is the children's game Battleship. In Battleship, you and your opponent set up ships in a grid and
take turns trying to hit the other player's ships by guessing. In the regular game, the grid is 10-by-10, but I intend to 
drastically increase the scale of the game in order to demonstrate the power of our database. Since the map will be huge
but primarily empty, the database will be exceptionally well suited to handling the game data.

I will probably also modify the gameplay mechanisms so that the game is still interesting, sincein the original Battleship,
you have no way of knowing where the enemy's ships are except by guessing; at the scales I want, that would take years.


There are currently three documents in this folder. One is a simple game that plays the original battleship, one is the 
prototype of my new version, and the last is a program demonstrating a bug which I have found.

Battleship.js replicates the classic Battleship experience, but not quite. Currently I am unable to properly handle user
inputs (see TestProcessIn.js for more details), so the game cannot actually be played by people. Currently, it makes a
random move (possibly one it already made before) and repeats until it detects that the game is over. There is a more
complete feature list in the comments of the program. To make the game only take a single turn, change the following lines:
//	takeTurn(board); //takes one turn on an empty board
	
	while (!gameOver) //plays the whole game
	{
		gameOver=takeTurn(board);
	}
	console.log("The game ended on turn "+ turnNumber); 
If you un-comment the first line and comment out the while loop and the console.log(), then the game will play a single
instead of playing until the game ends.

StarBattleship.js is an early version of the game I hope to make. I hope to make it a three-dimensional turn-based strategy
game played on a 1000-by-1000-by-1000 grid, or perhaps played on a continuum. It currently does not have many features, but
those that exist are detailed in the comments.

TestProcessIn.js is a method for testing Process.in(). It is currently configured to demonstrate an error that I found in
the interaction between taking input in node.js and globals itself. See (or run) the program for more details.


PATCH NOTES (7/27/12)
In this version, StarBattleship has been renamed StarBattleshipOld, and the new StarBattleship is distinct and built from
scratch. The new StarBattleship has a different way of storing information that is more suited to Globals and it has a
different (but mostly improved) feature list. This will be the last update for a while because I will be on break until
August 6.