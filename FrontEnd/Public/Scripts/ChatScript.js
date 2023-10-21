let chatlist = document.getElementById('chat-list');
let chatBoxContent = document.getElementById('chat-box-content');
let btnMessageSubmit = document.getElementById('btnMessageSubmit');
let addMemberButton = document.getElementById('add-member');
let memberModal = document.getElementById('memberModal');
let modalCloseButton = document.getElementById('btnModalClose');
let key;
document.addEventListener("DOMContentLoaded", async function () {
    try {
        await fetchList();
        document.getElementById('add-member').addEventListener('click', () => {
            $('#memberModal').modal('show');
        });
        key = await generateEncryptionKey();
    } catch (error) {
        console.log(error);
    }
});

modalCloseButton.addEventListener('click', () => {
    let contactName = document.getElementById('contactName');
    let contactNumber = document.getElementById('phoneNumber');
    contactName.value = "";
    contactNumber.value = "";
    $('#memberModal').modal('hide');
});

btnMemberSubmit.addEventListener('click', async () => {
    try {
        const token = localStorage.getItem('token');
        let contactName = document.getElementById('contactName');
        let contactNumber = document.getElementById('phoneNumber');
        const data = { name: contactName.value, phone_number: contactNumber.value };
        await axios.post('/chat/add-contact', { data }, {
            headers: {
                "Authorization": token
            }
        });
        contactName.value = "";
        contactNumber.value = "";
        $('#memberModal').modal('hide');
        await fetchList();
    } catch (error) {
        console.log(error);
    }
});

btnMessageSubmit.addEventListener('click', async () => {
    try {
        const messageText = document.getElementById('messageText');
        const messageTextvalue = messageText.value;
        const storedIV = new Uint8Array(JSON.parse(localStorage.getItem('IV')));
        const storedEncryptedArray = new Uint8Array(JSON.parse(localStorage.getItem('EncryptedData')));
        const decryptedData = await decryptData({ iv: storedIV, encryptedArray: storedEncryptedArray }, key);
        const data = { memberId: decryptedData, messageText: messageTextvalue };
        await axios.post('/chat/add-message', { data }, {
            headers: {
                'Authorization': localStorage.getItem('token')
            }
        });
        await fetchChat(decryptedData);
        messageText.value = '';
    } catch (error) {
        console.log(error)
    }
});

async function displayList(chatlist, chatBoxContent, data) {
    chatlist.innerHTML = "";
    for (let i = 0; i < data.length; i++) {
        const latestMessage = await getLatestMessage(data[i].memberId);
        const latestMessageDate = moment(latestMessage.date, 'DD/MM/YYYY, hh:mm A');
        const currentDate = moment();
        let displayDateTime;

        if (latestMessageDate.isSame(currentDate, 'day')) {
            displayDateTime = latestMessageDate.format('hh:mm A');
        } else {
            displayDateTime = latestMessageDate.format('DD/MM/YYYY');
        }

        let li = document.createElement('li');
        li.className = "p-2 border-bottom d-flex justify-content-between align-items-center";
        let button = document.createElement('button');
        button.className = 'd-flex justify-content-between align-items-center chat-button w-100';
        button.innerHTML = `<div class="d-flex justify-content-between align-items-center w-100">
            <div class="d-flex flex-row items-center">
                <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                    alt="avatar" class="me-3 rounded-full" width="60">
                <div class="pb-5">
                    <p class="font-semibold mb-0 position-fixed">${data[i].ContactName}</p>
                </div>
                <div class="pt-4">
                    <p class="text-xs text-gray-500">${latestMessage.messageText}</p>
                </div>
            </div>
            <div class="d-flex flex-column align-items-end contact-info">
                <div class="text-xs text-gray-500 mb-1">${displayDateTime}</div>
            </div>
        </div>`;
        button.addEventListener('click', async () => {
            var chatDiv = document.getElementById('chat-div');
            var secondSection = document.getElementById("myChatId");
            const { iv, encryptedArray } = await encryptData(data[i].memberId, key);
            localStorage.setItem('IV', JSON.stringify(Array.from(iv)));
            localStorage.setItem('EncryptedData', JSON.stringify(Array.from(encryptedArray)));
            if (window.innerWidth <= 832) {
                chatDiv.style.display = "none";
            }
            if (secondSection.style.display === "none" || secondSection.style.display === "") {
                secondSection.style.display = "block";
            }
            await fetchChat(data[i].memberId);
        });

        li.appendChild(button);
        chatlist.appendChild(li);
    }
}

async function getLatestMessage(memberId) {
    const chatMessages = await getChatMessagesForMemberId(memberId);
    chatMessages.sort((a, b) => {
        const dateA = moment(a.date, 'DD/MM/YYYY, hh:mm A');
        const dateB = moment(b.date, 'DD/MM/YYYY, hh:mm A');
        return dateB - dateA;
    });
    return chatMessages[0];
}

async function fetchChat(memberId) {
    const result = await axios.post('/chat/get-chat', {
        memberId: memberId
    }, {
        headers: {
            'Authorization': localStorage.getItem('token')
        }
    });
    displayChatBox(chatBoxContent, result.data, memberId);
}

function displayChatBox(chatBoxContent, data, memberId) {
    chatBoxContent.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        if (data[i].recipeintId == memberId) {
            const div = document.createElement('div');
            div.className = 'message';
            div.innerHTML = ` 
                <div class="d-flex flex-row justify-content-end pb-2">
                    <div class="bg-gray-200 p-2 rounded-md ms-3">
                        <p class="text-xs">${data[i].messageText}</p>
                        <p class="text-xs text-gray-500 float-right">${data[i].date}</p>
                    </div>
                    <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                        alt="avatar 1" class="w-12 h-12 rounded-full">
                </div>
            `;
            chatBoxContent.appendChild(div);
        } else {
            const div = document.createElement('div');
            div.className = 'message';
            div.innerHTML = ` 
                <div class="d-flex flex-row justify-content-start pb-2">
                    <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                        alt="avatar 1" class="w-12 h-12 rounded-full">
                    <div class="bg-gray-200 p-2 rounded-md ms-3">
                        <p class="text-xs">${data[i].messageText}</p>
                        <p class="text-xs text-gray-500 float-right">${data[i].date}</p>
                    </div>
                </div>
            `;
            chatBoxContent.appendChild(div);
        }
    }
}

async function fetchList() {
    try {
        const token = localStorage.getItem('token');
        const result = await axios.get('/chat/getChatList', {
            headers: {
                "Authorization": token
            }
        });
        displayList(chatlist, chatBoxContent, result.data);
    } catch (error) {
        console.log(error);
    }
}

async function generateEncryptionKey() {
    return await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

async function encryptData(data, key) {
    const encodedData = new TextEncoder().encode(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encodedData);
    const encryptedArray = new Uint8Array(encryptedBuffer);
    return { iv, encryptedArray };
}

async function decryptData({ iv, encryptedArray }, key) {
    const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedArray);
    const decryptedData = new TextDecoder().decode(decryptedBuffer);
    return decryptedData;
}
async function getChatMessagesForMemberId(memberId) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post('/chat/get-chat', { memberId: memberId }, {
            headers: {
                'Authorization': token
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        return []; // Return an empty array or handle the error based on your requirements
    }
}
