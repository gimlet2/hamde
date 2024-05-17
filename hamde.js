
(function (window, document) {
    Array.prototype.random = function () {
        return this[Math.floor((Math.random() * this.length))];
    }
    Array.prototype.shaffle = function () {
        const copy = [...this]
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * i)
            const temp = copy[i]
            copy[i] = copy[j]
            copy[j] = temp
        }
        return copy;
    }

    const counterElement = document.getElementById('counter');
    const questionElement = document.getElementById('question');
    const answer1Element = document.getElementById('answer_1');
    const answer2Element = document.getElementById('answer_2');
    const answer3Element = document.getElementById('answer_3');
    const answer4Element = document.getElementById('answer_4');
    let filerFor = undefined;
    let asked = 1;
    let answered = 0;
    const classSelector = function (t) {
        return function () {
            filerFor = t;
            questions = allQuestions.filter(function (element) {
                if (filerFor === t) return true;
                return element.class === filerFor;
            });
            renderQuestion(questions.random());
        }
    }
    document.getElementById('all_questions').addEventListener('click', classSelector(undefined));
    document.getElementById('n_questions').addEventListener('click', classSelector("1"));
    document.getElementById('e_questions').addEventListener('click', classSelector("2"));
    document.getElementById('a_questions').addEventListener('click', classSelector("3"));
    let allQuestions = [];
    let questions = [];

    function loadQuestions() {
        fetch('resources/assets/fragenkatalog.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (result) {
                allQuestions = parseQuestions(result);
                questions = allQuestions;
                renderQuestion(questions.random());
            });
    };
    function parseQuestion(question) {
        var parsedQuestion = {
            number: question.number,
            class: question.class,
            question: question.question,
            picture_question: question.picture_question,
            answers: [question.answer_a, question.answer_b, question.answer_c, question.answer_d],
            pictureAnswers: [question.picture_a, question.picture_b, question.picture_c, question.picture_d],
            usePictureAnswers: question.picture_a,
            correctAnswer: question.answer_a || question.picture_a,
        };
        return parsedQuestion;
    }

    function parseQuestions(questions) {
        var parsedQuestions = [];
        questions['sections'].forEach(function (section) {
            section['sections'].forEach(function (subsection) {
                if (subsection['sections'] != undefined) {
                    subsection['sections'].forEach(function (subsubsection) {
                        subsubsection['questions'].forEach(function (question) {
                            parsedQuestions.push(parseQuestion(question));
                        });
                    });
                } else {
                    subsection['questions'].forEach(function (question) {
                        parsedQuestions.push(parseQuestion(question));
                    });
                }
            });
        });
        return parsedQuestions;
    }
    function renderQuestion(question) {
        console.log(question);
        asked++;
        answer1Element.parentElement.style.backgroundColor = 'white';
        answer2Element.parentElement.style.backgroundColor = 'white';
        answer3Element.parentElement.style.backgroundColor = 'white';
        answer4Element.parentElement.style.backgroundColor = 'white';

        questionElement.innerText = question.question;
        if (question.picture_question !== undefined) {
            questionElement.innerHTML = questionElement.innerHTML + '<br/><img src="/resources/assets/svgs/' + question.picture_question + '.svg"/>';
        }
        answers = question.answers.shaffle();
        if (question.usePictureAnswers !== undefined) {
            answers = question.pictureAnswers.shaffle();
            answer1Element.innerHTML = '<img src="resources/assets/svgs/' + answers[0] + '.svg"/>';
            answer2Element.innerHTML = '<img src="resources/assets/svgs/' + answers[1] + '.svg"/>';
            answer3Element.innerHTML = '<img src="resources/assets/svgs/' + answers[2] + '.svg"/>';
            answer4Element.innerHTML = '<img src="resources/assets/svgs/' + answers[3] + '.svg"/>';
        } else {
            answer1Element.innerText = answers[0];
            answer2Element.innerText = answers[1];
            answer3Element.innerText = answers[2];
            answer4Element.innerText = answers[3];
        }
        answer1Element.setAttribute('data-answer', answers[0]);
        answer2Element.setAttribute('data-answer', answers[1]);
        answer3Element.setAttribute('data-answer', answers[2]);
        answer4Element.setAttribute('data-answer', answers[3]);

        window.renderMathInElement(document.body, {
            // customised options
            // • auto-render specific keys, e.g.:
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
            ],
            // • rendering keys, e.g.:
            throwOnError: false
        });
        let clicked = false;
        const answerElements = [answer1Element, answer2Element, answer3Element, answer4Element];
        const onclick = function (answer, element) {
            return function () {
                if (clicked) return;
                clicked = true;
                answerElements.forEach(function (element) {
                    if (element.getAttribute('data-answer') === question.correctAnswer) {
                        element.parentElement.style.backgroundColor = 'green';
                        if (element.getAttribute('data-answer') === answer) {
                            answered++;
                        }
                    }
                });
                if (answer !== question.correctAnswer) {
                    element.parentElement.style.backgroundColor = 'red';
                }
                setTimeout(function () {
                    counterElement.innerText = answered + '/' + asked;
                    renderQuestion(questions.random());
                }, 2000);
            }
        }
        answer1Element.parentElement.onclick = onclick(answers[0], answer1Element);
        answer2Element.parentElement.onclick = onclick(answers[1], answer2Element);
        answer3Element.parentElement.onclick = onclick(answers[2], answer3Element);
        answer4Element.parentElement.onclick = onclick(answers[3], answer4Element);
    };

    loadQuestions();
})(window, document);