let chatHistory;
let userName;
let signUserIntervalId;
const timeToReloadChat = 3000;
const intervalActive = 4000;

initChat();

function getChatHistory() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(feedChat);
}

function feedChat(messages) {
    chatHistory = messages.data;
    const chat = document.querySelector(".chat");

    for(let i = 0; i < chatHistory.length; i++) {

        const type = chatHistory[i].type;
        const time = chatHistory[i].time;
        const from = chatHistory[i].from;
        const to = chatHistory[i].to;
        const text = chatHistory[i].text;

        switch(type) {
            case "status":
                chat.innerHTML += `<div class="chat-msgs status"><p>${time} <em>${from}</em> ${text}</p></div>`;
                break;

            case "message":
                chat.innerHTML += `<div class="chat-msgs message"><p>${time} <em>${from}</em> para <em>${to}</em>: ${text}</p></div>`;
                break;

            case "private_message":
                if(ifPrivate(to)) {
                    chat.innerHTML += `<div class="chat-msgs private"><p>${time} <em>${from}</em> reservadamente para <em>${to}</em>: ${text}</p></div>`;
                }
                break;
        }
    }
    scrollToNewMessage();
}

function scrollToNewMessage() {
    const newMessage = document.querySelector(".chat").lastChild;
    newMessage.scrollIntoView();
}

function askUserName() {
    userName = prompt("Qual o seu nome?");
}

function initChat() {
    askUserName();
    const requisition = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", {"name":userName});
    requisition.then(loginSucces);
    requisition.catch(checkUserName);

}

function errorCode(error) {
    const statusCode = error.response.status;
    return statusCode;
}

function loginCondition(promise) {
    return errorCode(promise) === 400;
}

function checkUserName(promise) {
    if(loginCondition(promise)) {
        initChat();
    }
}

function loginSucces() {
    setInterval(getChatHistory, timeToReloadChat);
    signUserIntervalId = setInterval(signUser, intervalActive);
}

function signUser() {
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", {"name": userName});
    promise.catch(stopSignUserInterval);
}

function stopSignUserInterval() {
    clearInterval(signUserIntervalId);
}

function reloadPage() {
    window.location.reload();
}

function sendMessage() {
    const inputEl = document.querySelector("input");
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", {
        from: userName,
        to: "Todos",
        text: inputEl.value,
        type: "message"
    });
    inputEl.value = "";
    promise.then(getChatHistory);
    promise.catch(reloadPage);
}

function ifPrivate(recipient) {
    if(recipient === userName || recipient === "Todos") {
        return true;
    }
    return false;
}