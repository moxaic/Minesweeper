let mineField = [];
let bomb = [];
bomb.length = 20;
let flagCount = bomb.length;
let safe = [];
safe.length = 80;
let rows = 10;
let columns = 10;
let checkedDiv = 0;
let firstClick = true;
createGameGrid();

function closeSettings() {
  idleTime = setTimeout(animateDiv, 10000);
  document.querySelector(".modal_background").style.display = "none";
  document.querySelector("#settings").classList.toggle("active_button");
}

function openSettings() {
  clearTimeout(idleTime);
  document.querySelector("#settings").classList.toggle("active_button");
  if (
    !document.querySelector("#settings").classList.contains("active_button")
  ) {
    document.querySelector(".modal_background").style.display = "none";
    document.querySelector("#settings-modal").style.display = "none";
  } else {
    document.querySelector(".modal_background").style.display = "flex";
    document.querySelector("#settings-modal").style.display = "flex";
  }
}

function applyChanges(flag = true) {
  for (let i = 0; i < rows * columns; i++) {
    let rem = document.getElementById(i);
    rem.remove();
  }
  rows = Number(document.getElementById("rows").value);
  columns = Number(document.getElementById("columns").value);
  bomb = [];
  bomb.length = Math.ceil((rows * columns) / 5);
  safe = [];
  safe.length = rows * columns - bomb.length;
  flagCount = bomb.length;
  checkedDiv = 0;
  if (flag) {
    closeSettings();
  } else {
    document.querySelector(".result_background").style.display = "none";
  }
  firstClick = true;
  createGameGrid();
}

function createGameGrid() {
  bomb.fill("bomb");
  safe.fill("safe");
  mineField = bomb.concat(safe);
  shuffle(mineField);
  const parentDiv = document.querySelector(".game_content");
  parentDiv.style.width = `${columns * 44}px`;
  for (let i = 0; i < rows * columns; i++) {
    let mine = document.createElement("div");
    mine.setAttribute("id", i);
    mine.setAttribute("class", "mine");
    parentDiv.appendChild(mine);
    mine.addEventListener("click", leftClick);
    mine.addEventListener("contextmenu", rightClick);
  }
  handleResize();
  document.querySelector("#time").innerText = "00:00";
  document.querySelector("#flag-count").innerText = flagCount;
}

function leftClick() {
  countBombs(Number(this.getAttribute("id")));
  resetIdleTime();
  firstClick && startTimer();
  firstClick = false;
}

function rightClick(e) {
  e.preventDefault();
  postFlag(e.target.id);
  resetIdleTime();
  firstClick && startTimer();
  firstClick = false;
}

function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function countBombs(index) {
  let currentDiv = document.getElementById(index);
  if (currentDiv.classList.contains("checked")) return;
  if (mineField[index] == "bomb") gameOver();
  else {
    let localBombs = 0;
    let leftEdge = index % columns == 0;
    let rightEdge = index % columns == columns - 1;
    currentDiv.classList.add("checked");
    if (currentDiv.innerText == "🚩") postFlag(index);
    if (index > columns - 1 && mineField[index - columns] == "bomb")
      localBombs++;
    if (
      !rightEdge &&
      index > columns - 1 &&
      mineField[index - columns + 1] == "bomb"
    )
      localBombs++;
    if (!rightEdge && mineField[index + 1] == "bomb") localBombs++;
    if (
      !rightEdge &&
      index < columns * (rows - 1) &&
      mineField[index + columns + 1] == "bomb"
    )
      localBombs++;
    if (index < columns * (rows - 1) && mineField[index + columns] == "bomb")
      localBombs++;
    if (
      !leftEdge &&
      index < columns * (rows - 1) &&
      mineField[index + columns - 1] == "bomb"
    )
      localBombs++;
    if (!leftEdge && mineField[index - 1] == "bomb") localBombs++;
    if (
      !leftEdge &&
      index > columns - 1 &&
      mineField[index - columns - 1] == "bomb"
    )
      localBombs++;
    if (safe.length == ++checkedDiv) gameOver(true);
    if (localBombs === 0) checkNeighbour(index, leftEdge, rightEdge);
    else document.getElementById(index).innerHTML = localBombs;
  }
}

