const rowhead = document.getElementById('rowhead');
const input = document.getElementById('inputs');
const tablerow = document.getElementById('game_table--row');
const img = document.createElement("div");
const played = document.getElementById('Played');
const win = document.getElementById('Win%');
const currentStreak = document.getElementById('CurrentStreak');
const maxStreak = document.getElementById('MaxStreak');
const player = document.createElement("div");
const whom = document.createElement("div");
const autolists = document.getElementById('autolists');
const distribution = document.getElementById('d');
const time = document.createElement("h4");

const offsetFromDate = new Date(2024, 6, 17); // Corrected month (January is 0)
const msOffset =  Date.now() -offsetFromDate.getTime() ;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const roundOffset = Math.floor(dayOffset);
let today = new Date();

const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
const yyyy = today.getFullYear();
today = `${mm}/${dd}/${yyyy}`;

let change = false;
let maxBar = 0;
let wins = 0;
let solved = false;

window.onload = () => startInfo();

if (localStorage.getItem("userData") === null) {
  const userData = {
    wins: 0,
    maxBar: 1,
    played: 0,
    currentStreak: 0,
    maxStreak: 0,
    gamePlayed: false
  };
  localStorage.setItem("userData", JSON.stringify(userData));
}

if (localStorage.getItem("guesses") === null) {
  const guesses = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0
  };
  localStorage.setItem("guesses", JSON.stringify(guesses));
}

if (localStorage.getItem("lastGame") === null) {
  const lastGame = {
    lastPlayedIndex: -1,
    currentGameIndex: -1,
    numberOfGuesses: 0,
    shareString: "none",
    placeholder: "none"
  };
  localStorage.setItem("lastGame", JSON.stringify(lastGame));
}

if (localStorage.getItem("currentGame") === null) {
  const currentGame = {
    0: "none",
    1: "none",
    2: "none",
    3: "none",
    4: "none",
    5: "none",
    6: "none",
    7: "none"
  };
  localStorage.setItem("currentGame", JSON.stringify(currentGame));
}

const userData = JSON.parse(localStorage.getItem("userData"));
const guesses = JSON.parse(localStorage.getItem("guesses"));
const lastGame = JSON.parse(localStorage.getItem("lastGame"));
const currentGame = JSON.parse(localStorage.getItem("currentGame"));

// console.log(guesses);
// console.log(lastGame);
// console.log(currentGame);


function startInfo() {
  if (lastGame.lastPlayedIndex === Math.floor(dayOffset)) {
    input.placeholder = lastGame.placeholder;
    input.disabled = true;
  }

  for (let i = 0; i < Object.keys(guesses).length; i++) {
    const numBox = distribution.children.item(i);
    const bar = numBox.children.item(1).children.item(0);
    const number = bar.children.item(0);
    number.innerHTML = guesses[i + 1];
    let width = 0;
    if (guesses[userData.maxBar] !== 0) {
      width = guesses[i + 1] / guesses[userData.maxBar];
    }
    if (width > 0.08) {
      bar.style.width = (width * 100) + "%";
      bar.style.color = "white";
    } else {
      bar.style.width = '7%';
    }
  }

  currentStreak.innerHTML = userData.currentStreak;
  maxStreak.innerHTML = userData.maxStreak;
  played.innerHTML = userData.played;
  win.innerHTML = userData.played === 0 ? 0 : Math.round((userData.wins / userData.played) * 100);
}

let playerNames = [];
async function playerInfo() {
  const response = await fetch('./PlayerInfoFinal.json');
  const data = await response.json();
  const fulldata = data.filter(p => p.TEAM_ABBREVIATION !== "");
  playerNames = fulldata.map(name => name.DISPLAY_FIRST_LAST);
  return fulldata;
}

async function teamData() {
  const response = await fetch('./TeamInfoFinal.json');
  return await response.json();
}

async function playerPool() {
  const response = await fetch('./playerPool2.json');
  return await response.json();
}

