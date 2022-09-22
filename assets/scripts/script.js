var PageState = {
    quizPrompt : {elem : $(".quiz-prompt"), pref : "flex"},
    quizSection : {elem : $(".quiz-section"), pref : "block"},
    postQuiz : {elem : $(".post-quiz"), pref : "flex"},
    scoreBoard : {elem : $(".quiz-scoreboard"), pref : "block"},

    getAllElements : function () {
        return [ this.quizPrompt, this.quizSection, this.postQuiz, this.scoreBoard ]
    },

    hideAll : function () {
        var all = this.getAllElements()
        for ( const idx in all ) {
            var obj = all[idx];
            if ( this.isVisible( obj.elem ) ) {
                this.hideElement(obj.elem, obj.pref);
            }
        }
    },

    hideElement : function (element) {
        element.css('display', "none");
    },

    showElement : function ( element, preferred="block" ) {
        element.css('display', preferred);
    },

    toggleElement : function ( element, preferred ) {
        if ( !this.isVisible(element) ) {
            element.css('display', preferred);
        } else {
            element.css('display', "none");
        }
    },

    isVisible : function (element) {
        return (element.css('display') === 'none') ? false : true; // we assume if the display is not equal to none then it is visible, ternary style
    },

    showState : function ( stateObj ) { // Hide everything else, then show what we want.
       PageState.hideAll()
       PageState.showElement(stateObj.elem, stateObj.pref);
    },
} 

var BoardStorage = {
    initialized : false,

    init : function () {
        if (!localStorage.getItem("qsb")) {
            localStorage.setItem("qsb", "[]")
        }
        this.initialized = true;
    },

    clearScores : function () {
        this.setScores( [] )
    },

    setScores : function ( scoreBoard ) {
        localStorage.setItem("qsb", JSON.stringify(scoreBoard))
    },

    getScores : function () {
        if (!this.initialized) {
            console.warn("Trying to retrieve scores without initializing storage.")
        }

        return JSON.parse(localStorage.getItem("qsb"))
    },
}

var Timer = {
    timerInterval : undefined,
    timeLeft : 60,
    timePenalty : 10,

    updateText : function () {
        $("#quiz-timer").text(String(`Time left: ${this.timeLeft}`));
    },

    invokePenalty : function () {
        this.timeLeft -= this.timePenalty;
        this.updateText();
    },

    resetTimer : function () {
        this.timeLeft = 60;
        this.updateText();
        this.stopTimer();
    },
    
    stopTimer : function () {
        clearInterval(this.timerInterval);
    }, 

    startTimer : function ( onTimeout ) {
        var self = this;
        this.timerInterval = setInterval( function () {
            if ( self.timeLeft > 0 ) {
                self.timeLeft--;
                self.updateText();
            } else {
                self.resetTimer();
                Quiz.failed = true; // I am beyond annoyed at the fact, that `this` is not in the callback namespace by default
                onTimeout();
            }

        }, 1000 )
    }
}

var ScoreBoard = {
    table : [],

    loadTable : function (newTable) {
        this.table = newTable;
        this.showScores()
    },

    clearTable : function () {
        this.table = [];
        this.showScores()
    },

    addEntry : function (name, score) {
        this.table.push( {name : name, score : score} );
    },

    getScoreStrings : function () {
        var scoreStrings = [];
        for ( const idx in this.table ) {
            scoreStrings.push( `${this.table[idx].name} : ${this.table[idx].score}` )
        }
        return scoreStrings;
    },

    showScores : function () {
        var arr = this.getScoreStrings()
        $("#score-table").empty()
        if ( arr.length ) { // check if array is empty
            for ( const idx in arr ) {
                $("#score-table").append( `<button>${arr[idx]}</button>` ); // I was lazy and just used buttons because I already styled them :(
            }
        }   
    }
}

var QuestionBank = {
    questionObjs : [],
    listChars : "abcdefghijklmnopqrstuvwxyz",

    addQuestion : function( text, responses, index ) { // question text, possible responses, index of the correct response
        var listElems = [];
        for ( const idx in responses ) {
            if (idx == index) {
                listElems.push( $(`<button data-ans="yes">${this.listChars[idx]}. ${responses[idx]}</button>`) ) // if its our answer add some data to it
            } else {
                listElems.push( $(`<button>${this.listChars[idx]}. ${responses[idx]}</button>`) ) // if its not our answer just a regular old button
            }
        }

        this.questionObjs.push( { text: text, responses : listElems } ) // setup a nice question object to work with
    },
}

