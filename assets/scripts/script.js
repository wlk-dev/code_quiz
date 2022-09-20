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

    solutionIndex : 0,

    displayQuestion : function (question="Question?") {
        this.questionElem.textContent = question;
    },

    displayAnswers : function (answers=["A1", "A2", "A3", "A4"]) {
        removeChildElements(this.listElem);
        for(var i = 0; i < answers.length; i++) {
            var newElement = document.createElement("button");
            newElement.textContent = `${this.listChars.charAt(i)}. ${answers[i]}`; // prepends : a,b,c,d, etc to the answer
            newElement.setAttribute("id", `ans-${i}`); // adds an indexed id to each element 
            this.listElem.appendChild( newElement ); // adds new element to the parent element
        }
    },

    addListeners : function (total) {
        for (var i = 0; i < total; i++) {
            var elem = document.getElementById(`ans-${i}`); // get each answer elem by the indexed id
            elem.solutionIndex = this.solutionIndex
            console.log(this.solutionIndex)
            elem.addEventListener("click", this.evaluateAnswer)
        }
    },

    evaluateAnswer : function (evt) {
        if (evt.currentTarget.id === String(`ans-${evt.currentTarget.solutionIndex}`)){
            console.log("Correct Answer");
        } else {
            console.log("Incorrect Answer");
        }

        // nextQuestionCallback()
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
quiz.displayQuestion();
quiz.displayAnswers();
quiz.addListeners(4, 0);
