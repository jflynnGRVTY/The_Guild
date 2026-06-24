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

const abilityScoresListElement = document.getElementById("abilityScoresList");
const questCountListElement = document.getElementById("questCountList");

const currentGoldTextElement = document.getElementById("currentGoldText");
const currentLevelMiniTextElement = document.getElementById("currentLevelMiniText");
const lifetimeGoldTextElement = document.getElementById("lifetimeGoldText");
const totalQuestsTextElement = document.getElementById("totalQuestsText");
const daysActiveTextElement = document.getElementById("daysActiveText");
const topQuestTextElement = document.getElementById("topQuestText");

let points = Number(localStorage.getItem("theGuildPoints")) || 0;
let totalEarned = Number(localStorage.getItem("theGuildTotalEarned")) || 0;
let history = JSON.parse(localStorage.getItem("theGuildHistory")) || [];
let questCounts = JSON.parse(localStorage.getItem("theGuildQuestCounts")) || {};
let abilityXp = JSON.parse(localStorage.getItem("theGuildAbilityXp")) || {};
let firstUseDate = localStorage.getItem("theGuildFirstUseDate");

if (!firstUseDate) {
  firstUseDate = new Date().toISOString();
  localStorage.setItem("theGuildFirstUseDate", firstUseDate);
}

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

const ABILITIES = [
  {
    key: "strength",
    shortName: "STR",
    name: "Strength"
  },
  {
    key: "dexterity",
    shortName: "DEX",
    name: "Dexterity"
  },
  {
    key: "constitution",
    shortName: "CON",
    name: "Constitution"
  },
  {
    key: "intelligence",
    shortName: "INT",
    name: "Intelligence"
  },
  {
    key: "wisdom",
    shortName: "WIS",
    name: "Wisdom"
  },
  {
    key: "charisma",
    shortName: "CHA",
    name: "Charisma"
  }
];

const ABILITY_XP_BY_QUEST = {
  "Kettlebell Quest": {
    strength: 120,
    constitution: 80
  },
  "Targeted Workout": {
    strength: 100
  },
  "Run 1 Mile": {
    dexterity: 40,
    constitution: 60
  },
  "Walk 1 Mile": {
    constitution: 40
  },
  "Protein Goal": {
    strength: 20,
    constitution: 30
  },
  "Water Goal": {
    constitution: 30
  },
  "Stretch 10 Min": {
    dexterity: 25
  },
  "Sleep Goal": {
    wisdom: 50
  },
  "Read a Book": {
    intelligence: 220,
    wisdom: 80
  },
  "Learn or Tinker": {
    intelligence: 220,
    dexterity: 80
  },
  "Woodworking or Hobby": {
    dexterity: 150,
    strength: 150
  },
  "Complete a Project": {
    intelligence: 120,
    wisdom: 90,
    charisma: 90
  }
};

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

function ensureAbilityDefaults() {
  ABILITIES.forEach((ability) => {
    if (typeof abilityXp[ability.key] !== "number") {
      abilityXp[ability.key] = 0;
    }
  });
}

function saveData() {
  localStorage.setItem("theGuildPoints", String(points));
  localStorage.setItem("theGuildTotalEarned", String(totalEarned));
  localStorage.setItem("theGuildHistory", JSON.stringify(history));
  localStorage.setItem("theGuildQuestCounts", JSON.stringify(questCounts));
  localStorage.setItem("theGuildAbilityXp", JSON.stringify(abilityXp));
  localStorage.setItem("theGuildFirstUseDate", firstUseDate);
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

function getAbilityScore(abilityKey) {
  const xp = abilityXp[abilityKey] || 0;
  return 10 + Math.floor(xp / 1000);
}

function getAbilityProgressPercent(abilityKey) {
  const xp = abilityXp[abilityKey] || 0;
  const xpIntoCurrentPoint = xp % 1000;

  return Math.min((xpIntoCurrentPoint / 1000) * 100, 100);
}

function getAbilityXpIntoCurrentPoint(abilityKey) {
  const xp = abilityXp[abilityKey] || 0;
  return xp % 1000;
}

function getTotalQuestCompletions() {
  return Object.values(questCounts).reduce((total, count) => total + count, 0);
}

function getTopQuest() {
  const entries = Object.entries(questCounts);

  if (entries.length === 0) {
    return null;
  }

  entries.sort((a, b) => b[1] - a[1]);

  return {
    name: entries[0][0],
    count: entries[0][1]
  };
}

function getDaysActive() {
  const firstDate = new Date(firstUseDate);
  const today = new Date();
  const difference = today.getTime() - firstDate.getTime();
  const days = Math.floor(difference / 86400000) + 1;

  return Math.max(days, 1);
}

function formatAbilityGain(abilityGain) {
  const entries = Object.entries(abilityGain || {});

  if (entries.length === 0) {
    return "";
  }

  return entries
    .map(([key, value]) => {
      const ability = ABILITIES.find((item) => item.key === key);
      const label = ability ? ability.shortName : key.toUpperCase();

      return `${label} +${value} XP`;
    })
    .join(" · ");
}

function showLevelUpModal(newLevel) {
  levelUpTitleElement.textContent = `Level ${newLevel.level} ${newLevel.title}`;
  levelUpMessageElement.textContent = `You have reached the rank of ${newLevel.title}.`;

  levelUpModalElement.classList.remove("hidden");
}

function showToast(activityName, activityPoints, abilityGain) {
  const randomMessage = QUEST_MESSAGES[Math.floor(Math.random() * QUEST_MESSAGES.length)];
  const statText = formatAbilityGain(abilityGain);

  toastTitleElement.textContent = randomMessage;
  toastMessageElement.textContent = statText
    ? `${activityName}: +${activityPoints} gold · ${statText}`
    : `${activityName}: +${activityPoints} gold`;

  toastElement.classList.remove("hidden");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toastElement.classList.add("hidden");
  }, 2200);
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

