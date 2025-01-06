document.getElementById('chat-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const message = document.getElementById('message').value;
    if (message) {
        appendMessage('user', message);
        sendToAPI(message);
        document.getElementById('message').value = ''; // vymazať input
    }
});

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender + '-message');
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // automaticky rolovať dolu
}

async function sendToAPI(message) {
    const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer Tvoj-API-Kľúč' // Zadaj svoj OpenAI API kľúč
        },
        body: JSON.stringify({
            model: 'code-cushman-001', // Použitie Codex modelu
            prompt: message,
            max_tokens: 150,
            temperature: 0.7
        })
    });

    const data = await response.json();
    const botMessage = data.choices[0].text.trim();
    appendMessage('bot', botMessage);
}
