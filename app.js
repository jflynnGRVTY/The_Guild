const pointsTotalElement = document.getElementById("pointsTotal");
const historyListElement = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistoryButton");

let points = Number(localStorage.getItem("theGuildPoints")) || 0;
let history = JSON.parse(localStorage.getItem("theGuildHistory")) || [];

function saveData() {
  localStorage.setItem("theGuildPoints", String(points));
  localStorage.setItem("theGuildHistory", JSON.stringify(history));
}

function updateScreen() {
  pointsTotalElement.textContent = points;
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
  addHistory(`${activityName}: +${activityPoints} points`);
}

function claimReward(rewardName, rewardCost) {
  if (points < rewardCost) {
    alert(`You need ${rewardCost - points} more points to claim ${rewardName}.`);
    return;
  }

  points -= rewardCost;
  addHistory(`Claimed ${rewardName}: -${rewardCost} points`);
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
  const confirmed = confirm("Clear all history and reset points?");

  if (!confirmed) {
    return;
  }

  points = 0;
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