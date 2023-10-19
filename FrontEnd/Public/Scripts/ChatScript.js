document.addEventListener("DOMContentLoaded", function () {
    const chatlist = document.getElementById('chat-list');
    const chatBoxContent = document.getElementById('myChatMessage');
    fetchList(chatlist, chatBoxContent);
});

function fetchList(chatlist, chatBoxContent) {
    for (let i = 0; i < 5; i++) {
        let li = document.createElement('li');
        li.className = "p-2 border-bottom";
        let button = document.createElement('button');
        button.className = 'd-flex justify-content-between items-center chat-button';
        button.innerHTML = `<div class="d-flex flex-row items-center">
        <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
            alt="avatar" class="me-3 rounded-full" width="60">
        <span class="bg-success rounded-full h-3 w-3"></span>
        <div class="pt-1">
            <p class="font-semibold mb-0">Marie Horwitz</p>
            <p class="text-xs text-gray-500">${i}</p>
        </div>
    </div>
    <div class="pt-1 text-xs text-gray-500">
        <p class="mb-1">Just now</p>
        <span class="badge bg-danger rounded-full">3</span>
    </div>`;
        button.addEventListener('click', () => {
            var chatDiv = document.getElementById('chatDiv');
            var chatMessage = document.getElementById('myChatMessage');
            var secondSection = document.getElementById("myChatId");
            if (window.innerWidth <= 768) {
                chatDiv.style.display = "none";
            }
            if (secondSection.style.display === "none" || secondSection.style.display === "") {
                secondSection.style.display = "block";
                chatMessage.style.display = "block";
            } else {
                secondSection.style.display = "none";
                chatMessage.style.display = "none";
            }
            // const chatListHeight = getComputedStyle(chatlist).height;
            // chatBoxContent.style.height = chatListHeight;
            displayChatBox(i, chatBoxContent);
        });

        li.appendChild(button);
        chatlist.appendChild(li);
    }
}

function displayChatBox(x, chatBoxContent) {
    chatBoxContent.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = ` 
                <div class="d-flex flex-row items-center">
                   <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp"
                       alt="avatar 1" class="w-12 h-12 rounded-full">
                   <div class="bg-gray-200 p-2 rounded-md ms-3">
                       <p class="text-xs">${x}</p>
                       <p class="text-xs text-gray-500 float-right">12:00 PM | Aug 13</p>
                   </div>
               </div>
       `
        chatBoxContent.appendChild(div);
    }
}