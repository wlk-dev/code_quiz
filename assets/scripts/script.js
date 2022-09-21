var timer = {
    element : document.getElementById("quiz-timer"),
    timerInterval : undefined,
    timeLeft : 60,
    timePenalty : 10,
    visible : true,

    updateText : function () {
        this.element.textContent = `Time left: ${this.timeLeft}`
    },

    toggleVisible : function () {
        this.visible = toggleElementDisplay(this.element);
    },

    resetTimer : function () {
        this.timeLeft = 60;
        this.updateText();
        this.stopTimer()
    },
    
    invokePenalty : function () {
        this.timeLeft -= this.timePenalty;
        this.updateText();
    },

    tickTime : function () {
        this.timeLeft--;
        this.updateText();
    },
    
    stopTimer : function () {
        clearInterval(this.timerInterval);
    },

    startTimer : function () {
        var self = this
        this.timerInterval = setInterval( function () {
            self.tickTime();
            if (self.timeLeft === 0) {
                self.stopTimer()
                return; // add callback
            }

        }, 1000)
    }
}

var questionBank = {
    questions : [],
    currentQuestion : 0,
    listChars : "abcdefghijklmnopqrstuvwxyz",

    addQuestion : function (questionText, responses, answerIndex) {
        var questionObj = { text : questionText, responses : [] }
        var list = createListElements(responses.length, answerIndex);
        for ( var i = 0; i < responses.length; i++) {
            list[i].textContent = String(`${this.listChars.charAt(i)}. ${responses[i]}`); // prepend a char to explicitly indicate the different options
            questionObj.responses.push( list[i] );
        }
        this.questions.push( questionObj );
    },

    totalQuestions : function () { 
        return this.questions.length; // we don't want to store this in memory we want to be sure we are getting an up to date value
    },

    hasQuestions : function () {
        if (!!this.questions.length) {
            return true;
        } else {
            console.warn("User is most likely trying to retrieve a question, however none exist.") 
            return false; // in our use case this should never return 'false' so if that happened something is likely wrong
        }
    },

    getCurrentQuestion : function () {
        if ( this.hasQuestions() ) { // if we have questions, return the current one
            return this.questions[this.currentQuestion];
        }
    },

    nextQuestion : function () {
        if ( this.currentQuestion < this.totalQuestions() ) {
            this.currentQuestion++;
            return this.getCurrentQuestion();
        }
        return null;
    },

    previousQuestion : function () {
        if ( this.currentQuestion > 0 ) {
            this.currentQuestion--;
            return this.getCurrentQuestion();
        }
        return null;
    },

    setQuestion : function (index) {
        if ( index > this.totalQuestions() || index < 0 ) {
            console.warn(`${index} is not a valid question index, valid range: 0 .. ${this.totalQuestions()-1}`)
            return;
        }
        this.currentQuestion = index;
        return this.getCurrentQuestion();
    }
}

var scoreBoard = {
    aware : false,
    currentIndex : 0,

    submitPrompt : document.querySelector(".post-quiz"), // submit score screen
    promptVisible : true,

    init : function () { // in hindsight, i could probably store all scores in a single key, value pair
        var result;
        if ( !!( result = localStorage.getItem("qsb-tr-idx") ) ) {
            this.currentIndex = result;
            this.aware = true
        } else {
            localStorage.setItem("qsb-tr-idx", 0);
            this.aware = true
        }
    },

    updateTracking : function () {
        if (!this.aware) {
            console.warn("Please init the scoreboard before trying to use it.")
            return;
        }
        localStorage.setItem("qsb-tr-idx", this.currentIndex);
        this.currentIndex++;
    },

    addScore : function (nickname, score) {
        if (!this.aware) {
            console.warn("Please init the scoreboard before trying to use it.")
            return;
        }
        nickname = nickname.replaceAll(":", "-"); // : is used to separate data, so we dont want that being in the nickname
        localStorage.setItem(String(`qsb-sc-${this.currentIndex}`), String(`${nickname}:${score}`))
        this.updateTracking();
    },

    getScores : function () {
        if (!this.aware) {
            console.warn("Please init the scoreboard before trying to use it.")
            return;
        }
        var scores = [];
        for ( var i = 0; i < this.currentIndex; i++ ) {
            var item = localStorage.getItem( `qsb-sc-${i}` );
            if ( item ) {
                scores.push( { name : item[0], score : item[1] } )
            }
        }
        return scores;
    },

    clearScoreBoardData : function () { // clears all data related to the scoreboard from localStorage
        for ( const prop in localStorage ) {
            if ( prop.includes("qsb-sc-") || prop === "qsb-tr-idx" ) {
                localStorage.removeItem(prop);
            }
        }
        this.currentIndex = 0;
    },

    togglePromptVisible : function () {
        this.promptVisible = toggleElementDisplay(this.submitPrompt, "flex");
    },

}

