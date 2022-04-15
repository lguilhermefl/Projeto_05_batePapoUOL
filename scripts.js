let chatHistory;
const timeToReloadChat = 3000;

setInterval(getChatHistory, timeToReloadChat);

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
                chat.innerHTML += `<div class="chat-msgs private"><p>${time} <em>${from}</em> reservadamente para <em>${to}</em>: ${text}</p></div>`;
                break;
        }
    }
    scrollToNewMessage();
}

function scrollToNewMessage() {
    const newMessage = document.querySelector(".chat").lastChild;
    newMessage.scrollIntoView();
}