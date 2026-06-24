const pointsTotalElement = document.getElementById("pointsTotal");
const historyListElement = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistoryButton");

const levelTitleElement = document.getElementById("levelTitle");
const totalEarnedTextElement = document.getElementById("totalEarnedText");
const xpFillElement = document.getElementById("xpFill");
const nextLevelTextElement = document.getElementById("nextLevelText");

const levelUpModalElement = document.getElementById("levelUpModal");
const levelUpTitleElement = document.getElementById("levelUpTitle");
const levelUpMessageElement = document.getElementById("levelUpMessage");
const closeLevelUpModalButton = document.getElementById("closeLevelUpModal");

const toastElement = document.getElementById("toast");
const toastTitleElement = document.getElementById("toastTitle");
const toastMessageElement = document.getElementById("toastMessage");

let points = Number(localStorage.getItem("theGuildPoints")) || 0;
let totalEarned = Number(localStorage.getItem("theGuildTotalEarned")) || 0;
let history = JSON.parse(localStorage.getItem("theGuildHistory")) || [];

let toastTimer;

const LEVELS = [
  { level: 1, title: "New Recruit", requiredGold: 0 },
  { level: 2, title: "Guild Initiate", requiredGold: 5000 },
  { level: 3, title: "Apprentice Adventurer", requiredGold: 12000 },
  { level: 4, title: "Questing Scout", requiredGold: 22000 },
  { level: 5, title: "Iron Mercenary", requiredGold: 35000 },
  { level: 6, title: "Oathbound Knight", requiredGold: 52000 },
  { level: 7, title: "Guild Champion", requiredGold: 75000 },
  { level: 8, title: "Hero of the Hall", requiredGold: 105000 },
  { level: 9, title: "Living Legend", requiredGold: 145000 },
  { level: 10, title: "Guildmaster", requiredGold: 200000 }
];

const QUEST_MESSAGES = [
  "Hell yeah!",
  "Quest complete!",
  "Nice work!",
  "The guild approves.",
  "Another victory.",
  "Progress forged.",
  "Discipline pays.",
  "Gold earned."
];

function saveData() {
  localStorage.setItem("theGuildPoints", String(points));
  localStorage.setItem("theGuildTotalEarned", String(totalEarned));
  localStorage.setItem("theGuildHistory", JSON.stringify(history));
}

function getCurrentLevel() {
  let currentLevel = LEVELS[0];

  for (const level of LEVELS) {
    if (totalEarned >= level.requiredGold) {
      currentLevel = level;
    }
  }

  return currentLevel;
}

function getNextLevel(currentLevel) {
  return LEVELS.find((level) => level.requiredGold > currentLevel.requiredGold);
}

function showLevelUpModal(newLevel) {
  levelUpTitleElement.textContent = `Level ${newLevel.level} ${newLevel.title}`;
  levelUpMessageElement.textContent = `You have reached the rank of ${newLevel.title}.`;

  levelUpModalElement.classList.remove("hidden");
}

function showToast(activityName, activityPoints) {
  const randomMessage = QUEST_MESSAGES[Math.floor(Math.random() * QUEST_MESSAGES.length)];

  toastTitleElement.textContent = randomMessage;
  toastMessageElement.textContent = `${activityName}: +${activityPoints} gold`;

  toastElement.classList.remove("hidden");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toastElement.classList.add("hidden");
  }, 1800);
}

function animateButton(button) {
  button.classList.remove("button-pop");

  void button.offsetWidth;

  button.classList.add("button-pop");

  setTimeout(() => {
    button.classList.remove("button-pop");
  }, 320);
}

function updateLevelDisplay() {
  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel(currentLevel);

  levelTitleElement.textContent = `Level ${currentLevel.level} ${currentLevel.title}`;
  totalEarnedTextElement.textContent = `${totalEarned} lifetime gold`;

  if (!nextLevel) {
    xpFillElement.style.width = "100%";
    nextLevelTextElement.textContent = "Max level reached";
    return;
  }

  const goldIntoLevel = totalEarned - currentLevel.requiredGold;
  const goldNeededForLevel = nextLevel.requiredGold - currentLevel.requiredGold;
  const percentToNextLevel = Math.min((goldIntoLevel / goldNeededForLevel) * 100, 100);

  xpFillElement.style.width = `${percentToNextLevel}%`;
  nextLevelTextElement.textContent = `${nextLevel.requiredGold - totalEarned} gold until Level ${nextLevel.level}`;
}

function updateScreen() {
  pointsTotalElement.textContent = points;
  updateLevelDisplay();

  historyListElement.innerHTML = "";

  if (history.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No quests completed yet.";
    emptyItem.className = "history-empty";
    historyListElement.appendChild(emptyItem);
    return;
  }

  history.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = `${entry.date} — ${entry.text}`;
    historyListElement.appendChild(item);
  });
}

function getTodayString() {
  const today = new Date();

  return today.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function addHistory(text) {
  history.unshift({
    date: getTodayString(),
    text
  });

  saveData();
  updateScreen();
}

function logActivity(activityName, activityPoints) {
  const oldLevel = getCurrentLevel();

  points += activityPoints;
  totalEarned += activityPoints;

  const newLevel = getCurrentLevel();

  addHistory(`${activityName}: +${activityPoints} gold`);
  showToast(activityName, activityPoints);

  if (newLevel.level > oldLevel.level) {
    showLevelUpModal(newLevel);
  }
}

function claimReward(rewardName, rewardCost) {
  if (points < rewardCost) {
    alert(`You need ${rewardCost - points} more gold to claim ${rewardName}.`);
    return;
  }

  points -= rewardCost;
  addHistory(`Claimed ${rewardName}: -${rewardCost} gold`);
}

document.querySelectorAll("[data-activity]").forEach((button) => {
  button.addEventListener("click", () => {
    const activityName = button.dataset.activity;
    const activityPoints = Number(button.dataset.points);

    animateButton(button);
    logActivity(activityName, activityPoints);
  });
});

document.querySelectorAll("[data-reward]").forEach((button) => {
  button.addEventListener("click", () => {
    const rewardName = button.dataset.reward;
    const rewardCost = Number(button.dataset.cost);

    animateButton(button);
    claimReward(rewardName, rewardCost);
  });
});

clearHistoryButton.addEventListener("click", () => {
  const confirmed = confirm("Clear all history, gold, and level progress?");

  if (!confirmed) {
    return;
  }

  points = 0;
  totalEarned = 0;
  history = [];

  saveData();
  updateScreen();
});

closeLevelUpModalButton.addEventListener("click", () => {
  levelUpModalElement.classList.add("hidden");
});

updateScreen();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