var Quiz = {
    questionObjs : [],
    currentQuestion : 0,

    score : 0,
    failed : false,

    failedQuiz : function () {
        Timer.stopTimer();
        $("#final-score").text("Failed");
        PageState.showState( PageState.postQuiz );
    },
    
    completedQuiz : function () {
        Timer.stopTimer();
        $("#final-score").text(String(`${this.score}/50`));
        PageState.showState( PageState.postQuiz );
    },

    resetQuiz : function () {
        this.score = 0;
        Timer.resetTimer()
        Quiz.setCurrentQuestion(0);
        $("#result").text("") // remove bottom result text so it doesn't stick
    },

    getScoreString : function () {
        if ( this.failed ) {
            this.failed = false;
            return "Failed";
        } else {
            return String(`${this.score}/50`);
        }
    },

    totalQuestions : function () { 
        return this.questionObjs.length; // we don't want to store this in memory we want to be sure we are getting an up to date value
    },

    hasQuestions : function () {
        if (this.questionObjs.length) {
            return true;
        } else {
            console.warn("User is most likely trying to retrieve a question, however none exist.") 
            return false; // in our use case this should never return 'false' so if that happened something is likely wrong
        }
    },

    getCurrentQuestion : function () {
        if ( this.hasQuestions() ) { // if we have questions, return the current one
            return this.questionObjs[this.currentQuestion];
        }
    },

    setCurrentQuestion : function (index) {
        if ( index > this.totalQuestions() || index < 0 ) {
            console.warn(`${index} is not a valid question index, valid range: 0 .. ${this.totalQuestions()-1}`)
            return;
        }
        this.currentQuestion = index;
        return this.getCurrentQuestion();
    },

    getNextQuestion : function () {
        if ( this.currentQuestion < this.totalQuestions() ) {
            this.currentQuestion++;
            return this.getCurrentQuestion();
        }
        return null;
    },

    evalResponse : function ( evt ) {
        if ( evt.target.dataset.ans ) {
            this.score += 10;
            $("#result").text("Correct!")
        } else {
            Timer.invokePenalty();
            $("#result").text("Wrong!")
        }
    },

    presentQuestion : function ( question ) {
        $("#responses").empty()
        $(".question").text(question.text);
        $("#responses").append( question.responses );
    },

    nextQuestion : function () {
        var res = this.getNextQuestion();
        if ( res ) {
            this.presentQuestion( res );
            return true;
        }
        return false
    },
}

$("#score-link").click( function (evt) {
    Quiz.resetQuiz();
    PageState.showState( PageState.scoreBoard);
});

$("#home-link").click( function (evt) {
    Quiz.resetQuiz();
    PageState.showState( PageState.quizPrompt );
});

$("#start-btn").click( function(evt) {
    Timer.startTimer( Quiz.failedQuiz )
    PageState.showState( PageState.quizSection );
    Quiz.presentQuestion( Quiz.getCurrentQuestion() )
});

$(".quiz-section").click( function(evt) {
    if (evt.target.matches("button")) {
        Quiz.evalResponse( evt )
        if ( !Quiz.nextQuestion() ) {
            Quiz.completedQuiz()
        }
    }
});

$("#submit-result").click( function() {
    var name = $("#initials").val()
    ScoreBoard.addEntry( !!name ? name : "anon", Quiz.getScoreString())
    ScoreBoard.showScores()
    Quiz.resetQuiz();
    BoardStorage.setScores(ScoreBoard.table);
    PageState.showState( PageState.scoreBoard );
});

$("#reset-score").click( function () {
    BoardStorage.clearScores();
    ScoreBoard.clearTable()
});

function main () {
    BoardStorage.init();
    ScoreBoard.loadTable(BoardStorage.getScores());

    QuestionBank.addQuestion( "Commonly used data types DO NOT include:", ["strings", "booleans", "alerts", "numbers"], 2 );
    QuestionBank.addQuestion( "The condition in an if / else statement is enclosed with ____.", ["quotes", "curly brackets", "parentheses", "square brackets"], 2 );
    QuestionBank.addQuestion( "Arrays in JavaScript can be used to store ____.", ["numbers and strings", "other arrays", "booleans", "all of the above"], 3 );
    QuestionBank.addQuestion( "String values must be enclosed within ____ when being assigned to variable.", ["commas", "curly brackets", "quotes", "parentheses"], 2 );
    QuestionBank.addQuestion( "A very useful tool used during development and debugging for printing content to the debugger is:", ["JavaScript", "terminal / bash", "for loops", "console.log"], 3 );
    Quiz.questionObjs = QuestionBank.questionObjs;

    PageState.hideAll();
    PageState.showState(PageState.quizPrompt);
}

main();