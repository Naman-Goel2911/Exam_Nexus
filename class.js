
function showStudentInfo() {
    document.querySelector('.student-info').style.display = 'block';
    document.querySelector('.test-content').style.display = 'none';
};

window.showTestCreation = function() {
    document.querySelector('.student-info').style.display = 'none';
    document.querySelector('.test-content').style.display = 'block';
};


// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyDHiNT1bNwJIRQA2xpxfHYmSwWi_YWfsAM",
authDomain: "examnexus-4b46c.firebaseapp.com",
databaseURL: "https://examnexus-4b46c-default-rtdb.firebaseio.com",
projectId: "examnexus-4b46c",
storageBucket: "examnexus-4b46c.appspot.com",
messagingSenderId: "889907228722",
appId: "1:889907228722:web:606ee1b0e185a2c15c8c2b",
measurementId: "G-35EV53YEE5"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase();

// Student list
let students = [];

// Redirect if user not logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'user.html';
    }
});

window.addStudent = function() {
    const studentName = document.getElementById('student-name').value;
    const studentEmail = document.getElementById('student-email').value;
    if (studentName && studentEmail) {
        students.push({ name: studentName, email: studentEmail });
        updateStudentTable();
        createStudentAccount(studentName, studentEmail); // Pass both name and email
    } else {
        alert("Please enter both name and email.");
    }
};


// Update student table
function updateStudentTable() {
    const tbody = document.getElementById('students-body');
    tbody.innerHTML = '';
    students.forEach(student => {
        const row = `<tr><td>${student.name}</td><td>${student.email}</td></tr>`;
        tbody.innerHTML += row;
    });
}

// Handle CSV upload (for Excel files)
window.handleCSVUpload = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const lines = e.target.result.split('\n');
            lines.forEach(line => {
                const [name, email] = line.split(',');
                if (name && email) {
                    students.push({ name, email });
                    createStudentAccount(email);
                }
            });
            updateStudentTable();
        };
        reader.readAsText(file);
    }
};

window.saveClass = function() {
    const className = document.getElementById('class-name').textContent;
    if (!className || students.length === 0 ) {
        alert("Please enter a class name and add at least one student.");
        return;
    }

    const teacher = auth.currentUser;  // The teacher/admin
    if (teacher) {
        const classRef = ref(db, `users/${teacher.uid}/classes/${className}/students`);
        
        // Fetch the current students from Firebase
        get(classRef).then((snapshot) => {
            if (snapshot.exists()) {
                const existingStudents = snapshot.val(); 
                students = [...existingStudents, ...students]; // Append new students to the existing list
            }
            
            // Save the updated student list to Firebase
            set(classRef, students)
                .then(() => {
                    alert("Class saved successfully!");
                })
                .catch(err => {
                    console.error("Error saving class: ", err);
                });
        }).catch((error) => {
            console.error("Error fetching existing students: ", error);
        });
    } else {
        alert("You are not signed in.");
    }
};


function createStudentAccount(name, email) {
const teacherEmail = auth.currentUser.email;  // Store teacher's email
const teacherPassword = prompt("Please enter your password to continue");  // Ask for password

createUserWithEmailAndPassword(auth, email, "ExamNexus1")
    .then((userCredential) => {
        const uid = userCredential.user.uid;  // Student UID
        const userRef = ref(db, `users/${uid}`);

        // Save student data
        set(userRef, {
            name: name,
            email: email,
            profession: 'student'
        }).then(() => {
            console.log(`Account and data saved for ${email}`);

            // Log teacher back in after creating student
            signInWithEmailAndPassword(auth, teacherEmail, teacherPassword)
                .then(() => {
                    console.log("Teacher re-authenticated.");
                })
                .catch((error) => {
                    console.error("Error logging teacher back in: ", error);
                });
        }).catch((error) => {
            console.error("Error saving student data: ", error);
        });
    })
    .catch((err) => {
        console.error("Error creating account: ", err);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid;
            const className = new URLSearchParams(window.location.search).get('className');

            if (!className) {
                alert("No class selected.");
                window.location.href = "dashboard.html";  // Redirect if no class is selected
                return;
            }

            // Display the class name in the dialogue box
            document.getElementById('class-name').textContent = className;

            // Fetch students from the selected class
            get(ref(db, 'users/' + userId + '/classes/' + className + '/students'))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const students = snapshot.val();
                        const studentTableBody = document.getElementById('students-body');
                        students.forEach((student) => {
                            const row = `<tr><td>${student.name}</td><td>${student.email}</td></tr>`;
                            studentTableBody.innerHTML += row;
                        });
                    } else {
                        console.log("No students found");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching student data:", error);
                });
        } else {
            window.location.href = 'user.html';  // Redirect to login if no user is signed in
        }
    });
});

