/* ==========================
   Chatbot AI
   Script.js
   Part 1
==========================*/

"use strict";

/* ========= ELEMENT ========= */

const app = document.getElementById("app");
const loadingScreen = document.getElementById("loading-screen");

const chatContainer = document.getElementById("chatContainer");
const promptInput = document.getElementById("prompt");

const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const clearChatBtn = document.getElementById("clearChat");

const settingBtn = document.getElementById("settingBtn");
const settingsModal = document.getElementById("settingsModal");

const saveSetting = document.getElementById("saveSetting");
const closeSetting = document.getElementById("closeSetting");

const apiKeyInput = document.getElementById("apiKey");
const modelSelect = document.getElementById("model");

const typingIndicator =
document.getElementById("typingIndicator");

const chatHistory =
document.getElementById("chatHistory");

/* ========= DATA ========= */

let conversations = [];
let currentChat = 0;

/* ========= START ========= */

window.addEventListener("load", () => {

    loadSettings();

    loadChats();

    renderHistory();

    setTimeout(() => {

        loadingScreen.style.display = "none";

    },700);

});

/* ========= SETTINGS ========= */

function loadSettings(){

    apiKeyInput.value =
    localStorage.getItem("groq_api") || "";

    modelSelect.value =
    localStorage.getItem("groq_model")
    || "openai/gpt-oss-20b";

}

function saveSettings(){

    localStorage.setItem(
        "groq_api",
        apiKeyInput.value.trim()
    );

    localStorage.setItem(
        "groq_model",
        modelSelect.value
    );

    settingsModal.hidden = true;

}

/* ========= CHAT ========= */

function createChat(){

    conversations.unshift({

        title:"Chat Baru",

        messages:[]

    });

    currentChat = 0;

    saveChats();

    renderHistory();

    renderMessages();

}

function renderHistory(){

    chatHistory.innerHTML="";

    conversations.forEach((chat,index)=>{

        const item =
        document.createElement("button");

        item.className="history-item";

        item.textContent=chat.title;

        item.onclick=()=>{

            currentChat=index;

            renderMessages();

        };

        chatHistory.appendChild(item);

    });

}

function renderMessages(){

    chatContainer.innerHTML="";

    if(!conversations[currentChat]) return;

    conversations[currentChat]
    .messages
    .forEach(msg=>{

        const bubble =
        document.createElement("div");

        bubble.className=
        "message " + msg.role;

        bubble.textContent=
        msg.content;

        chatContainer.appendChild(bubble);

    });

    scrollBottom();

}

function clearCurrentChat(){

    if(!conversations[currentChat]) return;

    conversations[currentChat]
    .messages=[];

    saveChats();

    renderMessages();

}

/* ========= STORAGE ========= */

function saveChats(){

    localStorage.setItem(

        "chat_history",

        JSON.stringify(conversations)

    );

}

function loadChats(){

    const data =
    localStorage.getItem(
        "chat_history"
    );

    if(data){

        conversations=
        JSON.parse(data);

    }

    if(conversations.length===0){

        conversations.push({

            title:"Chat Baru",

            messages:[]

        });

    }

}

/* ========= UTIL ========= */

function scrollBottom(){

    chatContainer.scrollTop=
    chatContainer.scrollHeight;

}

/* ========= EVENT ========= */

newChatBtn.onclick=createChat;

clearChatBtn.onclick=
clearCurrentChat;

settingBtn.onclick=()=>{

    settingsModal.hidden=false;

};

closeSetting.onclick=()=>{

    settingsModal.hidden=true;

};

saveSetting.onclick=
saveSettings;

promptInput.addEventListener(

    "keydown",

    e=>{

        if(

            e.key==="Enter"

            &&

            !e.shiftKey

        ){

            e.preventDefault();

            sendBtn.click();

        }

    }

);

/* ==========================
   PART 2
   Groq API
========================== */

async function sendMessage(){

    const text = promptInput.value.trim();

    if(text === "") return;

    const apiKey = apiKeyInput.value.trim();

    if(apiKey === ""){

        alert("Masukkan API Key terlebih dahulu.");

        return;

    }

    const model = modelSelect.value;

    /* Buat chat jika belum ada */

    if(!conversations[currentChat]){

        createChat();

    }

    /* Simpan pesan user */

    conversations[currentChat].messages.push({

        role:"user",

        content:text

    });

    /* Judul chat */

    if(conversations[currentChat].title==="Chat Baru"){

        conversations[currentChat].title=

        text.substring(0,30);

    }

    saveChats();

    renderHistory();

    renderMessages();

    promptInput.value="";

    typingIndicator.hidden=false;

    sendBtn.disabled=true;
   
   try{

    const response = await fetch(

        "https://api.groq.com/openai/v1/chat/completions",

        {

            method:"POST",

            headers:{

                "Authorization":"Bearer "+apiKey,

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                model:model,

                messages:conversations[currentChat].messages,

                stream:true

            })

        }

    );

    if(!response.ok){

        throw new Error(

            "HTTP "+response.status

        );

    }

    // ===== PART 3A =====

    const reader = response.body.getReader();

    const decoder = new TextDecoder();

    let streamText = "";

    const aiBubble = {

        role:"ai",

        content:""

    };

    conversations[currentChat].messages.push(aiBubble);

    renderMessages();

    // ===================

   }

    catch(err){

        conversations[currentChat].messages.push({

            role:"ai",

            content:

            "❌ Error : "+err.message

        });

        renderMessages();

    }

    finally{

        typingIndicator.hidden=true;

        sendBtn.disabled=false;

        scrollBottom();

    }

}

/* ==========================
   Tombol Kirim
========================== */

sendBtn.onclick=sendMessage;