function checkNeighbour(index, leftEdge, rightEdge) {
  if (index > columns - 1) countBombs(index - columns);
  if (!rightEdge && index > columns - 1) countBombs(index - columns + 1);
  if (!rightEdge) countBombs(index + 1);
  if (!rightEdge && index < columns * (rows - 1))
    countBombs(index + columns + 1);
  if (index < columns * (rows - 1)) countBombs(index + columns);
  if (!leftEdge && index < columns * (rows - 1))
    countBombs(index + columns - 1);
  if (!leftEdge) countBombs(index - 1);
  if (!leftEdge && index > columns - 1) countBombs(index - columns - 1);
}

function postFlag(index) {
  let divFlag = document.getElementById(index);
  if (divFlag.innerText == "🚩") {
    divFlag.innerText = "";
    document.querySelector(".flags > div.value").innerText = ++flagCount;
  } else if (
    divFlag.innerText !== "🚩" &&
    !divFlag.classList.contains("checked")
  ) {
    divFlag.innerText = "🚩";
    document.querySelector(".flags > div.value").innerText = --flagCount;
  }
  checkFlags();
}

function checkFlags() {
  let correctFlagCount = 0;
  for (let i = 0; i < mineField.length; i++) {
    document.getElementById(i).innerText == "🚩" &&
      mineField[i] == "bomb" &&
      correctFlagCount++;
  }
  document.querySelector("#correct-flags").innerText = correctFlagCount;
  if (flagCount === 0) {
    if (correctFlagCount === bomb.length) gameOver(true);
    else gameOver();
  } else {
    document.querySelector(
      "#correct-flags"
    ).innerText = `${correctFlagCount} correct flag${
      correctFlagCount > 1 ? "s" : ""
    }`;
  }
}

function gameOver(victory = false) {
  for (let i = 0; i < mineField.length; i++) {
    document.getElementById(i).removeEventListener("click", leftClick);
    document.getElementById(i).removeEventListener("contextmenu", rightClick);
    if (mineField[i] == "bomb") {
      document.getElementById(i).classList.add("bomb");
      document.getElementById(i).innerText !== "🚩" &&
        (document.getElementById(i).innerText = "💣");
    }
  }
  closeHint();
  clearInterval(timer);
  displayResult(victory);
}

function displayResult(win) {
  if (win === true) {
    document.querySelector("#status").innerText = "You Win";
    document.querySelector("#stats").innerText = `Time taken: ${
      document.querySelector("#time").innerText
    }`;
  } else {
    document.querySelector("#status").innerText = "You Lose";
  }
  document.querySelector(".result_background").style.display = "flex";
}

dragElement(document.querySelector("#hint-div"));

function dragElement(elmnt) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  document.querySelector("#movable-div").onmousedown = dragMouseDown;
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function openHint() {
  clearTimeout(idleTime);
  document.querySelector("#hint-div").style.display = "block";
  checkFlags();
}

function closeHint() {
  idleTime = setTimeout(animateDiv, 10000);
  document.querySelector("#hint-div").style.display = "none";
}

function animateDiv() {
  document.querySelector("#animate-div").classList.add("animate");
  setTimeout(() => {
    document.querySelector("#animate-div").classList.remove("animate");
    resetIdleTime();
  }, 5000);
}

let idleTime;
const resetIdleTime = () => {
  clearTimeout(idleTime);
  idleTime = setTimeout(animateDiv, 10000);
};

window.onresize = handleResize;
function handleResize() {
  if (
    document.querySelector(".game_content").offsetHeight <=
    document.querySelector(".game_box").offsetHeight
  ) {
    document.querySelector(".game_content").classList.add("center");
  } else {
    document.querySelector(".game_content").classList.remove("center");
  }
}

let timer;
function startTimer() {
  let min = 0;
  let sec = 0;
  timer = setInterval(displayTime, 1000);
  function displayTime() {
    sec++;
    if (sec === 60) {
      sec = 0;
      min++;
    }
    if (min === 60) {
      clearInterval(timer);
      alert("Get a life!");
      return;
    }
    const time = formatTime(min, sec);
    document.querySelector("#time").innerText = time;
  }
}

function formatTime(min, sec) {
  let time;
  if (min < 10) {
    if (sec < 10) {
      time = `0${min}:0${sec}`;
    } else {
      time = `0${min}:${sec}`;
    }
  } else {
    if (sec < 10) {
      time = `${min}:0${sec}`;
    } else {
      time = `${min}:${sec}`;
    }
  }
  return time;
}