playerPool().then(dataThree => {
  teamData().then(dataTwo => {
    playerInfo().then(fulldata => {
      const teamData = dataTwo;
      const playerData = fulldata;
      const possiblePlayers = dataThree;
      // console.log(possiblePlayers[Math.floor(roundOffset)+1])
      const players = possiblePlayers[Math.floor(roundOffset)];
      // console.log(dayOffset)
      const inputEl = document.querySelector("#inputs");
      let place = 1;
      let coloredBoxed = "";
      // console.log(players);

      const correctPlayer = createCorrectPlayer(players);

      if (lastGame.lastPlayedIndex === Math.floor(dayOffset)) {
        over(players, lastGame.numberOfGuesses);
      }

      for (let i = 0; i < Object.keys(currentGame).length; i++) {
        // console.log
        if (currentGame[0] !== "none" && lastGame.currentGameIndex === Math.floor(dayOffset)) {
          // console.log(currentGame[i]);
          if (currentGame[i] !="none"){
          connect(currentGame[i]);
          }
        } else {
          // console.log(lastGame.currentGameIndex + "  " + Math.floor(dayOffset))
          // console.log("Ending current game");
          const currentGame = {
            1: "none",
            2: "none",
            3: "none",
            4: "none",
            5: "none",
            6: "none",
            7: "none",
            8: "none"
          };
          localStorage.setItem("currentGame", JSON.stringify(currentGame));
        }
      }

      inputEl.addEventListener("input", onInputChange);

      function onInputChange() {
        removeAutoCompleteDropDown();
        const value = inputEl.value.toLowerCase();
        if (value.length === 0) return;
        const filteredNames = playerNames.filter(playerName => {
          const space = playerName.indexOf(" ") + 1;
          return playerName.substr(0, value.length).toLowerCase() === value ||
            playerName.substr(space, value.length).toLowerCase() === value;
        }).slice(0, 5);
        createAutoCompleteDropdown(filteredNames);
      }

      function createAutoCompleteDropdown(list) {
        const listEl = document.createElement("ul");
        listEl.className = "autolist";
        listEl.id = "autolists";
        list.forEach((player, index) => {
          const listItem = document.createElement("li");
          const playerButton = document.createElement("button");
          listItem.id = "autosuggest__results-item-" + index;
          playerButton.innerHTML = player;
          playerButton.addEventListener("click", onPlayerButtonClick);
          listItem.appendChild(playerButton);
          listEl.appendChild(listItem);
        });
        document.querySelector("#wrapper").appendChild(listEl);
      }

      function removeAutoCompleteDropDown() {
        const listEl = document.querySelector("#autolists");
        if (listEl) {
          listEl.remove();
        }
      }

      function onPlayerButtonClick(e) {
        e.preventDefault();
        inputEl.value = e.target.innerHTML;
        connect(inputEl.value);
        inputEl.value = "";
        removeAutoCompleteDropDown();
      }

      document.addEventListener('click', e => {
        if (!inputEl.contains(e.target) && e.target !== inputEl) {
          removeAutoCompleteDropDown();
        }
        if (inputEl.contains(e.target) && inputEl.value !== 0) {
          removeAutoCompleteDropDown();
          const value = inputEl.value.toLowerCase();
          if (value.length === 0) return;
          const filteredNames = playerNames.filter(playerName => {
            const space = playerName.indexOf(" ") + 1;
            return playerName.substr(0, value.length).toLowerCase() === value ||
              playerName.substr(space, value.length).toLowerCase() === value;
          }).slice(0, 5);
          createAutoCompleteDropdown(filteredNames);
        }
      });

      function createCorrectPlayer(randPlayI) {
        const randomId = randPlayI.PERSON_ID;
        const rname = randPlayI.DISPLAY_FIRST_LAST;
        const rteam = randPlayI.TEAM_ABBREVIATION;
        const rteamid = randPlayI.PERSON_ID;
        const rconf = checkConf(rteam);
        const rdiv = checkDiv(rteam);
        const rposition = randPlayI.POSITION[0];
        const rheight = getHeight(randPlayI.HEIGHT);
        const rage = findAge(randPlayI.BIRTHDATE);
        const rno = randPlayI.JERSEY;
        lastGame.teamID = rteamid;
        whom.innerHTML = "Who is this?";
        whom.classList.add('whos');
        img.style.backgroundImage = "url(https://cdn.nba.com/headshots/nba/latest/1040x760/" + rteamid + ".png)";
        img.className = "silimg";
        player.classList = "modalinfo";
        player.appendChild(img);
        player.appendChild(whom);
        img.width = "360";
        img.height = "250";
        const rplayerin = [
          rname,
          rteam,
          rconf,
          rdiv,
          rposition,
          rheight,
          rage,
          rno
        ];
        document.querySelector("#who").appendChild(player);
        return rplayerin;
      }

      function placeHolder() {
        place += 1;
        if (!input.disabled && place < 9) {
          input.placeholder = `Guess ${place} of 8`;
        } else if (!input.disabled && place < 9) {
          input.placeholder = `You solved it in ${(place - 1)}!`;
          input.style.backgroundColor = "#f5f2ec";
        } else if (place === 9) {
          input.placeholder = "Game over";
          input.style.backgroundColor = "#f5f2ec";
          played.innerHTML = parseInt(played.innerHTML) + 1;
          currentStreak.innerHTML = 0;
        }
      }

      function createTable(info) {
        const rowEl = document.createElement("div");
        rowEl.className = "game_table-row";
        rowEl.id = "game_table--row";
        const name = info[0].DISPLAY_FIRST_LAST;
        const team = info[0].TEAM_ABBREVIATION;
        const teamid = info[0].TEAM_ID;
        const conf = checkConf(team);
        const div = checkDiv(team);
        const position = info[0].POSITION[0];
        const height = getHeight(info[0].HEIGHT);
        const age = findAge(info[0].BIRTHDATE);
        const no = info[0].JERSEY;
        const playerin = [
          name,
          team,
          conf,
          div,
          position,
          height,
          age,
          no
        ];

        playerin.forEach((item, index) => {
          const rowItem = document.createElement("div");
          const rowInfo = document.createElement("div");
          rowItem.className = "game_table-cell";
          if (index === 1) {
            const teamdiv = document.createElement("div");
            const teamlogo = document.createElement("div");
            const img = document.createElement("img");
            img.className = "team-cell";
            teamlogo.appendChild(img);
            teamdiv.appendChild(teamlogo);
            img.src = `https://cdn.nba.com/logos/nba/${teamid}/primary/L/logo.svg`;
            img.width = "50";
            img.height = "50";
            if (pastTeams(playerin[1], correctPlayer) === 1) {
              rowItem.style.background = "#eadd65";
            }
            rowInfo.innerHTML = playerin[index];
            teamdiv.appendChild(rowInfo);
            rowItem.appendChild(teamdiv);
            rowEl.appendChild(rowItem);
            rowItem.classList.add('shows');
          } else if (index === 5) {
            const cRan = range(playerin[5], correctPlayer[5]);
            if (cRan >= 1) {
              const teamdiv = document.createElement("div");
              const dir = document.createElement("div");
              dir.className = "team-cell";
              if (cRan === 1) {
                dir.innerHTML = "&darr;";
              } else if (cRan === 2) {
                dir.innerHTML = "&uarr;";
              }
              rowInfo.innerHTML = playerin[index];
              teamdiv.appendChild(rowInfo);
              teamdiv.appendChild(dir);
              rowItem.appendChild(teamdiv);
              rowEl.appendChild(rowItem);
              rowItem.classList.add('shows');
              rowItem.style.backgroundColor = "#eadd65";
            } else {
              rowInfo.innerHTML = playerin[index];
              rowItem.appendChild(rowInfo);
              rowEl.appendChild(rowItem);
              rowItem.classList.add('shows');
            }
          } else if (index === 6 || index === 7) {
            if (Math.abs(parseInt(correctPlayer[index]) - parseInt(playerin[index])) <= 2) {
              const teamdiv = document.createElement("div");
              const dir = document.createElement("div");
              dir.className = "team-cell";
              if (parseInt(correctPlayer[index]) - parseInt(playerin[index]) < 0) {
                dir.innerHTML = "&darr;";
              } else if (parseInt(correctPlayer[index]) - parseInt(playerin[index]) > 0) {
                dir.innerHTML = "&uarr;";
              }
              rowInfo.innerHTML = playerin[index];
              teamdiv.appendChild(rowInfo);
              teamdiv.appendChild(dir);
              rowItem.appendChild(teamdiv);
              rowEl.appendChild(rowItem);
              rowItem.classList.add('shows');
              rowItem.style.backgroundColor = "#eadd65";
            } else {
              rowInfo.innerHTML = playerin[index];
              rowItem.appendChild(rowInfo);
              rowEl.appendChild(rowItem);
              rowItem.classList.add('shows');
            }
          } else {
            rowInfo.innerHTML = playerin[index];
            rowItem.appendChild(rowInfo);
            rowEl.appendChild(rowItem);
            rowItem.classList.add('shows');
          }
        });

        document.querySelector("#gamewrapper").appendChild(rowEl);
        const rowNum = document.querySelector("#gamewrapper");
        const number = rowNum.childElementCount;
        currentGame[number - 1] = name;
        localStorage.setItem("currentGame", JSON.stringify(currentGame));
        checkMatch(playerin, correctPlayer);
      }

      function pastTeams(p, correctPlayer) {
        const teams = teamData.filter(m => m.PLAYER_ID === p.PERSON_ID);
        for (let i = 0; i < teams.length; i++) {
          if (teams[0].TEAM_ABBREVIATION === p) {
            return 1;
          }
        }
        return 2;
      }

      function checkConf(team) {
        const East = ["ATL", "BOS", "BKN", "CHA", "CHI", "CLE", "DET", "IND", "MIA", "MIL", "NYK", "ORL", "PHI", "TOR", "WAS"];
        const West = ["DAL", "DEN", "GSW", "HOU", "LAC", "LAL", "MEM", "MIN", "NOP", "OKC", "PHX", "POR", "SAC", "SAS", "UTH"];
        if (East.includes(team)) {
          return "East";
        }
        return "West";
      }

      function checkDiv(team) {
        const divisions = [
          ["SE", "ATL", "MIA", "ORL", "CHA", "WAS"],
          ["CEN", "CHI", "MIL", "IND", "DET", "CLE"],
          ["Atl.", "TOR", "NYK", "BKN", "PHI", "BOS"],
          ["SW", "HOU", "DAL", "NOP", "MEM", "SAS"],
          ["NW", "UTA", "MIN", "POR", "OKC", "DEN"],
          ["Pac", "GSW", "LAC", "LAL", "PHX", "SAC"]
        ];
        for (const division of divisions) {
          if (division.includes(team)) {
            return division[0];
          }
        }
      }

      function getHeight(height) {
        let h = `${height[0]}'${height[2]}`;
        if (height[3] !== undefined) {
          h += height[3] + "''";
        } else {
          h += "''";
        }
        return h;
      }

      function findAge(birthdate) {
        let year = "";
        let month = "";
        let day = "";
        let j = 0;
        const nums = "0123456789";
        for (let i = 0; i < birthdate.length; i++) {
          if (nums.includes(birthdate[i])) {
            j += 1;
            if (j <= 4) {
              year += birthdate[i];
            } else if (j <= 6) {
              month += birthdate[i];
            } else {
              day += birthdate[i];
            }
          }
        }
        const years = (2023 - parseInt(year));
        const months = parseInt(month);
        return months < 10 ? (years + 1) : years;
      }

      function range(p, correctPlayer) {
        if (p === correctPlayer) {
          return 0;
        }
        const diff = parseInt(correctPlayer.slice(2, -1)) - parseInt(p.slice(2, -1));
        if (Math.abs(diff) <= 2 && diff > 0) {
          return 1;
        }
        if (Math.abs(diff) <= 2 && diff < 0) {
          return 2;
        }
        if (parseInt(p.slice(2, -1)) >= 10 || parseInt(p.slice(2, -1)) <= 1) {
          const diffStart = parseInt(p.slice(0, 1)) - parseInt(correctPlayer.slice(0, 1));
          if (diffStart === 1 && parseInt(correctPlayer.slice(2, -1)) >= 10) {
            return 1;
          }
          if (diffStart === -1 && parseInt(p.slice(2, -1)) >= 10) {
            return 2;
          }
        }
        return 0;
      }

      function checkMatch(p, correctPlayer) {
        let currentLine = "";
        const parent = document.getElementById('gamewrapper');
        const numb = parent.childElementCount;
        const children = parent.children[numb - 1];
        if (numb > 1) {
          children.scrollIntoView();
        }
        const childrens = children.children;
        if (numb < 9) {
          for (let i = 0; i < p.length; i++) {
            if (p[i] === correctPlayer[i]) {
              childrens.item(i).style.backgroundColor = "#37be75";
              childrens.item(i).style.color = "white";
              currentLine += '🟩';
            } else {
              currentLine += '⬛';
            }
          }
        }
        if (numb === 8 && p[0] !== correctPlayer[0]) {
          input.disabled = true;
          for (let i = 0; i < p.length; i++) {
            childrens.item(i).style.backgroundColor = "#920000";
            childrens.item(i).style.color = "white";
            currentLine += '⬛';
          }
          coloredBoxed += currentLine;
          over(correctPlayer, 9);
        }
        currentLine += " ";
        coloredBoxed += currentLine;
        if (p[0] === correctPlayer[0]) {
          solved = true;
          input.disabled = true;
          input.placeholder = `You solved it in ${numb}!`;
          input.style.backgroundColor = "#f5f2ec";
          wins += 1;
          over(correctPlayer, numb);
        }
      }

      function timeLeft() {
        const o = new Date(2024, 6, 17);
        const ms = Date.now() - o.getTime();
        const day = ms / 1000 / 60 / 60 / 24;
        const now = new Date();
        let hoursleft = 23 - now.getHours();
        let minutesleft = 59 - now.getMinutes();
        let secondsleft = 59 - now.getSeconds();
        if (minutesleft < 10) minutesleft = "0" + minutesleft;
        if (secondsleft < 10) secondsleft = "0" + secondsleft;
        if (lastGame.lastPlayedIndex === Math.floor(day)) {
          time.innerHTML = `Next player in: ${hoursleft}:${minutesleft}:${secondsleft}`;
        } else {
          time.innerHTML = "Refresh for today's game!";
          userData.gamePlayed = false;
          const currentGame = {
            1: "none",
            2: "none",
            3: "none",
            4: "none",
            5: "none",
            6: "none",
            7: "none",
            8: "none"
          };
          localStorage.setItem("currentGame", JSON.stringify(currentGame));
        }
      }

      function over(p, numb) {
        // console.log("p:" + p)
        setInterval(timeLeft, 1000);
        lastGame.player = p[0];
        lastGame.numberOfGuesses = numb;
        const playerName = document.createElement("h2");
        const solves = document.createElement("h3");
        const statsButton = document.createElement("button");
        const share = document.createElement("button");
        sil_container.classList.add('shows');
        statsButton.innerHTML = "SHOW STATS";
        statsButton.classList.add("showStats");
        share.innerHTML = "SHARE";
        share.classList.add("share");
        statsButton.id = "showStat";
        playerName.innerHTML = p[0];
        if (lastGame.lastPlayedIndex !== Math.floor(dayOffset)) {
          userData.played += 1;
        }
        who.style.height = "700px";
        if (numb < 9) {
          whom.innerHTML = "NICE JOB!";
          solves.innerHTML = `You solved it in ${numb}!`;
          if (lastGame.lastPlayedIndex !== Math.floor(dayOffset)) {
            userData.wins += 1;
            userData.currentStreak += 1;
          }
        } else {
          whom.innerHTML = "GOOD TRY!";
          solves.innerHTML = "The correct answer is";
          if (lastGame.lastPlayedIndex !== Math.floor(dayOffset)) {
            userData.currentStreak = 0;
          }
          if (lastGame.lastPlayedIndex === Math.floor(dayOffset)) {
            const shareString = `${today}-X/8-${coloredBoxed}`;
            lastGame.shareString = shareString;
          }
        }
        lastGame.placeholder = solves.innerHTML;
        whom.style.fontSize = "20px";
        player.classList = "correct-modalinfo";
        showsil.innerHTML = "RESULT";
        img.style.filter = "brightness(1)";
        whom.appendChild(solves);
        whom.appendChild(playerName);
        whom.appendChild(share);
        whom.appendChild(statsButton);
        whom.appendChild(time);
        if (lastGame.lastPlayedIndex === Math.floor(dayOffset)) {
          var shareString = lastGame.shareString;
        } else if (numb < 9) {
          var shareString = `${today}-${numb}/8-${coloredBoxed}`;
          lastGame.shareString = shareString;
        }
        document.getElementById('showStat').addEventListener('click', () => {
          sil_container.classList.remove('shows');
          sil_container.setAttribute('closing', "");
          setTimeout(() => {
            modal_container_two.classList.add('show');
          }, 50);
        });
        share.addEventListener('click', () => {
          navigator.clipboard.writeText(shareString);
          share.innerHTML = "Copied!";
          setTimeout(() => {
            share.innerHTML = "SHARE";
          }, 2000);
        });
        played.innerHTML = userData.played;
        win.innerHTML = Math.round((userData.wins / userData.played) * 100);
        currentStreak.innerHTML = userData.currentStreak;
        if (userData.currentStreak > userData.maxStreak) {
          maxStreak.innerHTML = currentStreak.innerHTML;
          userData.maxStreak = userData.currentStreak;
        }
        if (numb < 9 && lastGame.lastPlayedIndex !== Math.floor(dayOffset)) {
          guesses[numb] += 1;
          for (let i = 0; i < Object.keys(guesses).length; i++) {
            const numBox = distribution.children.item(i);
            const bar = numBox.children.item(1).children.item(0);
            const nu = bar.children.item(0);
            nu.innerHTML = guesses[i + 1];
            if (guesses[i + 1] > guesses[userData.maxBar]) {
              userData.maxBar = i + 1;
            }
            const wid = guesses[userData.maxBar] === 0 ? 0 : guesses[i + 1] / guesses[userData.maxBar];
            if (wid > 0.08) {
              bar.style.width = (wid * 100) + "%";
            }
          }
        }
        lastGame.lastPlayedIndex = Math.floor(dayOffset);
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("guesses", JSON.stringify(guesses));
        localStorage.setItem("lastGame", JSON.stringify(lastGame));
      }

      function connect(value) {
        lastGame.currentGameIndex = Math.floor(dayOffset);
        localStorage.setItem("lastGame", JSON.stringify(lastGame));
        // lastGame = JSON.parse(localStorage.getItem("lastGame"));
        rowhead.classList.add('shows');
        const chosen = playerData.filter(p => p.DISPLAY_FIRST_LAST === String(value));
        // console.log(value)
        placeHolder();
        createTable(chosen);
      }
    });
  });
});
