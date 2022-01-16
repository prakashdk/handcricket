let start = document.querySelector("#connect");
const page1 = document.querySelector(".page1");
const page2 = document.querySelector(".page2");
const alertBox = document.querySelector(".alerts");
const nameField = document.querySelector("#name-field");
const toss = document.querySelector(".toss");
const choice = document.querySelector(".choice");
const game = document.querySelector(".game");
let arena = document.querySelector(".arena");

page2.style.display = "none";
toss.style.display = "none";
choice.style.display = "none";

let conn = null;

let data = {
  name: null,
  score: 0,
  role: null,
  message: null,
  messageType: null,
  currentPick: 0,
  opponentPick: 0,
  innings: 1,
  target: 0,
};

const isEmpty = (a) => {
  return a === "" || a === null || a === undefined || a === 0;
};

const setAlert = (alert) => {
  if (alertBox.children.length === 3) {
    alertBox.removeChild(alertBox.children[2]);
  }

  let div = document.createElement("div");
  let text = document.createTextNode(alert);
  div.appendChild(text);
  div.classList.add("alert");
  alertBox.insertBefore(div, alertBox.children[0]);
};

const setMessage = (message) => {
  console.log(message);
};

const sendMessage = () => {
  conn.send(JSON.stringify(data));
};

const setOpponent = (message) => {};

let tossData = {
  tossInterval: null,
  face: null,
};
const makeChoice = (elect) => {
  document
    .querySelector(".bat")
    .removeEventListener("click", () => makeChoice("bat"));
  document
    .querySelector(".bowl")
    .removeEventListener("click", () => makeChoice("bowl"));
  data.role = elect;
  sendMessage();
  choice.style.display = "none";
  startTimer();
};
const askChoice = () => {
  document
    .querySelector(".bat")
    .addEventListener("click", () => makeChoice("bat"));
  document
    .querySelector(".bowl")
    .addEventListener("click", () => makeChoice("bowl"));
  choice.style.display = "block";
};

const setToss = () => {
  document.querySelector(".head").addEventListener("click", () => endToss("H"));
  document.querySelector(".tail").addEventListener("click", () => endToss("T"));
  toss.style.display = "block";
  let rune = "T";
  tossData.tossInterval = setInterval(() => {
    toss.querySelector(".coin").innerHTML = rune;
    tossData.face = rune;
    rune = rune === "T" ? "H" : "T";
  }, 100);
};

const endToss = (pick) => {
  document
    .querySelector(".head")
    .removeEventListener("click", () => endToss("H"));
  document
    .querySelector(".tail")
    .removeEventListener("click", () => endToss("T"));
  clearInterval(tossData.tossInterval);
  if (pick === tossData.face) {
    data.role = "tosswin";
    sendMessage();
    setAlert("You won the toss");
    askChoice();
  } else {
    data.role = "tossloss";
    sendMessage();
    setAlert("You lost the toss");
    waitChoice();
  }
  tossData = null;
  toss.style.display = "none";
};

const waitToss = () => {
  setAlert("Waiting for opponent to make a toss call");
};
const waitChoice = () => {
  setAlert("Waiting for opponent to choose bat/bowl");
};

const updateUI = () => {
  data.score = 0;
  data.currentPick = 0;
  data.opponentPick = 0;
  if (data.role === "bat") {
    document.querySelector(".status").innerHTML = "You're batting";
    updateScore();
    let target = document.querySelector(".target");
    target.innerHTML = `Your target: ${data.target}`;
  }
  if (data.role === "bowl") {
    document.querySelector(".score").innerHTML = "";
    document.querySelector(".status").innerHTML = "You're bowling";
  }
  document.querySelector(".innings").innerHTML = "2nd innings";
  setTimeout(startTimer, 2000);
};

const removeUtils = () => {
  page2.style.display = "none";
  beep = null;
};

const gameOver = (message) => {
  data.role = "endgame";
  if (message) {
    if (message.messageType === "win") {
      setAlert("You won the match");
    } else {
      setAlert("You lost the match");
    }
  } else {
  }
};

const endGame = () => {
  if (isConcluded()) {
    // setAlert("You won the match");
    data.role = "endgame";
    data.message = `${data.name} won the match`;
    data.messageType = "lost";
    sendMessage();
  } else if (data.role === "bat" && data.score < data.target) {
    setAlert("You lost the match");
    data.role = "endgame";
    data.message = `${data.name} won the match`;
    data.messageType = "win";
    sendMessage();
  }
  gameOver(null);
};

const isConcluded = () => {
  return data.role === "bat" && data.score >= data.target;
};

const handleResult = () => {
  data.currentPick = 0;
  data.opponentPick = 0;
  data.messageType = null;
  let h1 = document.createElement("h1");
  h1.innerHTML = "It's a wicket";
  arena.appendChild(h1);
  if (data.innings === 1) {
    data.innings = 2;
    data.role = data.role === "bat" ? "bowl" : "bat";
    updateUI();
  } else {
    // if(data)
    setAlert("Game over");
    if (data.role === "bat") endGame();
  }

  data.currentPick = 0;
  data.opponentPick = 0;
  data.messageType = null;
};

const updateScore = () => {
  let score = document.querySelector(".score");
  score.innerHTML = `Your score: ${data.score}`;
};

