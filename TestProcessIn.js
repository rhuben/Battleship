var rootOfGlobalsInstall = process.env.GLOBALS_HOME;
var rootOfNodeInstall = process.env.nodeRoot;
var globals = require(rootOfNodeInstall+'\\cache');
var pathToGlobalsMGR = rootOfGlobalsInstall + '/mgr';



var fooGlobal=new globals.Cache();
fooGlobal.open({
	path: pathToGlobalsMGR,
	username: "userName",
	password: "password",
	namespace: "itDoesntMatter"
});


console.log("Observe that I can call fooGlobal.data():");
fooGlobal.data("foo");
console.log("fooGlobal.data() successfully called!\n");
console.log("But if you would be so kind as to hit enter...");
//the above is standard stuff and should work fine

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (input) 
{
	/*
	 * the following line contains the terminal bug
	 * 
	 * for unknown reasons, the program cannot access 
	 * fooGlobal.data() while within this submethod
	 * 
	 * note that the program can call fooGlobal.data()
	 * from outside this function
	 */
	fooGlobal.data("foo"); //Try commenting me out. No, not the comment, the line! :D
	console.log("Your input was "+ input);
	process.exit(); 
});	

fooGlobal.close(); //note that the global will never actually close itself because of the bug
//and no, this is not the source of the problem
