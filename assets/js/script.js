let username;
let participants;
let messagesBody = document.querySelector('.content');

function toggleScreen(hide,show){
    document.querySelector(hide).classList.add("hide");
    document.querySelector(show).classList.remove("hide");
}

//Refreshers
function refreshConnection(){ 
    connectionStatus = axios.post('https://mock-api.driven.com.br/api/v6/uol/status', username);
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

        let refreshConnectionInterval = setInterval(refreshConnection, 5000);
        let refreshMessagesInterval = setInterval(extractData, 3000);
    }
}

function refuseSignIn(responseCode){

    if(responseCode.response.status === 400){
        setTimeout(toggleScreen, 2000, ".signin-load", ".signin-refused");
        setTimeout(toggleScreen, 4000, ".signin-refused", ".initial-screen");
        document.querySelector(".log-error").innerHTML = 
        'Erro 400: Já existe um usuário com o mesmo nome, tente outro nome de usuário.';
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
    let content = '';

    for(let i=0; i<data.length;i++){

        switch(data[i].type){

            case 'status':
                content += getStatusHTML(data[i]);
                break;

            case 'message':
                content += getMessageHTML(data[i]);
                break;

            case 'private':
                if(data[i].to === username){
                    content += getPrivateHTML(data[i]);
                break;
                }

                break;
        }
    }

    loadData(content);
}

function loadData(content){
    messagesBody.innerHTML = content;
    document.querySelector('.message-box-phatom').scrollIntoView({block: "end", behavior: "smooth"});
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

function sendMessage(){

}