var quizState = {
    promptElem : document.querySelector(".quiz-prompt"),    // initial prompt to start quiz
    startElem : document.getElementById("start-btn"),       // start quiz button
    quizElem : document.querySelector(".quiz-section"),     // containing div
    questionElem : document.querySelector(".question"),     // question h2 tag, this shows the actual question that is being asked
    listElem : document.getElementById("responses"),        // this is the where all the response will appear
    resultElem : document.getElementById("result"),         // this rests below all the other elements, this is where we say, 'Correct!' 'Wrong!'

    quizVisible : false,
    promptVisible : true,

    
    toggleQuizVisible : function () {
        this.quizVisible = toggleElementDisplay(this.quizElem);
        return this.quizVisible;
    },

    togglePromptVisible : function () {
        this.promptVisible = toggleElementDisplay(this.promptElem, "flex");
    },

    showQuestion : function ( question ) {
        this.questionElem.textContent = question;
    },

    showResponses : function ( resps ) {
        removeChildElements( this.listElem )
        for ( const idx in resps ) {
            this.listElem.appendChild(resps[idx]);
        }
    },

    presentQuestion : function (question) {
        this.showQuestion( question.text );
        this.showResponses( question.responses )
    }

}

quizState.listElem.addEventListener("click", function (event) {
    if (event.target.matches("button")) { // this works you tested it in console
        if ( event.target.dataset.ans ) {
            console.log("Correct Answer!")
            quizState.resultElem.textContent = "Correct!"
        } else {
            console.log("Wrong Answer!")
            quizState.resultElem.textContent = "Wrong!" // probably move this shit into a function, and have a fade out (do fade out stuff last, seems a bit time consuming)

        }

        var ques;
        if ( (ques = questionBank.nextQuestion()) ) {
            quizState.presentQuestion(ques);
        } else {
            quizState.toggleQuizVisible();
            scoreBoard.togglePromptVisible();
            console.log("Quiz over!")
        }

    }
});

quizState.startElem.addEventListener("click", function () {
    quizState.togglePromptVisible();
    quizState.toggleQuizVisible();
});

function createListElements(length, ansIndex) { // this works as well
    var list = [];
    for( var i = 0; i < length; i++ ) {
        list.push( document.createElement("button") )
        if (i == ansIndex) {
            list[i].setAttribute("data-ans", "true");
        }
    }
    return list;
}

function removeChildElements (element) {            // clears all children from an element
    while (element.firstChild) {                    // while firstChild exists
        element.removeChild(element.firstChild);    // remove firstChild
    } 
}

function toggleElementDisplay(element, preferredDisplay="block") {
    if (element.style.display === "none") {
        element.style.display = preferredDisplay;
        return true;
    } else {
        element.style.display = "none";
        return false;
    }
}

function main () {
    scoreBoard.init()
    // quizState.togglePromptVisible();
    quizState.toggleQuizVisible();
    scoreBoard.togglePromptVisible();
    
    questionBank.addQuestion( "Commonly used data types DO NOT include:", ["strings", "booleans", "alerts", "numbers"], 2 );
    questionBank.addQuestion( "The condition in an if / else statement is enclosed with ____.", ["quotes", "curly brackets", "parentheses", "square brackets"], 2 );
    questionBank.addQuestion( "Arrays in JavaScript can be used to store ____.", ["numbers and strings", "other arrays", "booleans", "all of the above"], 3 );
    questionBank.addQuestion( "String values must be enclosed within ____ when being assigned to variable.", ["commas", "curly brackets", "quotes", "parentheses"], 2 );
    questionBank.addQuestion( "A very useful tool used during development and debugging for printing content to the debugger is:", ["JavaScript", "terminal / bash", "for loops", "console.log"], 3 );
    quizState.presentQuestion( questionBank.getCurrentQuestion() )  
    
}

main();