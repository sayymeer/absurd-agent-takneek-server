import express from "express";
import session from "express-session";
import pkg from "cors";
const cors = pkg;
import { wordleHandle,hangmanHandle,reducedHangman,rhFirstRes } from "./scripts/game.mjs";
import { wordleHangman } from "./scripts/wordleHangman.mjs";
import { duordlemain } from "./scripts/duordle.mjs";
import { defaultDictionary } from "./data/dictionary.mjs";

const port = 8000

const app = express();
app.use(express.json());
app.use(session({
    secret: 'helloWorld',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge:60*60*1000}
  }))
app.use((req, res, next) => {console.log(req.session); next();});
app.use(cors());
let dictionary = defaultDictionary
const games = ["wordle", "hangman","hanguced","wordman","duordle"];

app.post("/dictionary", (req, res) => {
	if (req.session.game==="none") {
		if (!Array.isArray(req.body.words)) {
			res.status(400).json("Not an array")
			return
		}
		let dict = Array.from(req.body.words)
		if (req.body.set === 1) {
			req.session.dictionary = dict
		} else {req.session.dictionary = dictionary.concat(dict) }
		res.status(200).json("Ok")
		console.log(req.session.dictionary.length)
	} else {
		res.json("Send a get req to /")
	}
});

app.get("/", (req, res) => {
	if (req.session.game!=="none") {
		req.session.dictionary = dictionary
	}
	req.session.game = "none";
	res.json(games);
});


app.post("/", (req, res) => {
	if (req.session.game === "none") {
		//no game started yet, so req should be one
		//one of the words from the array games - if
		//it isn't then return error and do nothing
		if (!games.includes(req.body.game)) {
			res.status(400).json("No such game");
			return;
		}
		req.session.game = req.body.game;
		let dictionary = req.session.dictionary
		//If selected game is wordle
		if (req.session.game===games[0]) {
			const wordleDictionary = dictionary.filter(word => word.length === 5)
			req.session.solution = wordleDictionary[Math.floor(Math.random()*wordleDictionary.length)];
			req.session.previous_tries = [];
			res.status(200).json("Success");
		}

		//If selected game is Hangman
		if (req.session.game===games[1]) {
			req.session.solution = dictionary[Math.floor(Math.random()*dictionary.length)];
			req.session.previous_tries = [];
			res.json(req.session.solution.length)
		}

		//If selected game is reduced hangman
		if (req.session.game === games[2]) {
			const redHangmanDict = dictionary.filter(word => word.length <= 10)
			req.session.solution = redHangmanDict[Math.floor(Math.random()*redHangmanDict.length)];
			req.session.previous_tries = [];
			req.session.options = rhFirstRes(req.session.solution)
			res.json({blanks:req.session.solution.length,letters:req.session.options})
		}

		//if game is wordman
		if (req.session.game === games[3]) {
			const wordleDictionary = dictionary.filter(word => word.length === 5)
			req.session.solution = wordleDictionary[Math.floor(Math.random()*wordleDictionary.length)];
			req.session.previous_tries = [];
			res.status(200).json("Success");
		}

		//if game is duordle
		if (req.session.game===games[4]) {
			const wordleDictionary = dictionary.filter(word => word.length === 5)
			req.session.solution1 = wordleDictionary[Math.floor(Math.random()*wordleDictionary.length)];
			req.session.solution2 = wordleDictionary[Math.floor(Math.random()*wordleDictionary.length)];
			req.session.previous_tries = [];
			req.session.gameState = {one:false,two:false}
			res.status(200).json("success")
		}
		req.session.dictionary = []
		return;
	}
	switch (req.session.game) {
		case games[0]:
			wordleHandle(req,res)
			break;
		case games[1]:
			hangmanHandle(req,res)
			break;
		case games[2]:
			reducedHangman(req,res)
			break;
	    case games[3]:
			wordleHangman(req,res)
			break;
		case games[4]:
			duordlemain(req,res)
			break;
		default :
			res.json({error:"Make a get request to / to get list of games"})
			res.end()
	}
})

app.listen(port,() => console.log("Server running on port 8000"));
