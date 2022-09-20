var scoreLink = document.getElementById("score-link");

var timer = {
    elem : document.getElementById("quiz-timer"),
    timeLeft : 60,
    penalty : 10,
    visible : true,
    
    resetTimer : function () {
        this.timeLeft = 60;
    },
    
    invokePenalty : function () {
        this.timeLeft -= this.penalty;
    },

    updateTimer : function () {
        this.elem.textContent = `Time left: ${this.timeLeft}`;
    },
    
    toggleTimer : function () {
        this.resetTimer();
        this.updateTimer();
        this.visible =  !!toggleElementDisplay(this.elem); // evaluates visiblity based on returned value
    }
    
}

var quiz = {
    questionElem : document.querySelector(".question"),
    listElem : document.querySelector("ol"),
    listChars : "abcdefghijklmnopqrstuvwxyz",

    questions : [],

    displayQuestionText : function (question="Question?") {
        this.questionElem.textContent = question;
    },

    displayAnswersText : function (answers=["A1", "A2", "A3", "A4"]) {
        removeChildElements(this.listElem);
        for(var i = 0; i < answers.length; i++) {
            var newElement = document.createElement("button"); // :TODO separte the element building into a separate function
            newElement.textContent = `${this.listChars.charAt(i)}. ${answers[i]}`; // prepends : a,b,c,d, etc to the answer
            newElement.setAttribute("id", `ans-${i}`); // adds an indexed id to each element 
            this.listElem.appendChild( newElement ); // adds new element to the parent element
            // prefix attributes with data-
        }
    },

    evaluateAnswer : function (evt) {
        console.log(evt.target)
        if (evt.target.id === String(`ans-${evt.target.solutionIndex}`)){
            console.log("Correct Answer");
        } else {
            console.log("Incorrect Answer");
        }

        // nextQuestionCallback()
    },

    addListeners : function (total, solutionIndex) {
        for (var i = 0; i < total; i++) {
            var elem = document.getElementById(`ans-${i}`); // get each answer elem by the indexed id
            elem.solutionIndex = solutionIndex
            elem.addEventListener("click", this.evaluateAnswer)
        }
    },

    addQuestion : function (question) {
        this.questions.append(question);
    },

    // we need a function to wrap this function, that is then used as a callback for the event listeners
    // just refactor this shit honestly
    popQuestion : function () {
        if ( !!this.questions.length ) { // if no questions are left return false
            return false;
        } else {
            var question = this.questions.pop()
            this.displayQuestionText(question.questionText)
            this.displayAnswersText(questions.answers)
            this.addListeners(questions.len, question.solutionIndex)
            return true;
        }
    }

}

class Question {
    constructor(questionText, answers, solutionIndex) {
        this.questionText = questionText;
        this.answers = answers;
        this.solutionIndex = solutionIndex;
        this.len = answers.length
    }
}

function removeChildElements (element) {
    while (element.firstChild) { // while firstChild exists
        element.removeChild(element.firstChild); // remove firstChild
    } // clears all children from an element
}

function toggleElementDisplay(element, preferredDisplay="block") {
    var result = 0;
    if (element.style.display === "none") {
        element.style.display = preferredDisplay;
        result++;
    } else {
        element.style.display = "none";
    }
    return result;
}

toggleElementDisplay(document.querySelector(".quiz-prompt"));
quiz.displayQuestionText();
quiz.displayAnswersText();
quiz.addListeners(4, 0);
