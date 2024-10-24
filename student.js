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


const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

function displayUserData() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            const userId = user.uid;
            db.ref('users/' + userId).once('value').then((snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    const teacherUID = userData.teacher;
                    const className = userData.classJoined;
                    document.getElementById('welcome-message').textContent = `Welcome, ${userData.name}!`;
                    document.getElementById('user-name').textContent = `Name: ${userData.name}`;
                    document.getElementById('user-email').textContent = `Email: ${userData.email}`;
                    fetchTests(teacherUID, className);
                }
            }).catch((error) => {
                console.error("Error fetching user data:", error);
            });
        } else {
            window.location.href = "user.html";
        }
    });
}

function fetchTests(teacherUID, className) {
    const testContainer = document.getElementById('test-container');
    const classRef = db.ref(`users/${teacherUID}/classes/${className}/tests/`);

    classRef.once('value').then((snapshot) => {
        const tests = snapshot.val();
        if (tests) {
            testContainer.innerHTML = '';
            Object.keys(tests).forEach(testTitle => {
                const testData = tests[testTitle];
                const testElement = document.createElement('div');
                testElement.classList.add('test-card');
                testElement.innerHTML = `
                    <h3>${testData.title}</h3>
                    <p>Subject: ${testData.subject}</p>
                    <p>Duration: ${testData.duration}</p>
                    <button onclick="viewTest('${teacherUID}', '${className}', '${testTitle}')">View Test</button>
                `;
                testContainer.appendChild(testElement);
            });
        } else {
            testContainer.innerHTML = 'No tests available for this class.';
        }
    }).catch((error) => {
        console.error('Error fetching tests:', error);
    });
}

function viewTest(teacherUID, className, testTitle) {
    window.location.href = `testInstructions.html?teacherUID=${teacherUID}&className=${className}&testTitle=${testTitle}`;
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', displayUserData);

// Logout function
function logout() {
    auth.signOut().then(() => {
        window.location.href = "user.html";
        localStorage.removeItem('teacherPassword');
    }).catch((error) => {
        console.error("Error logging out:", error);
    });
}

document.getElementById('logout-btn').addEventListener('click', logout);

