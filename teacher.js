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
                if (userData && userData.classes) {
                    document.getElementById('welcome-message').textContent = `Welcome, ${userData.name}!`;
                    const classesContainer = document.getElementById('classes-container');
                    classesContainer.innerHTML = ''; 

                    Object.keys(userData.classes).forEach((className) => {
                        const card = document.createElement('div');
                        card.classList.add('class-card');
                        card.innerHTML = `
                            <h3>${className}</h3>
                            <button class="delete-btn" data-class-name="${className}">Delete Class</button>
                        `;
                        card.onclick = function() {
                            window.location.href = `existingclass.html?className=${encodeURIComponent(className)}`;
                        };
                        // Add the card to the container
                        classesContainer.appendChild(card);

                        // Add delete button functionality
                        card.querySelector('.delete-btn').addEventListener('click', function () {
                            deleteClass(userId, className);
                        });
                    });
                }
            }).catch((error) => {
                console.error("Error fetching user data:", error);
            });
        } else {
            console.log("Not Signed In");
            window.location.href = "user.html";
        }
    });
}

// Function to delete a class from Firebase
function deleteClass(userId, className) {
    if (confirm(`Are you sure you want to delete the class "${className}"?`)) {
        // Remove the class from the user's classes in Firebase
        db.ref('users/' + userId + '/classes/' + className).remove()
            .then(() => {
                alert(`Class "${className}" has been deleted.`);
                // Refresh the displayed classes after deletion
                displayUserData();
            })
            .catch((error) => {
                console.error("Error deleting class:", error);
                alert("Failed to delete class.");
            });
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', displayUserData);

// Logout function
function logout() {
    auth.signOut().then(() => {
        localStorage.removeItem('teacherPassword');
        window.location.href = "user.html";
    }).catch((error) => {
        console.error("Error logging out:", error);
    });
}

// Add an event listener to the logout button
document.getElementById('logout-btn').addEventListener('click', logout);
