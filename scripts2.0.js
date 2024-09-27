function highlightTeam(event) {
    if (event.target.innerText.length === 0) {
        return;
    }

    const matchDiv = event.target.closest('.match');

    const teams = [];

    matchDiv.querySelectorAll('.team').forEach(teamElement => {
        teams.push(teamElement);
    })

    let matchSelected = false;
    for (const team of teams) {
        if (team.classList.contains('highlighted')) {
            matchSelected = true;
            break;
        }
    }
    
    if (event.target.classList.contains('highlighted')) {
        event.target.classList.remove('highlighted');
        clearNextRounds(event.target, matchDiv);
    } else if (matchSelected) {
        for (const team of teams) {
            if (team.innerText != event.target.innerText) {
                team.classList.remove('highlighted');
                clearNextRounds(team, matchDiv);
                break;
            }
        }
        event.target.classList.add('highlighted');
        advanceTeam(event.target);
    } else {
        event.target.classList.add('highlighted');
        advanceTeam(event.target);
    }
}

function clearNextRounds(target, matchDiv) {
    const roundNum = parseInt(matchDiv.parentElement.className.slice(-1));
    const targetName = target.innerText;

    for (let i = roundNum+1 ; i <= 7 ; i++) {
        document.querySelectorAll(`.round${i}`).forEach(round => {
            round.querySelectorAll('.team').forEach(team => {
                if (team.innerText === targetName) {
                    team.innerText = "";
                    team.classList.remove('highlighted');
                }
            })
        })
    }
    saveState();
}

document.querySelectorAll('.team').forEach(team => {
    team.addEventListener('click', highlightTeam);
});

function advanceTeam(target) {
    const teamElement = target;
    const matchDiv = teamElement.closest('.match');
    const roundNum = parseInt(matchDiv.parentElement.className.slice(-1));

    const nextTeamID = target.closest('.match').getAttribute('data-match-id');
    const nextTeam = document.querySelector(`.round${roundNum+1} .team[data-team-id="${nextTeamID}"]`);
    
    if (nextTeam) {
        nextTeam.textContent = target.innerText;
    } else {
        console.error('next match not found');
    }
    saveState();
}

function populateRound4() {
    const round3Teams = getRound3Teams();
    const round4Teams = [];

    for (const team of round3Teams) {
        if (team.classList.includes('highlighted')){
            round4Teams.push(team);
        }
    }
    console.log(round4Teams)
    
    for (let i = 0 ; i < round4Teams.length ; i++){
        const {teamName, matchID, teamID} = round4Teams[i];
        const nextMatchID = Math.ceil(matchID/2);
        const nextTeamID = Math.ceil(teamID/2);
        console.log(teamName, matchID, nextMatchID)
        const round4TeamSlot = document.querySelector(`.round4 .match[data-match-id="${nextMatchID}"] .team[data-team-id="${nextTeamID}"]`);

        if (round4TeamSlot) {
            round4TeamSlot.textContent = teamName;
        } else {
            console.error('no match for teamID')
        }
    }
}

window.onload = function() {
    if (window.location.pathname === '/nextRounds.html') {
        populateRound4();
    }
}
function resetBracket() {
    localStorage.clear();
    window.location.reload();  
}

function saveState() {
    const rounds = JSON.parse(localStorage.getItem('tournamentState')) || {};

    // Loop through all rounds and store the teams' data
    document.querySelectorAll('[class^="round"]').forEach(roundDiv => {
        const roundNum = roundDiv.className.match(/round(\d+)/)[1];
        rounds[roundNum] = [];

        roundDiv.querySelectorAll('.team').forEach(team => {
            const teamID = team.getAttribute('data-team-id');
            const teamName = team.textContent;
            const classList = Array.from(team.classList);
            const matchID = team.closest('.match').getAttribute('data-match-id');
            rounds[roundNum].push({ roundNum, teamID, teamName, classList, matchID});
        });
    });

    // Save to localStorage
    localStorage.setItem('tournamentState', JSON.stringify(rounds));
}

function loadState() {
    const savedState = localStorage.getItem('tournamentState');
    if (savedState) {
        const rounds = JSON.parse(savedState);

        for (const roundNum in rounds) {
            rounds[roundNum].forEach(teamData => {
                const { roundNum, teamID, teamName, classList, matchID } = teamData;
                const teamElement = document.querySelector(`.round${roundNum} .team[data-team-id="${teamID}"]`);
                if (teamElement) {
                    teamElement.textContent = teamName;
                    teamElement.className = 'team';
                    classList.forEach(cls => teamElement.classList.add(cls));
                }
            });
        }
    }
}

// Load the state when the page loads
document.addEventListener('DOMContentLoaded', loadState);

function printLocalStorage() {
    console.log('LocalStorage Contents:');
    
    // Loop through all keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        
        // Print each key-value pair
        console.log(`${key}: ${value}`);
    }
}

function getRound3Teams() {
    const storedData = localStorage.getItem('tournamentState');
    if (storedData) {
        try {
            const parsedData = JSON.parse(storedData);
            const round3Teams = parsedData[3] || [];
            return round3Teams;
        } catch (error) {
            console.error('error parsing', error.message);
            console.error('invalid data:', storedData)
        }
    } else {
        console.log('no data')
    }  
    return [];
}
