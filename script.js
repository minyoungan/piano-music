<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Piano Major Thirds Trainer</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container-fluid">
        <div id="controls" class="d-flex flex-column align-items-center mb-3">
            <button class="btn btn-success mb-3" onclick="startTest()">Test Major Thirds</button>
            <div id="question" class="fs-4 fw-bold text-center"></div>
            <div id="feedback" class="fs-5 text-center"></div>
            <div id="score" class="fw-bold"></div>
        </div>
        
        <div class="circle-container" id="circle"></div>
        
        <button id="nextButton" class="btn btn-primary mb-3 d-none" onclick="nextQuestion()">
            Next Question
        </button>
        
        <div id="explanation" class="bg-white p-3 rounded shadow-sm"></div>
    </div>

    <script>
        const noteRelations = {
            // Sharps
            'C': 'E',
            'G': 'B',
            'D': 'F♯',
            'A': 'C♯',
            'E': 'G♯',
            'B': 'D♯',
            'F♯': 'A♯',
            'C♯': 'E♯',
            'G♯': 'B♯',
            'D♯': 'F𝄪',
            'A♯': 'C𝄪',
            'F': 'A',
            
            // Flats
            'B♭': 'D',
            'E♭': 'G',
            'A♭': 'C',
            'D♭': 'F',
            'G♭': 'B♭',
            'C♭': 'E♭',
            'F♭': 'A♭'
        };

        const enharmonicMap = {
            'F♯': 'G♭',
            'G♭': 'F♯',
            'C♯': 'D♭',
            'D♭': 'C♯',
            'G♯': 'A♭',
            'A♭': 'G♯',
            'D♯': 'E♭',
            'E♭': 'D♯',
            'A♯': 'B♭',
            'B♭': 'A♯',
            'E♯': 'F',
            'F': 'E♯',
            'B♯': 'C',
            'C': 'B♯',
            'F𝄪': 'G',
            'G': 'F𝄪',
            'C𝄪': 'D',
            'D': 'C𝄪'
        };

        let currentNote = null;
        let score = 0;
        let totalQuestions = 0;
        let isWaiting = false;
        let startTime = null;
        let questionHistory = [];

        function createCircle() {
            const container = document.getElementById('circle');
            const circleNotes = [
                ['C'],
                ['G'],
                ['D'],
                ['A'],
                ['E'],
                ['B'],
                ['F♯', 'G♭'],
                ['C♯', 'D♭'],
                ['G♯', 'A♭'],
                ['D♯', 'E♭'],
                ['A♯', 'B♭'],
                ['F']
            ];
            
            circleNotes.forEach((noteGroup, index) => {
                const angle = (index * 30 - 90) * (Math.PI / 180);
                const x = 230 + 200 * Math.cos(angle);
                const y = 230 + 200 * Math.sin(angle);
                
                const noteElement = document.createElement('div');
                noteElement.className = 'note';
                noteElement.style.left = `${x}px`;
                noteElement.style.top = `${y}px`;

                if (noteGroup.length > 1) {
                    const noteDiv = document.createElement('div');
                    noteDiv.className = 'note-split';
                    noteGroup.forEach(n => {
                        const span = document.createElement('span');
                        span.textContent = n;
                        span.onclick = () => checkAnswer(n);
                        noteDiv.appendChild(span);
                    });
                    noteElement.appendChild(noteDiv);
                } else {
                    noteElement.textContent = noteGroup[0];
                    noteElement.onclick = () => checkAnswer(noteGroup[0]);
                }
                
                container.appendChild(noteElement);
            });
        }

        function startTest() {
            if (isWaiting) return;
            resetNotes();
            const notes = Object.keys(noteRelations);
            currentNote = notes[Math.floor(Math.random() * notes.length)];
            
            document.getElementById('question').textContent = 
                `Find the major third of ${currentNote}`;
            document.getElementById('feedback').textContent = '';
            document.getElementById('explanation').textContent = '';
            document.getElementById('nextButton').style.display = 'none';
            startTime = new Date();
        }

        function isEnharmonicallyEqual(note1, note2) {
            if (note1 === note2) return true;
            if (enharmonicMap[note1] === note2) return true;
            if (enharmonicMap[note2] === note1) return true;
            return false;
        }

        function checkAnswer(selectedNote) {
            if (!currentNote || isWaiting) return;
            
            const endTime = new Date();
            const timeElapsed = (endTime - startTime) / 1000;
            
            totalQuestions++;
            const correctAnswer = noteRelations[currentNote];
            const isCorrect = isEnharmonicallyEqual(selectedNote, correctAnswer);
            
            const noteElements = document.getElementsByClassName('note');
            const feedbackElement = document.getElementById('feedback');
            const explanationElement = document.getElementById('explanation');
            
            Array.from(noteElements).forEach(el => {
                const noteText = el.textContent;
                if (noteText === correctAnswer || 
                    (noteText.includes(correctAnswer) && noteText.includes(enharmonicMap[correctAnswer]))) {
                    el.classList.add('active');
                }
            });
            
            if (isCorrect) {
                score++;
                feedbackElement.style.color = 'green';
                feedbackElement.textContent = `Correct! ✓ (${timeElapsed.toFixed(1)} seconds)`;
                const enharmonic = enharmonicMap[correctAnswer];
                if (enharmonic) {
                    feedbackElement.textContent += ` (${correctAnswer} = ${enharmonic})`;
                }
            } else {
                Array.from(noteElements).forEach(el => {
                    if (el.textContent === selectedNote || 
                        (el.textContent.includes(selectedNote) && el.textContent.includes(enharmonicMap[selectedNote]))) {
                        el.classList.add('wrong');
                    }
                });
                
                feedbackElement.style.color = 'red';
                feedbackElement.textContent = `Wrong! The correct answer is ${correctAnswer} (${timeElapsed.toFixed(1)} seconds)`;
                const enharmonic = enharmonicMap[correctAnswer];
                if (enharmonic) {
                    feedbackElement.textContent += ` (also written as ${enharmonic})`;
                }
                
                explanationElement.textContent = `
                    How to find the major third of ${currentNote}:
                    1. Start at ${currentNote}
                    2. Count four semitones up
                    3. Land on ${correctAnswer}${enharmonic ? ` (also written as ${enharmonic})` : ''}
                    
                    Remember: A major third is always four semitones above the root note.`;
            }
            
            updateScore();
            isWaiting = true;
            document.getElementById('nextButton').style.display = 'block';
        }

        function nextQuestion() {
            isWaiting = false;
            startTest();
        }

        function resetNotes() {
            const notes = document.getElementsByClassName('note');
            Array.from(notes).forEach(note => {
                note.classList.remove('active', 'wrong');
            });
        }

        function updateScore() {
            document.getElementById('score').textContent = 
                `Score: ${score}/${totalQuestions} (${Math.round(score/totalQuestions*100)}%)`;
        }

        window.onload = createCircle;
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
