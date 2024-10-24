
// Get the floating button and chatbot modal
const floatingBtn = document.getElementById('floating-btn');
const chatbotModal = document.getElementById('chatbot-modal');
const closeChatbot = document.getElementById('close-chatbot');

// Show the chatbot modal when the floating button is clicked
floatingBtn.addEventListener('click', () => {
    chatbotModal.style.display = 'block';
});

// Close the chatbot modal when the close button is clicked
closeChatbot.addEventListener('click', () => {
    chatbotModal.style.display = 'none';
});

// Optional: Click outside the modal to close it
window.addEventListener('click', (e) => {
    if (e.target === chatbotModal) {
        chatbotModal.style.display = 'none';
    }
});