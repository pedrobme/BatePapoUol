let username,
	userId,
	feedHTML,
	participantsListData,
	participantsListHTML,
	receiver = "Todos",
	receiverRefreshed = true, //Explanation for this variable avaible in "README" file (ln 3)
	visibility = "Publico",
	refreshConnectionInterval,
	refreshMessagesInterval,
	refreshParticipantsList;

function toggleScreen(hide, show) {
	document.querySelector(hide).classList.add("hide");
	document.querySelector(show).classList.remove("hide");
}

// Sign in functions
function signIn() {
	temp = document.querySelector(".name-input").value;
	document.querySelector(".name-input").value = "";

	username = { name: temp };

	if (!username.name) {
		alert(
			"Não é permitido usar o nome vazio, por favor preencha o campo do nome."
		);
	} else {
		toggleScreen(".initial-screen", ".signin-load");

		postUsername(username);
	}
}

function postUsername(usernameObject) {
	let requisition = axios.post(
		"http://localhost:5000/participants",
		usernameObject
	);

	requisition.then(completeSignIn);
	requisition.catch(refuseSignIn);
}

function completeSignIn(responseCode) {
	if (responseCode.status === 201) {
		setTimeout(toggleScreen, 2000, ".signin-load", ".signin-approved");
		setTimeout(toggleScreen, 4000, ".signin-approved", ".website");
		document.querySelector(".log-error").innerHTML = "";

		userId = responseCode.data.insertedId;
		refreshConnection();
		extractFeedMessagesData();
		extractParticipantsData();

		refreshConnectionInterval = setInterval(refreshConnection, 5000);
		refreshMessagesInterval = setInterval(extractFeedMessagesData, 1000);
		refreshParticipantsList = setInterval(extractParticipantsData, 10000);
	}
}

function refuseSignIn(responseCode) {
	if (responseCode.response.status === 409) {
		setTimeout(toggleScreen, 2000, ".signin-load", ".signin-refused");
		setTimeout(toggleScreen, 4000, ".signin-refused", ".initial-screen");
		if (username.name === "") {
			document.querySelector(".log-error").innerHTML =
				"Erro 400: Não é permitido nome de usuário em branco, digite um nome de usuário.";
		} else {
			document.querySelector(".log-error").innerHTML =
				"Erro 400: Já existe um usuário com o mesmo nome, tente outro nome de usuário.";
		}
	}

	if (responseCode.response.status === 404) {
		setTimeout(toggleScreen, 2000, ".signin-load", ".signin-refused");
		setTimeout(toggleScreen, 4000, ".signin-refused", ".initial-screen");
		document.querySelector(".log-error").innerHTML =
			"Erro 404: Servidor não encontrado. Tente novamente mais tarde.";
	}

	if (responseCode.response.status === 500) {
		document.querySelector(".log-error").innerHTML =
			"Erro 500: Erro não conhecido. Entre em contato com o suporte";
	}
}

//Refresh connection functions
function refreshConnection() {
	let connectionStatus = axios.put("http://localhost:5000/status", username, {
		headers: { user: username.name },
	});
	connectionStatus.then(showConnectionStatus);
}

function showConnectionStatus(connectionStatusObject) {
	console.log(`Status da conexão: ${connectionStatusObject.data}`);
}

// ETL feed messages data functions. ETL process is described in 'README' file (ln 18)
function extractFeedMessagesData() {
	let promise = axios.get("http://localhost:5000/messages?limit=20", {
		headers: { "user-id": userId },
	});
	promise.then(transformFeedMessagesData);
}

async function transformFeedMessagesData(response) {
	let messagesListData = response.data;

	feedHTML = "";

	await messagesListData.forEach(constructFeedHtml);

	loadFeedMessages(feedHTML);
}

function loadFeedMessages() {
	document.querySelector(".feed").innerHTML = feedHTML;

	automaticPageScroll();

	console.log("Feed de mensagens atualizado");
}

// Messages constructors functions
function constructFeedHtml(feedMessageObject) {
	let messageHTML;

	switch (feedMessageObject.type) {
		case "status":
			messageHTML = constructStatusMessageHTML(feedMessageObject);
			break;

		case "message":
			messageHTML = constructOrdinaryMessageHTML(feedMessageObject);
			break;

		case "private_message":
			if (
				feedMessageObject.from === username.name ||
				feedMessageObject.to === username.name ||
				feedMessageObject.to === "Todos"
			) {
				messageHTML = constructPrivateMessageHTML(feedMessageObject);
			}
			break;
	}

	feedHTML += messageHTML;
}

