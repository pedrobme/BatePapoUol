function extractData(){
    let promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(transformData);
}

function transformData(response){
    data = response.data;
    loadData(data);
}

function loadData(data){
    console.log(data);
}

extractData();