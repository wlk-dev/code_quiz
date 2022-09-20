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

var question = {
    questionElem : document.querySelector(".question"),
    listElem : document.querySelector("ol"),
    listChars : "abcdefghijklmnopqrstuvwxyz",

    displayQuestion : function (question="Question?") {
        this.questionElem.textContent = question;
    },

    displayAnswers : function (answers=["A1", "A2", "A3", "A4"]) {
        removeChildElements(this.listElem);
        for(var i = 0; i < answers.length; i++) {
            var newElement = document.createElement("button");
            newElement.textContent = `${this.listChars.charAt(i)}. ${answers[i]}`;
            newElement.setAttribute("id", `ans-${i}`);
            this.listElem.appendChild( newElement );
        }
    },
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
question.displayQuestion();
question.displayAnswers();
