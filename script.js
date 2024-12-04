// Add these variables at the top with other declarations
let orderedNotes = [];
let currentIndex = 0;
let isOrderedMode = true;

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
                // Make the entire span clickable
                span.style.cursor = 'pointer';
                span.onclick = (e) => {
                    e.stopPropagation();
                    checkAnswer(n);
                };
                noteDiv.appendChild(span);
            });
            noteElement.appendChild(noteDiv);
        } else {
            noteElement.textContent = noteGroup[0];
            noteElement.onclick = (e) => {
                e.stopPropagation();
                if (noteGroup.length === 1) {
                    checkAnswer(noteGroup[0]);
                }
            };
        }
        
        container.appendChild(noteElement);
    });
}

// Modify the startTest function
function startTest() {
    if (isWaiting) return;
    resetNotes();

    // Initialize ordered notes array if empty
    if (orderedNotes.length === 0) {
        orderedNotes = Object.keys(noteRelations);
        currentIndex = 0;
        isOrderedMode = true;
    }

    // Choose next note based on mode
    if (isOrderedMode) {
        currentNote = orderedNotes[currentIndex];
        currentIndex++;
        
        // Switch to random mode after testing all notes
        if (currentIndex >= orderedNotes.length) {
            isOrderedMode = false;
            document.getElementById('feedback').textContent = 
                'Completed ordered testing! Switching to random mode.';
        }
    } else {
        // Random mode
        const notes = Object.keys(noteRelations);
        currentNote = notes[Math.floor(Math.random() * notes.length)];
    }
    
    document.getElementById('question').textContent = 
        `Find the major third of ${currentNote}`;
    document.getElementById('explanation').textContent = '';
    document.getElementById('explanation').style.display = 'none';
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
        
        explanationElement.innerHTML = `
            How to find the major third of ${currentNote}:<br>
            1. Start at ${currentNote}<br>
            2. Count four semitones up<br>
            3. Land on ${correctAnswer}${enharmonic ? ` (also written as ${enharmonic})` : ''}<br>
            <br>
            Remember: A major third is always four semitones above the root note.`;
            
        document.getElementById('explanation').style.display = 'block';
    }
    
    updateScore();
    updateQuestionLog(selectedNote, isCorrect, timeElapsed);
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

function updateQuestionLog(selectedNote, isCorrect, timeElapsed) {
    const logContainer = document.getElementById('logEntries');
    const logEntry = document.createElement('div');
    logEntry.className = `p-2 border rounded ${isCorrect ? 'bg-success-subtle' : 'bg-danger-subtle'}`;
    
    logEntry.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold">Q${totalQuestions}:</span>
            <span>Find third of ${currentNote} → ${selectedNote}</span>
            <span>${isCorrect ? '✓' : '✗'}</span>
            <span>${timeElapsed.toFixed(1)}s</span>
        </div>
        <div class="small text-muted">
            Correct answer: ${noteRelations[currentNote]}
        </div>
    `;
    
    // Insert at the beginning for newest first
    logContainer.insertBefore(logEntry, logContainer.firstChild);
}

window.onload = createCircle;