function constructStatusMessageHTML(messageObject) {
	const statusMessageHTML = `
    <div class="message-structure color-status">
        <p>
            <span class="message-time">(${messageObject.time})</span>
            <strong class="sender">${messageObject.from}</strong>
            <span class="action">${""}</span>
            <strong class="receiver">${""}</strong>
            <span class="message-content">${messageObject.text}</span>
        </p>
    </div>`;

	return statusMessageHTML;
}

function constructOrdinaryMessageHTML(messageObject) {
	const ordinaryMessageHTML = `
    <div class="message-structure color-message">
        <p>
            <span class="message-time">(${messageObject.time})</span>
            <strong class="sender">${messageObject.from}</strong>
            <span class="action">${"para"}</span>
            <strong class="receiver">${messageObject.to}:</strong>
            <span class="message-content">${messageObject.text}</span>
        </p>
    </div>`;

	return ordinaryMessageHTML;
}

function constructPrivateMessageHTML(messageObject) {
	const privateMessageHTML = `
    <div class="message-structure color-private">
        <p>
            <span class="message-time">(${messageObject.time})</span>
            <strong class="sender">${messageObject.from}</strong>
            <span class="action">${"reservadamente para"}</span>
            <strong class="receiver">${messageObject.to}:</strong>
            <span class="message-content">${messageObject.text}</span>
        </p>
    </div>`;

	return privateMessageHTML;
}

// ETL participants list data functions. ETL process is described in 'README' (ln 18)
function extractParticipantsData() {
	let promise = axios.get("http://localhost:5000/participants");
	promise.then(transformParticipantsData);
}

function transformParticipantsData(response) {
	receiverRefreshed = false;

	participantsListData = response.data;

	// Construir primeiro participante "todos"
	if (receiver === "Todos") {
		receiverRefreshed = true;
		participantsListHTML = `
        <li data-identifier="participant" class="list-element todos-participantes selected" onclick="selectMessageReceiver(this)">
            <div class="list-element-content">
                <ion-icon name="people" ></ion-icon>
                <p class="id-receiver">Todos</p>
            </div>
            <ion-icon class ="checkmark" name="checkmark-sharp"></ion-icon>
        </li>`;
	} else {
		participantsListHTML = `
        <li data-identifier="participant" class="list-element todos-participantes" onclick="selectMessageReceiver(this)">
            <div class="list-element-content">
                <ion-icon name="people" ></ion-icon>
                <p class="id-receiver">Todos</p>
            </div>
        <ion-icon class ="checkmark hide" name="checkmark-sharp"></ion-icon>
        </li>`;
	}

	participantsListData.forEach(constructParticipantsListHTML);

	loadParticipantsList();
}

function loadParticipantsList() {
	document.querySelector(".participants-list").innerHTML = participantsListHTML;

	if (receiverRefreshed === false) {
		document.querySelector(".todos-participantes").classList.add("selected");
		document
			.querySelector(".todos-participantes .checkmark")
			.classList.remove("hide");
		receiver = document.querySelector(
			".todos-participantes .id-receiver"
		).innerHTML;
		checkVisibility();
	}

	console.log("Lista de participantes atualizada");
}

// Participants constructor function
function constructParticipantsListHTML(participantObject) {
	let ParticipantHTML;

	// Restante dos participantes
	if (participantObject.name === receiver) {
		receiverRefreshed = true;
		ParticipantHTML = `
        <li data-identifier="participant" class="list-element selected" onclick="selectMessageReceiver(this)">
            <div class="list-element-content">
                <ion-icon name="person-circle"></ion-icon>
                <p class="id-receiver">${participantObject.name}</p>
            </div>
        <ion-icon class ="checkmark" name="checkmark-sharp"></ion-icon>
        </li>`;
	} else {
		ParticipantHTML = `
        <li data-identifier="participant" class="list-element" onclick="selectMessageReceiver(this)">
            <div class="list-element-content">
                <ion-icon name="person-circle"></ion-icon>
                <p class="id-receiver">${participantObject.name}</p>
            </div>
        <ion-icon class ="checkmark hide" name="checkmark-sharp"></ion-icon>
        </li>`;
	}

	participantsListHTML += ParticipantHTML;
}

