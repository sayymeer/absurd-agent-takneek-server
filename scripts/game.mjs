const WORDLE_WORD_LENGTH = 5;
const WORDLE_MAX_ATTEMPTS = 6;
const HANGMAN_MAX_ATTEMPTS = 7;
const ERROR_MESSAGES = {
  invalidWordLength: "5 letter word expected",
  invalidLetter: "A letter is expected",
  gameLost: "Game Lost",
  gameWin: "Game Win",
};

export const wordleHandle = (req, res) => {
  if (!req.body.word) {
    res.json({error:"Send word"})
    return
  }
  const word = req.body.word;
  const solution = req.session.solution;

  if (word.length !== WORDLE_WORD_LENGTH) {
    return res.status(400).json({ error: ERROR_MESSAGES.invalidWordLength });
  }
  if(!req.session.dictionary.includes(word)){
    return res.status(400).json({error:"Word not in dictionary"})
  }

  const response = wordleWordCheck(word, solution);
  req.session.previous_tries.push({ attempt: word, data: response });

  if (response.every((val) => val === 2)) {
    res.json({
      status: ERROR_MESSAGES.gameWin,
      correctWord: solution,
      attemptHistory: req.session.previous_tries,
    });
    req.session.destroy()
    return
  }

  if (req.session.previous_tries.length === WORDLE_MAX_ATTEMPTS) {
    res.json({
      status: ERROR_MESSAGES.gameLost,
      correctWord: solution,
      attemptHistory: req.session.previous_tries,
    });
    req.session.destroy()
    return
  }
  res.json(response);
};

export function wordleWordCheck(word, solution) {
  const response = Array(5).fill(0)
  const wordArray = Array.from(word)
  const solArray = Array.from(solution)
  wordArray.forEach((val,ind) => {
    if (val === solArray[ind]) {
      response[ind] = 2
      solArray[ind] = 0
      wordArray[ind] = 1
    }
  })
  wordArray.forEach((val,ind) => {
    if (solArray.includes(val)) {
      response[ind] = 1;
      solArray[solArray.indexOf(val)] = 0
    }
  })
  return response
}

export const hangmanHandle = (req, res) => {
  if (!req.body.letter) {
    res.json({error:"Send letter"})
    return
  }
  const letter = req.body.letter;
  const solution = req.session.solution;


  if (letter.length !== 1 || !letter.match(/[a-zA-Z]/)) {
    return res.status(400).json({ error: ERROR_MESSAGES.invalidLetter });
  }

  const response = hangmanResGen(letter, solution);
  req.session.previous_tries.push({ attempt: letter, data: response });
  
  const attempts = req.session.previous_tries.filter(el => !Array.isArray(el.data)).length
  if (isHangmanWin(req.session.previous_tries,solution)) {
    res.json({
      status:ERROR_MESSAGES.gameWin,
      correctWord:solution,
      attemptHistory:req.session.previous_tries
    })
    req.session.destroy()
    return
  }
  if (attempts===HANGMAN_MAX_ATTEMPTS) {
    res.json({
      status:ERROR_MESSAGES.gameLost,
      correctWord:solution,
      attemptHistory:req.session.previous_tries
    })
    req.session.destroy()
    return
  }
  res.json(response);
}

function hangmanResGen(letter, solution) {
  const solArray = Array.from(solution)
    let response = []
    for (let index = 0; index < solArray.length; index++) {
        const l = solArray[index];
        if (letter===l) {
            response.push(index)
        }
    }
    if (response.length===0) {
        response = -1
    }
    return response
}

function isHangmanWin(previous_tries,solution) {
  const tries = previous_tries.filter(el => Array.isArray(el.data))
  const res = []
  tries.forEach(el => {
    res.push(...el.data)
  });
  const resArray  = [...new Set(res)]
  if (resArray.length===solution.length) {
    return true
  }
  return false
}

export const reducedHangman = (req,res) => {
  if (!req.body.letter&&req.body.letter.length!==1 && req.body.letter.match(/[a-zA-Z]/)) {
    return  res.json({error:"Send a letter"})
  }
  const letter = req.body.letter
  if (!req.session.options.includes(letter)) {
   return res.json({error:"Letter is not in options"})
  }
  const solution = req.session.solution
  const response = hangmanResGen(letter,solution)
  req.session.previous_tries.push({ attempt: letter, data: response });
  const attempts = req.session.previous_tries.filter(el => !Array.isArray(el.data)).length
  if (isHangmanWin(req.session.previous_tries,solution)) {
    res.json({
      status:ERROR_MESSAGES.gameWin,
      correctWord:solution,
      attemptHistory:req.session.previous_tries
    })
    req.session.destroy()
    return
  }
  if (attempts===HANGMAN_MAX_ATTEMPTS) {
    res.json({
      status:ERROR_MESSAGES.gameLost,
      correctWord:solution,
      attemptHistory:req.session.previous_tries
    })
    req.session.destroy()
    return
  }
  res.json(response);
}

export const rhFirstRes = (solution) => {
  const letters = (Math.floor((solution.length*2)/5)+1)*5
  const solArray = [...new Set(solution)]
  const alphabetArray = Array.from('abcdefghijklmnopqrstuvwxyz');
  const redAlphabetArray = alphabetArray.filter(item => !solArray.includes(item))
  while (solArray.length<letters) {
      let ind = Math.floor(Math.random()*redAlphabetArray.length)
      solArray.splice(Math.floor(Math.random()*solArray.length),0,redAlphabetArray[ind])
      redAlphabetArray.splice(ind,1)
  }
  return solArray
}