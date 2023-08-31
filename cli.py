#! /usr/bin/env python3

import json, requests, sys
from colorama import Back

ENDLINE = '\n'

port = str(input("Enter PORT number where server is running: "))
uri = "http://127.0.0.1:"+str(port)

if len(sys.argv) > 1:
    if sys.argv[1] == 'N':
        background_color = {
            0: Back.RESET,
            1: Back.RESET,
            2: Back.RESET
        }
    else:
        background_color = {
            0: Back.BLACK,
            1: Back.YELLOW,
            2: Back.GREEN
        }
else:
    background_color = {
        0: Back.BLACK,
        1: Back.YELLOW,
        2: Back.GREEN
    }


def playWordle(session, getDone=True):
    if not getDone:
        session.get(uri)
    session.post(uri, json={"game": games[choice]})
    attemps_left = 6
    print("-----")
    while attemps_left > 0:
        word = ''
        while len(word) != 5:
            word = input(f"Enter a Word (of length 5) (attemps left = {attemps_left}) : ").lower()
        response = json.loads(session.post(uri, json={"word": word}).text)
        if type(response) == list:
            print(f"{''.join([f'{background_color[response[index]]}{alpha}'for index, alpha in enumerate(word)])}{Back.RESET}")
        elif type(response) == dict:
            if "status" in response.keys():
                print(f"Result: {response['status']}\nCorrect Word: {response['correctWord']}\nAttemps Left: {attemps_left - (1 if response['status'] == 'Game Lost' else 0)}")
                break
            else:
                print("Word not in Dictionary")
                continue
        attemps_left -= 1
def playHangman(session, getDone=True):
    if not getDone:
        session.get(uri)
    word_len = json.loads(session.post(uri, json={"game": games[choice]}).text)
    attemps_left = 7
    print(f"Number of Letters in word: {int(word_len)}\n")
    word = ['-' for _ in range(word_len)]
    while attemps_left > 0:
        print(''.join(word))
        letter = ''
        while len(letter) != 1 or letter.isalpha() == False:
            letter = input(f"Enter a Letter (attemps left = {attemps_left}) : ").lower()
        response = json.loads(session.post(uri, json={"letter": letter}).text)
        if type(response) == list:
            for index in response:
                word[index] = letter
        elif type(response) == dict:
            print(f"Result: {response['status']}\nCorrect Word: {response['correctWord']}\nAttemps Left: {attemps_left - (1 if response['status'] == 'Game Lost' else 0)}")
            break
        else:
            attemps_left -= 1
def playHanguced(session, getDone=True):
    if not getDone:
        session.get(uri)
    attemps_left = 7
    response = json.loads(session.post(uri, json={"game": games[choice]}).text)
    blanks = response["blanks"]
    letters = response["letters"]
    print(f"Number of Letters in word: {int(blanks)}\n")
    word = ['-' for _ in range(blanks)]
    done = 0
    while done != len(letters):
        print(''.join(word))
        for row in range(len(letters)//5):
            print(' '.join(letters[row*5:(row+1)*5]))
        letter = ''
        while letter not in letters:
            letter = input(f"Enter a letter (Given Above) (attempts left = {attemps_left}): ").lower()
        response = json.loads(session.post(uri, json={"letter": letter}).text)
        if response != -1 and type(response) == list:
            for index in response:
                word[index] = letter
        elif type(response) == dict:
            print(f"Result: {response['status']}\nCorrect Word: {response['correctWord']}\n")
            break
        else:
            attemps_left -= 1
        done += 1
def playWordman(session, getDone=True):
    if not getDone:
        session.get(uri)
    response = json.loads(session.post(uri, json={"game": games[choice]}).text)
    attemps_left = 7
    while attemps_left > 0:
        letter = ''
        while len(letter) != 1 and letter.isalpha() == False:
            letter = input(f"Enter a Letter (attemps left = {attemps_left}) : ").lower()
        position = int(input(f"Enter the Position of the Letter (attemps left = {attemps_left}) : "))
        response = json.loads(session.post(uri, json={"letter": letter, "position": position}).text)
        if response == 0:
            print("Letter doesn't Exist in Mystery Word")
            attemps_left -= 1
        elif response == 1:
            print("Letter exists but at another position")
        elif response == 2:
            print("Letter exists and at right position")
        if type(response) == dict:
            print(f"Result: {response['status']}\nCorrect Word: {response['correctWord']}\nAttemps Left: {attemps_left - (1 if response['status'] == 'Game Lost' else 0)}")
            break
def playDuordle(session, getDone=True):
    if not getDone:
        session.get(uri)
    session.post(uri, json={"game": games[choice]})
    attemps_left = 9
    print("_____\n_____")
    correct_word_1, correct_word_2 = '', ''
    while attemps_left > 0:
        word = ''
        while len(word) != 5:
            word = input(f"Enter a Word (of length 5) (attemps left = {attemps_left}) : ").lower()
        response = json.loads(session.post(uri, json={"word": word}).text)
        if type(response) == dict:
            if "gameOne" in response.keys():
                word_1, word_2 = response["gameOne"], response["gameTwo"]
                if word_1 != "Completed":
                    print(f"{''.join([f'{background_color[word_1[index]]}{alpha}'for index, alpha in enumerate(word)])}{Back.RESET}")
                else:
                    if correct_word_1 == '':
                        correct_word_1 = word
                    print(f"{Back.GREEN}{correct_word_1}{Back.RESET}")
                if word_2 != "Completed":
                    print(f"{''.join([f'{background_color[word_2[index]]}{alpha}'for index, alpha in enumerate(word)])}{Back.RESET}")
                else:
                    if correct_word_2 == '':
                        correct_word_2 = word
                    print(f"{Back.GREEN}{correct_word_2}{Back.RESET}")
            elif "status" in response.keys():
                print(f"Result: {response['status']}\nCorrect Word 1: {response['correctWordOne']}\nCorrect Word 2: {response['correctWordtwo']}\nAttemps Left: {attemps_left - (1 if response['status'] == 'Game Lost' else 0)}")
                break
            else:
                print("Word not in Dictionary")
                continue
        attemps_left -= 1

def changeDictionary(session):
    modes = {
    0: "Updating",
    1: "Setting"
    }
    print("(1) Update Dictionary\n(2) Set Dictionary")
    choice = int(input("Enter your choice : ")) - 1
    session.get(uri)
    words = []
    word = ' '
    while word != '':
        word = ' '
        while not word.isalpha() and word != '':
            word = input("Enter a word (just press enter for nothing) : ")
        if word != '':
            words.append(word)
    print(f"{modes[choice]} Dictionary")
    session.post(f"{uri}/dictionary", json={"words": words, "set": choice})

if __name__ == "__main__":
    session = requests.session()
    choice = 0
    while True:
        data = session.get(uri)
        games = json.loads(data.text)
        print(f"Available Games\n{ENDLINE.join([f'({index+1}) {game}' for index, game in enumerate(games)])}\n({len(games)+1}) Exit\n({len(games)+2}) Change Dictionary")
        choice = int(input("Enter your Choice : ")) - 1
        if choice < len(games):
            print(f"Selected Game = {games[choice]}")
        elif choice == (len(games)+1):
            changeDictionary(session)
            continue
        else:
            break
        if games[choice] == "wordle":
            playWordle(session)
        elif games[choice] == "hangman":
            playHangman(session)
        elif games[choice] == "hanguced":
            playHanguced(session)
        elif games[choice] == "wordman":
            playWordman(session)
        elif games[choice] == "duordle":
            playDuordle(session)