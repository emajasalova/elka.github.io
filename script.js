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
            'Authorization': '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' // Zadaj svoj OpenAI API kľúč
        },
        body: JSON.stringify({
            model: 'code-davinci-002', // Použitie Codex modelu
            prompt: message,
            max_tokens: 450,
            temperature: 0.7
        })
    });

    const data = await response.json();
    const botMessage = data.choices[0].text.trim();
    appendMessage('bot', botMessage);
}
