if (!localStorage.getItem('apiKey')) {
    key = prompt("Please enter your openai API key:")
    if(key){
        localStorage.setItem('apiKey', key);
    }
}

prevTalk = JSON.parse(localStorage.getItem('history')) || [];

for(let i = 0; i < prevTalk.length; i++){
    send(prevTalk[i].content, prevTalk[i].role == "user")
}

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

    text.split("\n").forEach(function (item) {
        if (item) {
            const textElement = document.createElement('p');
            textElement.innerText = item;
            contentElement.appendChild(textElement);
        }
    });

    message.appendChild(contentElement);

    latestMsgs = document.getElementsByClassName('latestmsg');
    for (var i = 0; i < latestMsgs.length; i++) {
        latestMsgs[i].classList.remove("latestmsg");
    }

    message.classList.add("latestmsg");

    document.getElementById('chat-container').appendChild(message);

    window.scrollTo(0, document.body.scrollHeight);
}

function ask(text) {
    updatePrevTalk({ role: 'user', content: text });

    var xhr = new XMLHttpRequest();
    xhr.onerror = function() {
        alert('An error occurred while making the request.');
    };
    xhr.open('POST', 'https://api.openai.com/v1/chat/completions');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('apiKey'));
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                updatePrevTalk(data.choices[0].message);
                send(data.choices[0].message.content, false);
            } else {
                localStorage.setItem('apiKey', prompt("Your openai API key is Incorrect! Please enter your openai API key:"));
            }
        }
    };
    xhr.send(JSON.stringify({ model: 'gpt-3.5-turbo', messages: prevTalk }));
}

function updatePrevTalk(info){
    prevTalk = prevTalk.concat(info);
    localStorage.setItem('history', JSON.stringify(prevTalk));
}

function handleSubmit() {
    sendText = document.getElementById("sendtext");
    if (sendText.value.replaceAll('\n', '')) {
        send(sendText.value, true);
        ask(sendText.value);
        sendText.value = "";
        sendText.rows = "1";
    }
}

function handleReset() {
    if(window.confirm("Do you want to delete your chat history?")){
        prevTalk = [];
        localStorage.setItem('history', "[]");
        location.reload();
    }
}

document.getElementById("sendtext").addEventListener("keydown", function (e) {
    if (e.key == "Enter") {
        if (!e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }
});

document.getElementById("sendicon").addEventListener("click", handleSubmit);

document.getElementById("reseticon").addEventListener("click", handleReset);

document.getElementById("sendtext").addEventListener("input", function () {
    this.rows = this.value.split("\n").length;
});