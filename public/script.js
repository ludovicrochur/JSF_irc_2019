const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

//Le if permet de ne pas subir l'apparition du popup à chaque changement de page ou de nouvelle actualisation de page
if (messageForm != null) {
    //popUp de selection de nom
    const name = prompt('Quel est votre nom ?')
    appendMessage('Bienvenue !')
    socket.emit('new-user', roomName, name)

    messageForm.addEventListener('submit', e => {
        e.preventDefault()
        const message = messageInput.value
        appendMessage(`Vous : ${message}`) //Afficher à l'expédteur son propore message
        socket.emit('send-chat-message', roomName, message)
        messageInput.value = ''
    })
}

socket.on('room-created', room => {
    const roomElement = document.createElement('div')
    roomElement.innerText = room
    const roomLink = document.createElement('a')
    roomLink.href = '/${room}'
    roomLink.innerText = 'join'
    roomContainer.append(roomElement)
    roomContainer.append(roomLink)
})

socket.on('chat-message', data => {
    appendMessage(`${data.name}: ${data.message}`) //Afficher au destinataire le message de l'expéditeur
})

//Apparition du nom de l'utilisateur connecté pour les autres
socket.on('user-connected', name => {
    appendMessage(`${name} est connecté`)
})

//Apparition du nom de l'utilisateur déconnecté pour les autres
socket.on('user-disconnected', name => {
    appendMessage(`${name} est déconnecté`)
})

//fonction pour afficher le message sur le html
function appendMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageContainer.append(messageElement)
}