const localVideo = document.getElementById("local-video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
const { RTCPeerConnection, RTCSessionDescription } = window;

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    if (localVideo) {
      localVideo.srcObject = stream
      //localVideo.srcObject = stream;
    }
    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));
  })
  .catch((err) => console.warn("Error: ", err.message));

const socket = io.connect("localhost:3000");


var peerConnection = new RTCPeerConnection(null);

peerConnection.ontrack = function ({ streams: [stream] }) {
  const remoteVideo = document.getElementById("remote-video");
  if (remoteVideo) {
    remoteVideo.srcObject = stream;
  }
};

socket.on("update-user-list", ({ users }) => {
  updateUserList(users);
});

socket.on("remove-user", ({ socketId }) => {
  const removeUser = document.getElementById(socketId);

  if (removeUser) {
    removeUser.remove();

  }
});

socket.on("call-made", async (data) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
  
      socket.emit("make-answer", {
        answer,
        to: data.socket,
      });
    
});



socket.on("answer-made", async (data) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );
  var mess = confirm(`Connect ${socket.id} ?`);
  if(mess = true)
    {
      if (!isAlreadyCalling) {
        callUser(data.socket);     
        isAlreadyCalling = true;
        
      }
  }else
  {
    document.querySelector("video").style = `height: 450px;
    border-radius: 1rem;
    margin: 1.5rem;
    margin-bottom: 3rem;
    width: 850px;
    object-fit: cover;
    transform: rotateY(180deg);
    -webkit-transform: rotateY(180deg);
    -moz-transform: rotateY(180deg);
    float: right;`;    
  };
  
});





function updateUserList(socketIds) {
  const activeUserContainer = document.getElementById("active-user-container");

  socketIds.forEach((socketId) => {
    const alreadyExistingUser = document.getElementById(socketId);
    if (!alreadyExistingUser) {
      const userContainer = createUserItemContainer(socketId);
      activeUserContainer.appendChild(userContainer);
    }
  });
}

function createUserItemContainer(socketId) {
  const userContainerEl = document.createElement("div");
  const inviteButton = document.querySelector("#inviteButton");
  const usernameEl = document.createElement("p");
  


  userContainerEl.setAttribute("class", "active-user");
  userContainerEl.setAttribute("id", socketId);
  usernameEl.setAttribute("class", "username");



  inviteButton.addEventListener("click", (e) => {
    usernameEl.innerHTML = `${socketId}`;
    usernameEl.style.display = "inline";
    userContainerEl.appendChild(usernameEl);
  });
  
  usernameEl.style.display = "none";
  
  

  userContainerEl.addEventListener("click", () => {
    
    userContainerEl.setAttribute("class", "active-user active-user--selected");
    
      if(callUser(socketId))
      {
        document.querySelector("video").style = `
        height: 420px;
        border-radius: 1rem;
        margin: 1.5rem;
        width: 1050px;
        object-fit: cover;
        transform: rotateY(180deg);
        -webkit-transform: rotateY(180deg);
        -moz-transform: rotateY(180deg);
        float: center;`;
        document.querySelector(".local-video").style = 
        `
          margin-bottom: 1.5rem;      
          height: 155px;
          width: 250px;
          border: 3px solid #161d29;`;

          
          
           
      }else
      {
        document.querySelector("video").style = `height: 450px;
        border-radius: 1rem;
        margin: 1.5rem;
        margin-bottom: 3rem;
        width: 850px;
        object-fit: cover;
        transform: rotateY(180deg);
        -webkit-transform: rotateY(180deg);
        -moz-transform: rotateY(180deg);
        float: right;`;    
      }
    
    
   
  });
  return userContainerEl;
}


async function callUser(socketId) {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
    socket.emit("call-user", {
      offer,
      to: socketId,
    });

    socket.on("createMessage", (data) => {

      messages.innerHTML +=
        `<div class="message" style="color: white;padding-left: 5px;padding-top: 5px;">
            <b><i class="far fa-user-circle"></i> <span> ${
              data.user !== socketId ? "me" : socket.id 
            }</span> </b>
            <span>${data.message}</span>
        </div>`;
        
      })

}


backBtn.addEventListener("click", () => {
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

showChat.addEventListener("click", () => {
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

const messages = document.querySelector(".messages");
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");





send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", {message: text.value});
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", {message: text.value});
    text.value = "";
  }
});

const leave = document.querySelector("#leaveMeeting");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
  const enabled = localVideo.srcObject.getAudioTracks()[0].enabled;
  if (enabled) {
    localVideo.srcObject.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  } else {
    localVideo.srcObject.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    muteButton.classList.toggle("background__red");
    muteButton.innerHTML = html;
  }
});




stopVideo.addEventListener("click", () => {
  const enabled = localVideo.srcObject.getVideoTracks()[0].enabled;
  if (enabled) {
    localVideo.srcObject.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  } else {
    localVideo.srcObject.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    stopVideo.classList.toggle("background__red");
    stopVideo.innerHTML = html;
  }
});




