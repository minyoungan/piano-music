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
}

function isEnharmonicallyEqual(note1, note2) {
    if (note1 === note2) return true;
    if (enharmonicMap[note1] === note2) return true;
    if (enharmonicMap[note2] === note1) return true;
    return false;
}

function checkAnswer(selectedNote) {
    if (!currentNote || isWaiting) return;
    
    totalQuestions++;
    const correctAnswer = noteRelations[currentNote];
    const isCorrect = isEnharmonicallyEqual(selectedNote, correctAnswer);
    
    const noteElements = document.getElementsByClassName('note');
    const feedbackElement = document.getElementById('feedback');
    const explanationElement = document.getElementById('explanation');
    
    // Find and highlight the correct answer
    Array.from(noteElements).forEach(el => {
        const noteText = el.textContent;
        if (noteText.includes(correctAnswer) || 
            (enharmonicMap[correctAnswer] && noteText.includes(enharmonicMap[correctAnswer]))) {
            el.classList.add('active');
        }
    });
    
    if (isCorrect) {
        score++;
        feedbackElement.style.color = 'green';
        feedbackElement.textContent = 'Correct! ✓';
        const enharmonic = enharmonicMap[correctAnswer];
        if (enharmonic) {
            feedbackElement.textContent += ` (${correctAnswer} = ${enharmonic})`;
        }
    } else {
        // Highlight wrong answer
        Array.from(noteElements).forEach(el => {
            if (el.textContent.includes(selectedNote)) {
                el.classList.add('wrong');
            }
        });
        
        feedbackElement.style.color = 'red';
        feedbackElement.textContent = `Wrong! The correct answer is ${correctAnswer}`;
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
