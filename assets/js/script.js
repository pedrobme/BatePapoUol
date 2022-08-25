function extractData(){
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(transformData);
}

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

function transformData(response){
    console.log(response);

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
    document.querySelector('.content').innerHTML = content;
}

extractData();