// Sending message functions
function getMessageType() {
	if (visibility === "Publico") {
		return "message";
	} else if (visibility === "Reservadamente") {
		return "private_message";
	}
}

function createMessage() {
	let messageInput = document.querySelector(".message-writer");

	if (messageInput.value != "") {
		let typedMessage = messageInput.value;
		messageInput.value = "";
		messageObject = {
			to: receiver,
			text: typedMessage,
			type: getMessageType(),
		};

		let receiverId;

		if (receiver === "Todos") {
			receiverId = 0;
		} else {
			receiverId = participantsListData.find(
				(participant) => participant.name === receiver
			)["_id"];

			console.log(receiverId);
		}

		sendRequest(messageObject, receiverId);
	} else {
		alert("Não é permitido envio de mensagens em branco");
	}
}

function sendRequest(messageObject, receiverId) {
	request = axios.post("http://localhost:5000/messages", messageObject, {
		headers: {
			user: username.name,
			"receiver-id": receiverId,
			"sender-id": userId,
		},
	});
	request.then(messageSent);
	request.catch(connectionLost);
}

function messageSent() {
	scrollDownPage();
	console.log("Menssagem enviada com sucesso.");
}

function connectionLost() {
	toggleScreen(".website", ".connection-lost-screen");

	clearInterval(refreshConnectionInterval);
	clearInterval(refreshMessagesInterval);
	clearInterval(refreshParticipantsList);
}

// Enter key config functions
document
	.querySelector(".message-writer")
	.addEventListener("keypress", sendMessagePressingEnter);
document
	.querySelector(".name-input")
	.addEventListener("keypress", signInPressingEnter);

function sendMessagePressingEnter(event) {
	if (event.key === "Enter") {
		event.preventDefault();
		document.querySelector(".send-message").click();
	}
}

function signInPressingEnter(event) {
	if (event.key === "Enter") {
		event.preventDefault();
		document.querySelector(".sign-in").click();
	}
}

// Automatic page scroll control
addEventListener("scroll", automaticPageScroll);

function scrollDownPage() {
	document
		.querySelector(".message-box-phatom")
		.scrollIntoView({ block: "end", behavior: "smooth" });
	document.querySelector(".scroll-down").classList.add("hide");
}

function automaticPageScroll() {
	let pageScrolledBottom =
		window.innerHeight + window.pageYOffset + 50 >=
		document.documentElement.scrollHeight;

	if (pageScrolledBottom) {
		document
			.querySelector(".message-box-phatom")
			.scrollIntoView({ block: "end", behavior: "smooth" });
		document.querySelector(".scroll-down").classList.add("hide");
	} else {
		document.querySelector(".scroll-down").classList.remove("hide");
	}
}

// Sending message config (receiver and visibility)

function selectMessageReceiver(listElement) {
	previousSelectedElement = listElement.parentNode.querySelector(".selected");
	previousSelectedElement.classList.remove("selected");
	previousSelectedElement.classList.remove("show-large-names");
	previousSelectedElement.querySelector(".checkmark").classList.add("hide");

	listElement.classList.add("selected");
	listElement.classList.add("show-large-names");
	listElement.querySelector(".checkmark").classList.remove("hide");

	receiver = listElement.querySelector(".id-receiver").innerHTML;

	checkVisibility();

	console.log(`Destinatario atual: ${receiver}`);
}

function selectMessageVisibility(listElement) {
	previousSelectedElement = listElement.parentNode.querySelector(".selected");
	previousSelectedElement.classList.remove("selected");
	previousSelectedElement.querySelector(".checkmark").classList.add("hide");

	listElement.classList.add("selected");
	listElement.querySelector(".checkmark").classList.remove("hide");

	visibility = listElement.querySelector(".visibility-type").innerHTML;

	checkVisibility();

	console.log(`Visibilidade atual: ${visibility}`);
}

function checkVisibility() {
	if (visibility === "Reservadamente") {
		document.querySelector(
			".message-writer"
		).placeholder = `Escreva aqui...\nEnviando reservadamente para ${receiver}`;
	}

	if (visibility === "Publico") {
		document.querySelector(".message-writer").placeholder = `Escreva aqui...`;
	}
}

// show/hide side bar
function showSideBar(sideBar) {
	document.querySelector(sideBar).classList.remove("hide");
	document.body.style.overflowY = "hidden";
}

function hideSideBar(sideBar) {
	document.querySelector(sideBar).classList.add("hide");
	document.body.style.overflowY = "scroll";
}