function updateAbilityScoreDisplay() {
  abilityScoresListElement.innerHTML = "";

  ABILITIES.forEach((ability) => {
    const totalXp = abilityXp[ability.key] || 0;
    const score = getAbilityScore(ability.key);
    const progressPercent = getAbilityProgressPercent(ability.key);
    const xpIntoCurrentPoint = getAbilityXpIntoCurrentPoint(ability.key);

    const card = document.createElement("div");
    card.className = "ability-card";

    card.innerHTML = `
      <div class="ability-top">
        <span><strong>${ability.shortName}</strong>${ability.name}</span>
        <strong class="ability-score">${score}</strong>
      </div>
      <div class="ability-bar">
        <div class="ability-fill" style="width: ${progressPercent}%"></div>
      </div>
      <p>${xpIntoCurrentPoint} / 1000 XP · ${totalXp} total XP</p>
    `;

    abilityScoresListElement.appendChild(card);
  });
}

function updateQuestCountDisplay() {
  questCountListElement.innerHTML = "";

  const entries = Object.entries(questCounts).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.innerHTML = `No quests yet <span>0</span>`;
    questCountListElement.appendChild(emptyItem);
    return;
  }

  entries.forEach(([questName, count]) => {
    const item = document.createElement("li");
    item.innerHTML = `${questName} <span>${count}</span>`;
    questCountListElement.appendChild(item);
  });
}

function updateRecordDisplay() {
  const currentLevel = getCurrentLevel();
  const topQuest = getTopQuest();

  currentGoldTextElement.textContent = points;
  currentLevelMiniTextElement.textContent = `Level ${currentLevel.level}`;
  lifetimeGoldTextElement.textContent = totalEarned;
  totalQuestsTextElement.textContent = getTotalQuestCompletions();
  daysActiveTextElement.textContent = getDaysActive();

  if (!topQuest) {
    topQuestTextElement.textContent = "None yet";
  } else {
    topQuestTextElement.textContent = `${topQuest.name} ×${topQuest.count}`;
  }
}

function updateHistoryDisplay() {
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

function updateScreen() {
  pointsTotalElement.textContent = points;

  updateLevelDisplay();
  updateAbilityScoreDisplay();
  updateQuestCountDisplay();
  updateRecordDisplay();
  updateHistoryDisplay();
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

function applyAbilityXp(activityName) {
  const abilityGain = ABILITY_XP_BY_QUEST[activityName] || {};

  Object.entries(abilityGain).forEach(([abilityKey, xpGain]) => {
    abilityXp[abilityKey] += xpGain;
  });

  return abilityGain;
}

function logActivity(activityName, activityPoints) {
  const oldLevel = getCurrentLevel();

  points += activityPoints;
  totalEarned += activityPoints;

  questCounts[activityName] = (questCounts[activityName] || 0) + 1;

  const abilityGain = applyAbilityXp(activityName);
  const newLevel = getCurrentLevel();
  const statText = formatAbilityGain(abilityGain);

  if (statText) {
    addHistory(`${activityName}: +${activityPoints} gold · ${statText}`);
  } else {
    addHistory(`${activityName}: +${activityPoints} gold`);
  }

  showToast(activityName, activityPoints, abilityGain);

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
  const confirmed = confirm("Clear all history, gold, level progress, quest counts, and ability scores?");

  if (!confirmed) {
    return;
  }

  points = 0;
  totalEarned = 0;
  history = [];
  questCounts = {};
  abilityXp = {};
  firstUseDate = new Date().toISOString();

  ensureAbilityDefaults();
  saveData();
  updateScreen();
});

closeLevelUpModalButton.addEventListener("click", () => {
  levelUpModalElement.classList.add("hidden");
});

ensureAbilityDefaults();
saveData();
updateScreen();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