let questions = [];

window.saveTest1234 = function () {
    const title = document.getElementById('test-title').value;
    const subject = document.getElementById('subject').value;

    if (!title || !subject) {
        alert("Please enter both title and subject.");
        return;
    }

    document.getElementById('display-title').innerText = title;
    document.getElementById('display-subject').innerText = `Subject: ${subject}`;
    document.getElementById('question-section').style.display = 'block';
}

window.toggleOptionType = function(optionNumber, type) {
    const textInput = document.getElementById(`${optionNumber}-text`);
    const imageInput = document.getElementById(`${optionNumber}-image`);

    if (type === 'text') {
        textInput.style.display = 'block';
        imageInput.style.display = 'none';
    } else {
        textInput.style.display = 'none';
        imageInput.style.display = 'block';
    }
}

window.previewImage = function(event, previewId) {
    const preview = document.getElementById(previewId);
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        preview.innerHTML = `<img src="${e.target.result}" alt="Image Preview">`;
    };
    reader.readAsDataURL(file);
}

window.addQuestion = function() {
    const questionText = document.getElementById('question').value;
    const options = [];
    for (let i = 1; i <= 4; i++) {
        const optionType = document.querySelector(`input[name="option${i}-type"]:checked`).value;
        const optionValue = optionType === 'text' ? document.getElementById(`option${i}-text`).value : document.getElementById(`option${i}-image`).files[0];
        options.push({ type: optionType, value: optionValue });
    }
    const correctAnswer = document.getElementById('correct-answer').value;

    if (!questionText || !options.length) {
        alert("Please enter a question and options.");
        return;
    }

    const question = {
        question: questionText,
        options: options,
        correctAnswer: correctAnswer
    };

    questions.push(question);
    displayQuestions();
    clearInputs();
}

window.clearInputs = function() {
    document.getElementById('question').value = '';
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`option${i}-text`).value = '';
        document.getElementById(`option${i}-image`).value = '';
        document.getElementById(`option${i}-preview`).innerHTML = '';
    }
    document.getElementById('correct-answer').value = 'option1';
}

window.displayQuestions = function() {
    const questionsBody = document.getElementById('questions-body');
    questionsBody.innerHTML = '';

    questions.forEach((q, index) => {
        const row = `<tr>
            <td>${q.question}</td>
            <td>${q.options.map(opt => opt.type === 'text' ? opt.value : '<img src="' + URL.createObjectURL(opt.value) + '" alt="Option Image">').join('<br>')}</td>
            <td>${q.correctAnswer}</td>
        </tr>`;
        questionsBody.innerHTML += row;
    });
}

document.querySelector('.save-test').addEventListener('click', saveTest);

window.saveTest = function() {
    const title = document.getElementById('test-title').value;
    const subject = document.getElementById('subject').value;

    if (questions.length === 0) {
        alert("Please add at least one question before saving.");
        return;
    }

    const testData = {
        title: title,
        subject: subject,
        questions: questions
    };

    const newTestRef = database.ref('tests').push();
    newTestRef.set(testData)
        .then(() => {
            alert('Test saved successfully!');
            clearAll();
        })
        .catch((error) => {
            alert('Error saving test: ' + error.message);
        });
}

window.clearAll = function() {
    document.getElementById('test-title').value = '';
    document.getElementById('subject').value = '';
    questions = [];
    displayQuestions();
}