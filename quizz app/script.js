const question = [
    {
        question:"Which is the largest animal in the world?",
        answers:[
            {text: "Shark", correct:false},
            {text: "Blue whale", correct:true},
            {text: "Elephant", correct:false},
            {text: "Giraffe", correct:false},
        ]
    },
    {
        question:"Which is the smallest country in the world?",
        answers:[
            {text: "Vatican City", correct:true},
            {text: "Bhutan", correct:false},
            {text: "Nepal", correct:false},
            {text: "Sri Lanka", correct:false},
        ]
    },
    {
        question:"Which is the largest desert in the world?",
        answers:[
            {text: "Kalahari", correct:false},
            {text: "Gobi", correct:false},
            {text: "Sahara", correct:false},
            {text: "Antarctica", correct:true},
        ]
    },
    {
        question:"Which is the smallest continent in the world?",
        answers:[
            {text: "Asia", correct:false},
            {text: "Arctic", correct:false},
            {text: "Australia", correct:true},
            {text: "Africa", correct:false},
        ]
    }
];


const questionElement = document.getElementById("question");
const answerButton = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let currentQuestionindex = 0;
let score =0;

function startQuiz(){
    currentQuestionindex =0;
    score=0;
    nextButton.innerHTML="next";
    showQuestion();
}
function showQuestion(){
    resetState();
    let currentQuestion = question[currentQuestionindex];
    let questionNo = currentQuestionindex+1;
    questionElement.innerHTML=questionNo+"."+currentQuestion.question;

    currentQuestion.answers.forEach(answer =>{
        const button = document.createElement("button");
        button.innerHTML=answer.text;
        button.classList.add("btn");
        answerButton.appendChild(button);
        if(answer.correct){
            button.dataset.correct=answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}

function resetState(){
    nextButton.style.display = "none";
    while(answerButton.firstChild){
        answerButton.removeChild(answerButton.firstChild);
    }
}

function selectAnswer(e){
    const selectedBtn=e.target;
    const iscorrect =selectedBtn.dataset.correct==="true";
    if(iscorrect){
        selectedBtn.classList.add("correct");
        score++;
    }else{
        selectedBtn.classList.add("incorrect")
    }

    Array.from(answerButton.children).forEach(button=>{
        if(button.dataset.correct==="true"){
            button.classList.add("correct");
        }
        button.disabled=true;
    });
    nextButton.style.display="block";
}

nextButton.addEventListener("click", ()=>{
    if(currentQuestionindex < question.length -1){
        currentQuestionindex++;
        showQuestion();
    }else{
        showScore();
    }
});

function showScore(){
    resetState();
    questionElement.innerHTML=`You scored ${score} out of ${question.length}`; 
    nextButton.innerHTML="Play Again";
    nextButton.style.display="block";
    nextButton.addEventListener("click", startQuiz);
}
startQuiz();