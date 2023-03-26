///Переменные
const cards = document.querySelectorAll(".card");
const audio = document.querySelector(".audio");
const overlayResult = document.getElementById("endgame");
const overlay = document.getElementById("start-game");
const endgameTitle = document.querySelector(".endgame-result");
const endgameSteps = document.querySelector(".endgame-steps");
const timer = document.querySelectorAll(".timer");
const flips = document.querySelectorAll(".flips");
const resultButton = document.querySelectorAll(".result-button");
const resultTable = document.getElementById("result-table");
const resultList = document.querySelector(".result-list");

let hasFlipped = false;
let firstCard;
let secondCard;
let lock = false;
let intervalTimer;
let time = 100;
let steps = 0;
let openCards = 0;
let gameResults = [];

///////Переворот карточки
cards.forEach((item) => item.addEventListener("click", flip));
function flip() {
  ////Блокируем функцию до таймаута и от двойного нажатия
  if (lock === true) return;
  if (this === firstCard) return;

  clickSound();
  steps += 1;
  flips.forEach((item) => (item.textContent = `${steps}`));

  this.classList.add("flip");
  if (hasFlipped === false) {
    hasFlipped = true;
    firstCard = this;
  } else {
    secondCard = this;
    match();
  }
}

///Проверка совпадения
function match() {
  if (firstCard.dataset.image === secondCard.dataset.image) {
    openCards += 2;
    firstCard.removeEventListener("click", flip);
    secondCard.removeEventListener("click", flip);

    gameVictory(openCards);
    matchSound();
    reset();
  } else {
    lock = true;

    if (time !== 0) {
      setTimeout(() => {
        firstCard.classList.remove("flip");
        secondCard.classList.remove("flip");
        reset();
      }, 1000);
    }
  }
}

///Сброс состояний и пары карточе4
function reset() {
  hasFlipped = false;
  firstCard = null;
  secondCard = null;
  lock = false;
}

///Рандомный порядок карточек
function randomOrder() {
  cards.forEach((item) => {
    let index = Math.trunc(Math.random() * 16);
    item.style.order = index;
  });
}

///Предзагрузка карточек
const covers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
function preloadImg() {
  covers.forEach((item) => {
    const img = new Image();
    img.src = `./assets/icons/${item}.png`;
  });
}
preloadImg();

//Старт игры
overlay.addEventListener("click", () => startGame(overlay));
overlayResult.addEventListener("click", () => startGame(overlayResult));

function startGame(overlay) {
  overlay.classList.remove("active");

  randomOrder();

  time = 100;
  steps = 0;
  flips.forEach((item) => (item.textContent = `${steps}`));
  timer.forEach((item) => (item.textContent = `${time}`));

  clearInterval(intervalTimer);
  intervalTimer = setInterval(timeCounter, 1000);

  audio.volume = 0.2;
  audio.play();
}

/////Звуки игры
function clickSound() {
  const audio = new Audio();
  audio.src = "./assets/music/240776__f4ngy__card-flip.wav";
  audio.volume = 0.2;
  audio.autoplay = true;
}

function matchSound() {
  const audio = new Audio();
  audio.src =
    "./assets/music/456965__funwithsound__short-success-sound-glockenspiel-treasure-video-game.mp3";
  audio.volume = 0.2;
  audio.autoplay = true;
}

function loseSound() {
  const audio = new Audio();
  audio.src = "./assets/music/350986__cabled-mess__lose-c-01.wav";
  audio.volume = 0.2;
  audio.autoplay = true;
}

function victorySound() {
  const audio = new Audio();
  audio.src = "./assets/music/258142__tuudurt__level-win.wav";
  audio.volume = 0.2;
  audio.autoplay = true;
}

///Таймер

function timeCounter() {
  if (time !== 0) {
    time = time - 1;
    timer.forEach((item) => (item.textContent = `${time}`));
  } else {
    gameOver(time);
  }
}

///Проигрыш
function gameOver(time) {
  loseSound();
  audio.pause();
  audio.currentTime = 0;

  clearInterval(intervalTimer);
  endgameTitle.textContent = "GAME OVER";
  endgameSteps.textContent = `in ${steps} steps`;

  // recordResults(gameResults)
  let resultOfGame = endgameTitle.textContent + " " + endgameSteps.textContent;
  setLocalStorage(resultOfGame);

  overlayResult.classList.add("active");

  resetField();
}

////Функция выигрыша
function gameVictory(openCards) {
  if (openCards === 16) {
    victorySound();
    audio.pause();
    audio.currentTime = 0;

    clearInterval(intervalTimer);
    endgameTitle.textContent = "VICTORY";
    endgameSteps.textContent = `in ${steps} steps`;

    // recordResults(gameResults)
    let resultOfGame =
      endgameTitle.textContent + " " + endgameSteps.textContent;
    setLocalStorage(resultOfGame);

    overlayResult.classList.add("active");

    resetField();
  }
}

///Сброс поля для новой игры
function resetField() {
  cards.forEach((item) => item.classList.remove("flip"));
  cards.forEach((item) => item.addEventListener("click", flip));
  openCards = 0;
  reset();
}

///Открываем результаты
resultButton.forEach((item) => item.addEventListener("click", openResults));
function openResults() {
  resultTable.classList.add("active");

  audio.pause();
  clearInterval(intervalTimer);
}

///Закрываем результаты
resultTable.addEventListener("click", closeResults);
function closeResults() {
  resultTable.classList.remove("active");
  audio.play();
  intervalTimer = setInterval(timeCounter, 1000);
}

//Хранилище
window.addEventListener("load", getLocalStorage);

function getLocalStorage() {
  if (localStorage.getItem("results")) {
    gameResults = JSON.parse(localStorage.getItem("results"));
    updateResults(gameResults);
  }
}

function setLocalStorage(resultOfGame) {
  if (gameResults.length === 10) {
    gameResults.unshift(resultOfGame);
    gameResults.pop();
  } else {
    gameResults.unshift(resultOfGame);
  }
  localStorage.setItem("results", JSON.stringify(gameResults));
  updateResults(gameResults);
}

function updateResults(gameResults) {
  while (resultList.firstChild) {
    resultList.removeChild(resultList.firstChild);
  }

  if (gameResults.length > 0) {
    gameResults.forEach((item) => {
      let result = document.createElement("p");
      result.classList.add("results");
      result.textContent = item;
      resultList.appendChild(result);
    });
  }
}
