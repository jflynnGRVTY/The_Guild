const pointsTotalElement = document.getElementById("pointsTotal");
const historyListElement = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistoryButton");

const levelTitleElement = document.getElementById("levelTitle");
const totalEarnedTextElement = document.getElementById("totalEarnedText");
const xpFillElement = document.getElementById("xpFill");
const nextLevelTextElement = document.getElementById("nextLevelText");

let points = Number(localStorage.getItem("theGuildPoints")) || 0;
let totalEarned = Number(localStorage.getItem("theGuildTotalEarned")) || 0;
let history = JSON.parse(localStorage.getItem("theGuildHistory")) || [];

const LEVELS = [
  { level: 1, title: "Adventurer", requiredGold: 0 },
  { level: 2, title: "Apprentice", requiredGold: 500 },
  { level: 3, title: "Scout", requiredGold: 1250 },
  { level: 4, title: "Mercenary", requiredGold: 2250 },
  { level: 5, title: "Knight", requiredGold: 3500 },
  { level: 6, title: "Champion", requiredGold: 5000 },
  { level: 7, title: "Hero", requiredGold: 6750 },
  { level: 8, title: "Warden", requiredGold: 8750 },
  { level: 9, title: "Legend", requiredGold: 11000 },
  { level: 10, title: "Guildmaster", requiredGold: 13500 }
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
  points += activityPoints;
  totalEarned += activityPoints;
  addHistory(`${activityName}: +${activityPoints} gold`);
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

    logActivity(activityName, activityPoints);
  });
});

document.querySelectorAll("[data-reward]").forEach((button) => {
  button.addEventListener("click", () => {
    const rewardName = button.dataset.reward;
    const rewardCost = Number(button.dataset.cost);

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

updateScreen();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}