;(() => {
    const socket = new WebSocket(`ws://${window.location.host}/ws`)
    const formEl = document.getElementById('form')
    const inputEl = document.getElementById('input1')
    const chatsEl = document.getElementById('chats')

    if(!formEl || !inputEl || !chatsEl) {
        throw new Error('Init failed');
    }


    /**
     * Chat -> {string} nickname, {string} message
     */
    const chats = [];

    const adjectives = ['멋진', '훌륭한', '친절한', '새침한', '아름다운', '귀여운']
    const animals = ['물범', '사자', '사슴', '돌고래', '독수리', '펭귄']

    function pickRandom(array) {
        const randomIdx = Math.floor(Math.random() * array.length)
        const result = array[randomIdx]
        if (!result) {
            throw new Error('array length is 0.')
        }
        return result
    }

    const myNickname = `${pickRandom(adjectives)} ${pickRandom(animals)}`

    formEl.addEventListener('submit', (event) => {
        event.preventDefault();

        socket.send(
            JSON.stringify({
                message : inputEl.value,
                nickname : myNickname
            })
        );
        inputEl.value = '';
    })

    const drawChats = () => {
        chatsEl.innerHTML = '';
        chats.forEach(({ message, nickname }) => {
            const chatDiv = document.createElement('div');
            chatDiv.innerHTML = `${nickname} : ${message}`;
            chatsEl.appendChild(chatDiv);
        });
    }

    socket.addEventListener('message', (event) => {
        const { type, payload } = JSON.parse(event.data);

        if(type == 'sync') {
            const { chats : syncedChats } = payload;
            chats.push(...syncedChats); 
        } else if(type == 'chat') {
            const chat = payload;
            chats.push(chat);
        }
        
        drawChats();
        
    })
    
})()


