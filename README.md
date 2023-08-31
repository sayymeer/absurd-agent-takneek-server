## How to start server
Clone the repo and go to root folder of repo. Then run the following commands.
```
// Build docker image
docker build . -t <your username>/absurd-agent

// Run the docker image
docker run -p 8000:8000 -d <your username>/absurd-agent

//Now you can send Request to server using Thunder client or Postman or you can run cli.py and enter the port number to play the game.
```

## Using CLI

After running your server, you can either use POSTMAN or Thunder Client to send `GET` and `POST` request to `localhost:8000`. Or you can python cli using below commands:

```
// After running your docker container
python ./cli.py
```
You will be asked for port number. Enter `8000` as setup in above section.
Now you can use our command line interface.

## Games Available
Below Games are currently available and You can get list of Games by Sending a request to `GET /` .
1. **Wordle** : A game where you have to guess a 5 letter word in 6 chances. You will have to send a word and you will get an array of numbers. In which 0 -> letter not present, 1 -> letter present but at another position, 2 -> letter present at correct position
2. **Hangman** : A game where you have to guess a Word in 7 wrong chances. The length of the word is provided. You have to send a letter, in response you will get an array of indices where the letter is present or -1 if the letter is not present in the word
3. **Hanguced** : This is a reduced difficulty version of Hangman. When game starts, you will get length of mystery word and an array of letters. The word will be made out of letters from that array.
4. **Wordman** : In this game you have to guess a 5 letter word with 7 wrong chances. You have to guess letter and its position. In response you will get 0 -> letter not present, 1 -> letter present but at another position, 2 -> letter present at provided position.
5. **Duordle** : This is two wordle games playing together. You have to guess two words in 9 chances.

## How to Play
Below are steps to Play any above game:

1. Send a request to `GET /`. You will get a list of games. It will initialize a session for you.
2. Send a request to `POST /` with your game for e.g. `{"game" : "wordle"}`. Then you will get a success message if the game is wordle, wordman or Duordle. You will get number of letters if selected game is hangman. You will get number of letters and options if game is hanguced.
3. Now you have to send your response at `POST /`.
4. Details of request and response for each game is given below.
5. When the game ends session will be destroyed.

## Setting Up Dictionary
When you start your game with `GET /`, you can set your dictionary by making a request at `POST /dictionary`. By default dictionary contains list of english words. Request will look like below, here `set` parameter is 1, which means dictionary will be replaced by received words, if `set` parameter is not sent in request then list of words in request will be appended to original dictionary.
```
{
    "words":["this","is","a","list","of","words"],
    "set":1 //optional
}
```
## Structure of Request and Response of different games

### 1.Wordle

Wordle is a beloved word-guessing game that offers a unique challenge:

1. Upon starting, you'll receive a success message that you're in the Wordle game.
2. Your objective is to deduce a 5-letter mystery word within 6 attempts.
3. Participate by submitting words to `POST /` (e.g., `{"word": "anime"}`). Ensure your word consists of exactly 5 letters.
4. After each attempt, you'll receive a feedback array of numbers indicating the accuracy of your guesses, like `[1, 0, 0, 0, 2]`.
   - `0`: Letter not present.
   - `1`: Letter present but in the wrong position.
   - `2`: Letter present and in the correct position.
5. In case you exhaust all 6 attempts, you'll be informed of a "Game Lost," revealing the correct word and your attempt history.
6. Successfully guessing the word within 6 attempts will earn you a "Game Win" message, along with your correct guess and attempt history.

Get ready for engaging word challenges and have a blast playing our assortment of word games!

---


### 2.Hangman

1. Get ready for the classic challenge of Hangman!

2. At the start, you'll receive the length of the mystery word.
3. Send your guesses to `POST /` using the format `{"letter": "a"}` where "a" is your chosen letter.
4. If the guessed letter doesn't exist in the word, you'll receive a response of `-1`.
5. If the guessed letter exists in the word, you'll receive an array of indices indicating where the letter is found.
6. Make your guesses within 7 wrong attempts to win the game.
7. If you don't guess the word within 7  wrong attempts, you'll receive a "Game Lost" message along with the correct word and your attempt history.
8. Successfully guessing the word before 7 wrong attempts will earn you a "Game Win" message, along with your correct guess and attempt history.

