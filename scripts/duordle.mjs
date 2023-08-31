import { wordleWordCheck } from "./game.mjs";

const MAX_ATTEMPTS = 9

export const duordlemain = (req,res) => {
    if (!req.body.word || req.body.word.length !==5) {
        return res.json("Expected a word of length 5")
    }
    if(!req.session.dictionary.includes(req.body.word)){
        return res.status(400).json({error:"Word not in dictionary"})
    }
    const word = req.body.word
    const solution1 = req.session.solution1
    const solution2 = req.session.solution2
    const gameOne = req.session.gameState.one
    const gameTwo = req.session.gameState.two
    let res1="Completed",res2 = "Completed"
    if (!gameOne) {
        res1 = wordleWordCheck(word,solution1)
        if(res1.every(val => val===2)){req.session.gameState.one = true;res1="Completed"}
    }
    if (!gameTwo) {
        res2 = wordleWordCheck(word,solution2)
        if(res2.every(val => val===2)){req.session.gameState.two = true;res2="Completed";}
    }
    req.session.previous_tries.push({attempt:word,data:{response1:res1,response2:res2}})
    if (req.session.gameState.one && req.session.gameState.two) {
        res.json({
            status:"Game Won",
            correctWordOne:solution1,
            correctWordtwo:solution2,
            attemptHistory:req.session.previous_tries,
        })
        req.session.destroy()
        return
    }
    if(req.session.previous_tries.length === MAX_ATTEMPTS){
        res.json({
            status:"Game Lost",
            correctWordOne:solution1,
            correctWordtwo:solution2,
            attemptHistory:req.session.previous_tries,
        })
        req.session.destroy()
        return
    }
    res.json({
        gameOne:res1,
        gameTwo:res2
    })
}