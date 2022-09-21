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
        console.log(element, preferred);
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
        return (element.css('display') === 'none') ? false : true;
    },

    showState : function ( stateObj ) {
       PageState.hideAll()
       PageState.showElement(stateObj.elem, stateObj.pref);
    },
} 

var BoardStorage = {
    initialized : false,

    init : function () {
        if (!localStorage.getItem("qsb")) {
            localStorage.setItem("qsb", "{}")
        }
        this.initialized = true;
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

    resetTimer : function () {
        this.timeLeft = 60;
        this.updateText();
        this.stopTimer();
    },

    stopTimer : function () {
        clearInterval(this.timerInterval);
    }, 

    startTimer : function ( onEndCallback ) {
        var self = this;
        this.timerInterval = setInterval( function () {
            if ( self.timeLeft > 0 ) {
                self.timeLeft--;
                self.updateText();
            } else {
                self.resetTimer();
                onEndCallback();
            }

        }, 1000 )
    }
}

var ScoreBoard = {
    table : {},

    loadTable : function (newTable) {
        this.table = newTable;
    },

    addEntry : function (name, score) {
        this.table[name] = score;
    },

    deleteEntry : function ( name ) {
        if (this.table[name]) {
            delete this.table[name]
        }
    },

    getScoreStrings : function () {
        var scoreStrings = [];
        for ( const key in this.table ) {
            scoreStrings.push( `${key} : ${this.table[key]}` )
        }
        return scoreStrings;
    },

    showScores : function () {
        var arr = this.getScoreStrings()
        if ( arr.length ) { // check if array is empty
            for ( const idx in arr ) {
                $("#score-table").append( `<button>${arr[idx]}</button>` );
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
            if (idx === index) {
                listElems.push( $(`<button class="data-ans">${this.listChars[idx]}. ${responses[idx]}</button>`) )
            } else {
                listElems.push( $(`<button>${this.listChars[idx]}. ${responses[idx]}</button>`) )
            }
        }

        this.questionObjs.push( { text: text, responses : listElems } )
    },

    totalQuestions : function () { 
        return this.questions.length; // we don't want to store this in memory we want to be sure we are getting an up to date value
    },
}

var Quiz = {
    
}

$("#score-link").click( function (evt) {
    PageState.showState( PageState.scoreBoard);
});

$("#home-link").click( function (evt) {
    PageState.showState( PageState.quizPrompt );
});

// $("#submit-result").click( function(evt) {
//     scoreBoard.addEntry( $("#initials").val(), score)
//     BoardStorage.setScores(scoreBoard.table);
//     pageState.showState( pageState.scoreBoard );
// });

function main () {
    BoardStorage.init();
    ScoreBoard.loadTable(BoardStorage.getScores());
    ScoreBoard.showScores()

    PageState.hideAll();
    PageState.showState(PageState.quizPrompt);
}

main();