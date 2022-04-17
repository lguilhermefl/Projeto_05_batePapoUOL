let chatHistory;
let userName;
let signUserIntervalId;

let selectedContact = "Todos";
let visibility = "Público";

const timeToReloadChat = 3 * 1000;
const intervalActive = 4 * 1000;
const timeToRefreshParticipantsList = 10 * 1000;
const timeToShowChat = 3 * 1000;

//initChat();

function getChatHistory() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(feedChat);
}

function feedChat(messages) {
    chatHistory = messages.data;
    const chat = document.querySelector(".chat");
    chat.innerHTML = "";

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
                if(ifPrivate(to, from)) {
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

//function askUserName() {
    //userName = prompt("Qual o seu nome?");
//}

function getName() {
    const inputEl = document.querySelector("input");
    userName = inputEl.value;
    initChat();
}

function initChat() {
    //askUserName();
    const requisition = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", {"name":userName});
    requisition.then(loginSucces);
    requisition.catch(checkUserName);
    //getParticipants();
    setInterval(getParticipants, timeToRefreshParticipantsList);
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
        alertUserName();
    }
}

function loginSucces() {
    showLoader();
    setTimeout(showChat, timeToShowChat);
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
    const inputEl = document.querySelector(".chat-uol input");
    let messageType;

    if(visibility === "Reservadamente") {
        messageType = "private_message";
    } else {
        messageType = "message";
    }

    if(inputEl.value !== "") {
        const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", {
            from: userName,
            to: selectedContact,
            text: inputEl.value,
            type: messageType
        });
        inputEl.value = "";
        promise.then(getChatHistory);
        promise.catch(reloadPage);
    }
}

function ifPrivate(recipient, sender) {
    if(recipient === userName || recipient === "Todos" || sender === userName) {
        return true;
    }
    return false;
}

function getParticipants() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(addParticipantsToMenu);
}

function addParticipantsToMenu(participants) {
    const recipients = participants.data;
    const listOfParticipants = document.querySelector(".users-online");
    listOfParticipants.innerHTML = "";
    listOfParticipants.innerHTML = `<li onclick="selectRecipient(this)"><div><ion-icon name="people-sharp"></ion-icon><p>Todos</p></div><div><ion-icon class="check" name="checkmark-outline"></div></li>`;
    for(let i = 0; i < recipients.length; i++) {
        if(recipients[i].name !== userName) {
            listOfParticipants.innerHTML += `<li onclick="selectRecipient(this)"><div><ion-icon name="person-circle"></ion-icon><p>${recipients[i].name}</p></div><div><ion-icon class="check" name="checkmark-outline"></div></li>`;
        }
    }
}

function openMenu() {
    const menu = document.querySelector(".lateral-menu");
    menu.classList.remove("hidden");
}

function closeMenu() {
    const menu = document.querySelector(".lateral-menu");
    menu.classList.add("hidden");
}

function selectRecipient(el) {
    const check = el.querySelector(".check");
    const recipientsList = document.querySelector(".recipient");
    const selected = recipientsList.querySelector(".selected");
    const messageInfo = document.querySelector(".bottom p");

    if(selected !== null) {
        selected.classList.remove("selected");
        selectedContact = "Todos";
    }
    check.classList.add("selected");
    selectedContact = el.querySelector("p").innerText;
    messageInfo.innerText = `Enviando para ${selectedContact} (${visibility})`
}

function selectVisibility(el) {
    const check = el.querySelector(".check");
    const visibilityList = document.querySelector(".visibility");
    const selected = visibilityList.querySelector(".selected");
    const messageInfo = document.querySelector(".bottom p");

    if(selected !== null) {
        selected.classList.remove("selected");
        visibility = "Público";
    }
    check.classList.add("selected");
    visibility = el.querySelector("p").innerText;
    messageInfo.innerText = `Enviando para ${selectedContact} (${visibility})`
}

function showLoader() {
    const loader = document.querySelector(".loader");
    const loading = document.querySelector(".login p");
    const inputEl = document.querySelector("input");
    const buttonEl = document.querySelector("button");

    loader.classList.remove("hidden");
    loading.classList.remove("hidden");
    inputEl.classList.add("hidden");
    buttonEl.classList.add("hidden");
}

function showChat() {
    const login = document.querySelector(".login");
    const chat = document.querySelector(".chat-uol");
    
    login.classList.add("hidden");
    chat.classList.remove("hidden");
}

function alertUserName() {
    alert("Já existe um usuário com este nome, digite outro por favor!");
}

function sendMsgWithEnter(event) {
    let keydown = event.key;
    if(keydown === "Enter") {
        sendMessage();
    }
}