Enjoy the thrill of the Hangman challenge and have a blast playing our assortment of word games!


---
### 3.Hanguced

Engage in a novel twist on the classic Hangman game with Hanguced:

1. Enjoy Hangman with an exciting twist—choose letters from a predefined set!

2. Upon initiation, the game will present you with the following details:
   - The number of blanks to fill, similar to the word length in traditional Hangman.
   - An array of letters to select from.
   
   Example starting message:
   ```json
   {
     "blanks": 7,
     "letters": ["p", "c", "i", "l", "a", "w", "h", "f", "y", "e", "k", "b", "x", "d", "s"]
   }

3. Utilize the provided letters to guess the word, adhering to the familiar Hangman rules.
4. Make your guesses by sending them to the POST / endpoint, using the format {"letter": "a"}, where "a" is your selected letter.
5. Receive responses that indicate the correctness of your guesses.
6. Your goal remains the same: uncover the word within the designated number of attempts.
Note: All other rules and instructions mirror the traditional Hangman game.

Embrace the challenge of Hanguced's unique letter-selection feature and enjoy a fresh take on the classic Hangman experience!

### 4. Wordman

In this game you have to guess a 5 letter word with 7 wrong chances. You have to guess letter and its position. In response you will get 0 -> letter not present, 1 -> letter present but at another position, 2 -> letter present at provided position.

1. Send a request to `GET /`.
2. Send a request to `POST /` with request body `{"game":"wordman"}`.
3. You will get a success message.
4. Now you have to send request to `POST /` with body as in this, `{"letter":"e","position":3}`, now there are three possible responses:
    - 0 : letter is not present in the mystery word
    - 1 : letter is present in mystery word but at another position
    - 2 : letter is present at position given in body
5. If you get 6 zeroes before guessing the mystery word then player loses. And you will get response as in below e.g.:
    ```
    {
        "status": "Game Lost","correctWord": "pease",
        "attemptHistory": [
            {
            "letter": "e",
            "position": 4,
            "data": {
                "response": 2
            }
            }
        ] // attemptHistory will contain an array like this
    }
    ```
6. If you guess the correct word correctly, then you will get a response like below:
    ```
    {
        "status": "Game Won",
        "correctWord": "narre",
        "attemptHistory": [
            {
            "letter": "a",
            "position": 0,
            "data": {
                "response": 1
            }
        }
        ] // attemptHistory will contain an array like this
    }
    ```

> You will only win the game when you will correctly guess both the letter and position.

### 5. Duordle

This game is similar to wordle, but you have to guess 2 words of length five simultaneously in 9 attempts. If you correctly guessed both the word in 9 attempts player will win the game or else player will lose.

1. Send a request to `GET /`.
2. Send a request to `POST /` with request body `{"game":"duordle"}`.
3. You will get a success message.
4. Now send your words to `POST /` with body as in e.g. `{"word":"slate"}`. Now you will get response object like below, where `gameOne` represents response for mystery word one and `gameTwo` represents response for mystery word two. 0,1,2 means same as in wordle:
    ```
    {
    "gameOne": [
        0,
        0,
        1,
        0,
        0
    ],
    "gameTwo": [
        1,
        0,
        0,
        0,
        0
    ]
    }
    ```
5. If you guess one correct for e.g. like of `gameTwo` it will send "Completed" in gameTwo of response object.
6. If you are unable to guess both the words then you will lose and will get a response like below:
    ```
    {
    "status": "Game Lost",
    "correctWordOne": "forma",
    "correctWordtwo": "omnis",
    "attemptHistory": [
        {
        "attempt": "slate",
        "data": {
            "response1": [0,0,1,0,0],
            "response2": [1,0,0,0,0]
        }
        }
    ] // attemptHistory like this
    }
    ```
7. If you correctly guess both the words in 9 attempts you will get `status:"Game Win"` in response object with above body.
