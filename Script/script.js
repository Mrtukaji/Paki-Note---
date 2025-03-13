document.getElementById('saveNote').addEventListener('click', function() {
     const noteInput = document.getElementById('noteInput').value;
     const noteTag = document.getElementById('noteTag').value;
     if (noteInput) {
         const noteList = document.getElementById('noteList');
         const noteItem = document.createElement('div');
         noteItem.textContent = `${noteTag}: ${noteInput}`;
         noteList.appendChild(noteItem);
         document.getElementById('noteInput').value = '';
         document.getElementById('noteTag').value = '';
     }
 });
 // Calendar Functionality
document.getElementById('addEvent').addEventListener('click', function() {
     const eventDate = document.getElementById('eventDate').value;
     const eventDescription = document.getElementById('eventDescription').value;
     if (eventDate && eventDescription) {
         const eventList = document.getElementById('eventList');
         const eventItem = document.createElement('div');
         eventItem.textContent = `${eventDate}: ${eventDescription}`;
         eventList.appendChild(eventItem);
         document.getElementById('eventDate').value = '';
         document.getElementById('eventDescription').value = '';
     }
 });
 
 // Quiz Functionality
 document.getElementById('startQuiz').addEventListener('click', function() {
     const questionCount = parseInt(document.getElementById('questionCount').value);
     if (isNaN(questionCount) || questionCount <= 0) {
         alert("Please enter a valid number of questions.");
         return;
     }
 
     const quizContainer = document.getElementById('quizContainer');
     quizContainer.innerHTML = ''; // Clear previous quiz
 
     for (let i = 0; i < questionCount; i++) {
         const questionDiv = document.createElement('div');
         questionDiv.classList.add('quiz-question');
 
         // Example questions (you can replace these with dynamic content)
         const questionText = `Question ${i + 1}: What is the capital of France?`;
         const correctAnswer = "Paris"; // Example correct answer
 
         questionDiv.innerHTML = `
             <p>${questionText}</p>
             <input type="text" class="quiz-answer" placeholder="Your answer">
             <button class="check-answer">Check Answer</button>
             <p class="feedback" style="display:none;"></p>
         `;
 
         quizContainer.appendChild(questionDiv);
 
         // Check answer functionality
         questionDiv.querySelector('.check-answer').addEventListener('click', function() {
             const userAnswer = questionDiv.querySelector('.quiz-answer').value;
             const feedback = questionDiv.querySelector('.feedback');
             if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                 feedback.textContent = "Correct!";
                 feedback.style.color = "green";
             } else {
                 feedback.textContent = `Incorrect! The correct answer is ${correctAnswer}.`;
                 feedback.style.color = "red";
             }
             feedback.style.display = "block";
         });
     }
 });