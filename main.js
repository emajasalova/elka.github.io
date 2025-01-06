if (!localStorage.getItem('apiKey')) {
    const key = prompt("Please enter your OpenAI API key:");
    if (key) {
        localStorage.setItem('apiKey', key);
    }
}

let prevTalk = JSON.parse(localStorage.getItem('history')) || [];

// Preload previous conversations
prevTalk.forEach(talk => send(talk.content, talk.role === "user"));

function send(text, isUser) {
    const message = document.createElement('div');
    message.classList.add('chat-message');

    if (isUser) {
        message.classList.add('sent');
    } else {
        message.classList.add('received');
    }

    const contentElement = document.createElement('div');
    contentElement.classList.add('content');

    text.split("\n").forEach(item => {
        if (item) {
            const textElement = document.createElement('p');
            textElement.innerText = item;
            contentElement.appendChild(textElement);
        }
    });

    message.appendChild(contentElement);

    // Update the latest message style
    const latestMsgs = document.getElementsByClassName('latestmsg');
    for (let i = 0; i < latestMsgs.length; i++) {
        latestMsgs[i].classList.remove("latestmsg");
    }

    message.classList.add("latestmsg");

    document.getElementById('chat-container').appendChild(message);

    // Auto-scroll to the bottom
    window.scrollTo(0, document.body.scrollHeight);
}

function ask(text) {
    if (text.length > 450) {
        alert("The message exceeds the maximum allowed length of 450 characters.");
        return;
    }

    updatePrevTalk({ role: 'user', content: text });

    const xhr = new XMLHttpRequest();
    xhr.onerror = function () {
        alert('An error occurred while making the request.');
    };
    xhr.open('POST', 'https://api.openai.com/v1/chat/completions');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('apiKey')}`);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                updatePrevTalk(data.choices[0].message);
                send(data.choices[0].message.content, false);
            } else {
                const newKey = prompt("Your OpenAI API key is incorrect! Please enter your OpenAI API key:");
                if (newKey) {
                    localStorage.setItem('apiKey', newKey);
                }
            }
        }
    };
    xhr.send(JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: prevTalk,
        max_tokens: 450
    }));
}

function updatePrevTalk(info) {
    prevTalk.push(info);
    localStorage.setItem('history', JSON.stringify(prevTalk));
}

function handleSubmit() {
    const sendText = document.getElementById("sendtext");
    const trimmedText = sendText.value.trim();

    if (trimmedText) {
        send(trimmedText, true);
        ask(trimmedText);
        sendText.value = "";
    }
}

function handleReset() {
    if (confirm("Do you want to delete your chat history?")) {
        prevTalk = [];
        localStorage.setItem('history', "[]");
        location.reload();
    }
}

document.getElementById("sendtext").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
});

document.getElementById("sendicon").addEventListener("click", handleSubmit);

document.getElementById("reseticon").addEventListener("click", handleReset);