const announceResult = () => {
  arena.innerHTML = "";
  if (isEmpty(data.currentPick) || isEmpty(data.opponentPick)) {
    let h1 = document.createElement("h1");
    h1.innerHTML = "It's a dead ball";
    arena.appendChild(h1);
  } else if (!isEmpty(data.currentPick) && !isEmpty(data.opponentPick)) {
    let templates = document.getElementsByTagName("template");
    let result = templates[1].content.cloneNode(true);
    arena.innerHTML = "";
    arena.appendChild(result);
    let images = arena.getElementsByTagName("img");
    images[0].src = `images/${data.currentPick}.png`;
    images[1].src = `images/${data.opponentPick}.png`;
    if (data.currentPick === data.opponentPick) {
      setTimeout(handleResult, 1000);
      return;
    } else {
      data.score = data.score + data.currentPick;
      if (data.role === "bat") updateScore();
      if (data.innings === 2 && isConcluded()) {
        endGame();
        return;
      }
    }
  }
  data.currentPick = 0;
  data.opponentPick = 0;
  data.messageType = null;
  setTimeout(() => {
    if (data.role !== "endgame") startTimer();
  }, 2000);
};

const handleGame = () => {
  createButtons();
  // setTimeout(announceResult, 1000);
};

const handleMatchSettings = (message) => {
  if (data.role === "bat" || data.role === "bowl") {
    if (isEmpty(message.messageType)) {
      data.opponentPick = message.currentPick;

      if (data.innings === 1) data.target = message.score + 1;
      if (data.currentPick) {
        announceResult();
      }
    } else {
      setAlert(message.message);
    }
  } else {
    setAlert(`${message.name} elected to ${message.role}`);
    data.role = message.role === "bat" ? "bowl" : "bat";
    startTimer();
  }
};

const handleMessage = (message) => {
  let parsed = JSON.parse(message);
  if (parsed.messageType === "message") {
    setAlert(parsed.message);
  } else if (isEmpty(parsed.role)) {
    updateTitle(`${data.name} vs ${parsed.name}`);
    data.role = "toss";
    sendMessage();
    waitToss();
  } else if (parsed.role === "toss") {
    updateTitle(`${data.name} vs ${parsed.name}`);
    data.role = "caller";
    sendMessage();
    setToss();
  } else if (parsed.role === "tosswin") {
    setAlert("You lost the toss");
    waitChoice();
  } else if (parsed.role === "tossloss") {
    askChoice();
    setAlert("You won the toss");
  } else if (parsed.role === "bat" || parsed.role === "bowl") {
    handleMatchSettings(parsed);
  } else if (parsed.role === "endgame") {
    gameOver(parsed);
  }
};

const updateTitle = (title) => {
  document.querySelector(".title").innerHTML = "";
  let text = document.createTextNode(title);
  document.querySelector(".title").appendChild(text);
};

const establishConnection = (name) => {
  conn = new WebSocket(`ws:${window.location.href.slice(5)}/socket`);

  conn.onmessage = (message) => {
    handleMessage(message?.data);
  };

  conn.onopen = (res) => {
    data.name = name;
    updateTitle(`${name} vs waiting for opponent`);
    sendMessage(data);
    setAlert("connection established");
  };
  conn.onclose = (res) => {
    console.log(res);
    setAlert("connection failed");
  };
};

const sledge = () => {
  let input = page2.querySelector(".input");
  if (isEmpty(input.value)) {
    setAlert("Enter something");
    return;
  }
  data.message = input.value;
  input.value = "";
  data.messageType = "message";
  sendMessage();
  data.message = null;
  data.messageType = null;
};

const setConnection = () => {
  let name = nameField.value;
  nameField.value = "";
  if (name === "") {
    setAlert("enter name");
    return;
  }
  establishConnection(name);

  page1.style.display = "none";
  page2.style.display = "block";
  page2.querySelector(".sledge").addEventListener("click", sledge);
};

const addScore = (score) => {
  let buttons = document.querySelector(".buttons");
  buttons.childNodes.forEach((button) => (button.disabled = true));
  data.currentPick = score;
  data.messageType = null;
  sendMessage(data);
  if (data.opponentPick && data.role !== "endgame") {
    announceResult();
  }
};

function createButtons() {
  arena.innerHTML = "";
  let templates = document.getElementsByTagName("template");
  let node = templates[2].content.cloneNode(true);
  arena.appendChild(node);
  let buttons = document.querySelector(".buttons");

  [1, 2, 3, 4, 5, 6].forEach((score) => {
    let button = document.createElement("button");

    button.innerHTML = score;
    button.addEventListener("click", () => addScore(score));
    buttons.appendChild(button);
  });
}

let beep = new Audio(
  "https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3"
);
beep.volume = 0.1;

const setTimer = (time, parent) => {
  parent.innerHTML = time;
  beep?.play();
};

const startTimer = () => {
  document.querySelector(".status").innerHTML =
    data.role === "bat" ? "You're Batting" : "You're Bowling";
  let time = 3;
  let templates = document.getElementsByTagName("template");
  let timerElement = templates[0].content.cloneNode(true);
  arena.innerHTML = "";
  arena.appendChild(timerElement);
  timerElement = document.querySelector(".timer");
  timerElement.classList.add("zoom");
  setTimer(time, timerElement);

  const handleTimer = () => {
    if (time == 1) {
      timerElement.innerHTML = "";
      timerElement.classList.remove("zoom");
      clearInterval(interval);
      handleGame();
    } else {
      time--;
      setTimer(time, timerElement);
    }
  };
  const interval = setInterval(handleTimer, 1000);
};

start.addEventListener("click", setConnection);
