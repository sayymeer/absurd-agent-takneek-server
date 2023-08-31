const MAX_TRIES = 7

export const wordleHangman = (req,res) => {
    if (!req.body.letter || req.body.position===null || req.body.letter.length !== 1 || req.body.position >= 5 || !req.body.letter.match(/[a-zA-Z]/)) {
        res.json("Expected a letter and position")
        return
    }
    const letter = req.body.letter
    const position = req.body.position
    const solution = req.session.solution
    const response = resGen(letter,position,solution)
    req.session.previous_tries.push({letter:letter,position:position,data:{response:response}})
    if (winCheck(req.session.previous_tries,solution)) {
        res.json({
            status:"Game Won",
            correctWord:solution,
            attemptHistory:req.session.previous_tries
        })
        req.session.destroy()
    }
    if (req.session.previous_tries.filter(el=> el.data.response===0).length === MAX_TRIES) {
        res.json({
            status:"Game Lost",
            correctWord:solution,
            attemptHistory:req.session.previous_tries
        })
        req.session.destroy()
    }
    res.json(response)
}

function resGen(letter,position,solution){
    if (!solution.includes(letter)) {return 0}
    if(solution[position]===letter){return 2}
    return 1
}

function winCheck(previous,solution){
    const array = new Array(5).fill(0)
    previous.forEach(el => {
        const letter = el.letter;const position = el.position; const response = el.data.response;
        if (response === 2) {
            array[position] = letter
        }
    });
    if (array.join('') === solution) {
        return true
    }
    return false
}