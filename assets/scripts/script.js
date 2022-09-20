var scoreLink = document.getElementById("score-link");

var responseList = document.querySelector("ol");
var responseChars = "abcdefghijklmnopqrstuvwxyz";


var timer = {
    elem : document.getElementById("quiz-timer"),
    timeLeft : 60,
    penalty : 10,

    resetTimer : function () {
        this.timeLeft = 60;
    },

    invokePenalty : function () {
        this.timeLeft -= this.penalty;
    },


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

function clearResponses() {
    while (responseList.firstChild) {
        responseList.removeChild(responseList.firstChild);
    }
}

function displayResponses(resps) {
    clearResponses();
    for(var i = 0; i < resps.length; i++) {
        var newElement = document.createElement("button");
        newElement.textContent = `${responseChars.charAt(i)}. ${resps[i]}`;
        responseList.appendChild( newElement );
    }
}