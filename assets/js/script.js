let username,
    
participants,

refreshConnectionInterval,

refreshMessagesInterval,

messageInput = document.querySelector(".message-writer");

function toggleScreen(hide,show){
    document.querySelector(hide).classList.add("hide");
    document.querySelector(show).classList.remove("hide");
}

//Refresh connection functions
function refreshConnection(){ 
    let connectionStatus = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', username);
    connectionStatus.then(showConnectionStatus);
}

function showConnectionStatus(connectionStatusObject){
    console.log(`Status da conexão: ${connectionStatusObject.data}`);
}

// Sign in functions
function signIn(){
    temp = document.querySelector('.name-input').value;
    document.querySelector('.name-input').value = '';

    username = {name: temp}

    toggleScreen(".initial-screen", ".signin-load");

    postUsername(username);
}

function postUsername(usernameObject){
    let requisition = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', usernameObject);

    requisition.then(completeSignIn);
    requisition.catch(refuseSignIn);
}

function completeSignIn(responseCode){

    if(responseCode.status === 200){
        setTimeout(toggleScreen, 2000, ".signin-load", ".signin-approved");
        setTimeout(toggleScreen, 4000, ".signin-approved", ".website");
        document.querySelector(".log-error").innerHTML = '';

        refreshConnectionInterval = setInterval(refreshConnection, 5000);
        refreshMessagesInterval = setInterval(extractData, 500);
    }
}

function refuseSignIn(responseCode){

    if(responseCode.response.status === 400){
        setTimeout(toggleScreen, 2000, ".signin-load", ".signin-refused");
        setTimeout(toggleScreen, 4000, ".signin-refused", ".initial-screen");
        document.querySelector(".log-error").innerHTML = 
        'Erro 400: Já existe um usuário com o mesmo nome, tente outro nome de usuário.';
    }

    if(responseCode.response.status === 404){
        setTimeout(toggleScreen, 2000, ".signin-load", ".signin-refused");
        setTimeout(toggleScreen, 4000, ".signin-refused", ".initial-screen");
        document.querySelector(".log-error").innerHTML = 
        'Erro 404: Servidor não encontrado. Tente novamente mais tarde.';
    }
}


// Messages constructors functions
function getStatusHTML(messageObject){
    const statusHTML = `
    <div class="message-structure color-status">
        <p>
            <span class="message-time">(${messageObject.time})</span>
            <strong class="sender">${messageObject.from}</strong>
            <span class="action">${''}</span>
            <strong class="receiver">${''}</strong>
            <span class="message-content">${messageObject.text}</span>
        </p>
    </div>`;

    return statusHTML
}

function getMessageHTML(messageObject){
    const messageHTML = `
    <div class="message-structure color-message">
        <p>
            <span class="message-time">(${messageObject.time})</span>
            <strong class="sender">${messageObject.from}</strong>
            <span class="action">${'para'}</span>
            <strong class="receiver">${messageObject.to}:</strong>
            <span class="message-content">${messageObject.text}</span>
        </p>
    </div>`;
    
    return messageHTML
}

function getPrivateHTML(messageObject){
    const privateHTML = `
    <div class="message-structure color-private">
        <p>
            <span class="message-time">(${messageObject.time})</span>
            <strong class="sender">${messageObject.from}</strong>
            <span class="action">${'reservadamente para'}</span>
            <strong class="receiver">${messageObject.to}:</strong>
            <span class="message-content">${data[i].text}</span>
        </p>
    </div>`;
    
    return privateHTML
}

// ETL website data functions
function extractData(){
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(transformData);
}

function transformData(response){
    data = response.data;

    feed = '';
    
    data.forEach(getFeedHTML)
    
    loadData(feed);
}

function getFeedHTML(feedMessageObject){
    let feedMessageHTML;

    switch(feedMessageObject.type){

        case 'status':
            feedMessageHTML = getStatusHTML(feedMessageObject);
            break;

        case 'message':
            feedMessageHTML = getMessageHTML(feedMessageObject);
            break;

        case 'private':
            if(data[i].to === username.name){
                feedMessageHTML = getPrivateHTML(feedMessageObject);
            break;
            }

            break;
    }

    feed += feedMessageHTML;
}

function loadData(){
    document.querySelector('.feed').innerHTML = feed;
    document.querySelector('.message-box-phatom').scrollIntoView({block: "end", behavior: "auto"});
    console.log('Mensagens carregadas');
}


// Participants control functions
function extractParticipants(){
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants');
    promise.then(getParticipantsArray);
}

function getParticipantsArray(participants){

    let participantsArray = participants.data;

    return participantsArray;
}

// Sending message functions


function createMessage(){
    if(messageInput.value != ''){
        let typedMessage = messageInput.value
        messageInput.value = "";
        messageObject = 
            {
                from: username.name,
                to: "Todos",
                text: typedMessage,
                type: "message"
            }

        sendRequest(messageObject)
    } else{
        alert('Não é permitido envio de mensagens em branco')
    }
}

function sendRequest(messageObject){
    request = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages', messageObject)
    request.then(messageSent)
    request.catch(connectionLost)
}

function messageSent(){
    console.log('Message sent successfully.')
}

function connectionLost(){
    console.log('erro')
    toggleScreen(".website", ".connection-lost-screen")

    clearInterval(refreshConnectionInterval);
    clearInterval(refreshMessagesInterval);
}

// Enviar mensagem com o enter
document.querySelector(".message-writer").addEventListener("keypress", sendMessagePressingEnter)

function sendMessagePressingEnter(event){
    if (event.key === "Enter") {
        event.preventDefault();
        document.querySelector(".send-message").click();
      }
}