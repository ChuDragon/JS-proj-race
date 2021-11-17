// The {store} object will hold the information needed globally
let store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
  tracks: undefined,
  racers: undefined,
  race: undefined,
};
const shipNames = [
  "X-Wing Fighter",
  "Millenium Falcon",
  "Empire Flatwing",
  "InterStar Cruiser",
  "Galactic Cruiser",
];
// We need our code to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  onPageLoad();
  setupClickHandlers();
});

// Async function gets tracks and racers from the server, renders them on DOM
async function onPageLoad() {
  try {
    getTracks().then((tracks) => {
      const html = renderTrackCards(tracks);
      renderAt("#tracks", html);
      store = Object.assign(store, { tracks }); // added
    });

    getRacers().then((racers) => {
      store = Object.assign(store, { racers });
      for (let i = 0; i < 5; i++) {
        store.racers[i].driver_name = shipNames[i];
      }
      const html = renderRacerCars(racers);
      renderAt("#racers", html);
    });
  } catch (error) {
    console.log("Problem getting tracks and racers ::", error.message);
    console.error(error);
  }
}

function setupClickHandlers() {
  document.addEventListener(
    "click",
    function (event) {
      const { target } = event;
      // Race track form field
      if (target.matches(".card.track")) {
        handleSelectTrack(target);
      }
      // Podracer form field
      if (target.matches(".card.podracer")) {
        handleSelectPodRacer(target);
      }
      // Button create race
      if (target.matches("#submit-create-race")) {
        event.preventDefault();
        if (store.track_id >= 0 && store.player_id >= 0) {
          // start race
          handleCreateRace();
        } else {
          alert("Please select a track and racer");
        }
      }
      // Handle acceleration click
      if (target.matches("#gas-peddle")) {
        handleAccelerate(target);
      }
    },
    false
  );
}

// This async function controls the flow of the race
async function handleCreateRace() {
  // Destructure player_id, track_id, tracks from {store}
  const { player_id, track_id, tracks } = store;
  // render starting UI
  renderAt("#race", renderRaceStartView(store.tracks[track_id - 1]));
  // Invoke the API call to create the race, then save the result
  createRace(player_id, track_id)
    .then((race) => {
      // TODO - update the store with the race id
      store = Object.assign(store, { race });
      store.race_id = store.race.ID;
    })
    .catch((error) => {
      console.log("Problem creating race ::", error.message);
    });

  // The race has been created, now run Countdown
  await runCountdown();
  // TODO - call the async function startRace
  try {
    if (!store.race_id) {
      throw new Error("race_id is undefined");
    }
    await startRace(store.race_id - 1); //returns nothing;
    //need (race_id - 1) because race ID is 0-based on server
    await getRace(store.race_id - 1).then((race) => {
      store = Object.assign(store, { race });
    });
    // Calling the async function runRace
    runRace();
    // error handling
  } catch (err) {
    console.log("Error starting or running the race:: " + err);
  }
}

async function runRace() {
  try {
    return new Promise((resolve) => {
      // runRace2 is the function to pass into JS built-in setInterval() method
      const runRace2 = async () => {
        await getRace(store.race_id - 1)
          .then((race) => (store = Object.assign(store, { race })))
          .catch((err) => console.log("In runRace2/getRace: " + err));
        // If race.status is "in-progress", update the leaderboard:
        if (store.race.status == "in-progress") {
          renderAt("#leaderBoard", raceProgress(store.race.positions));
        }
        // If race.status is "finished", finish the race:
        if (store.race.status == "finished") {
          renderAt("#race", resultsView(store.race.positions)); // render the results view
          clearInterval(raceInterval); // stop the interval from repeating
          resolve(); // resolve the promise
        }
      };
      // using setInterval to get race info every 500ms
      const raceInterval = setInterval(runRace2, 500);
    });
    // error handling for the Promise
  } catch (error) {
    console.log("Problem in runRace:: " + error);
  }
}

async function runCountdown() {
  try {
    let timer = 3;
    return new Promise((resolve) => {
      //function to pass to setInterval()
      const renderCount = () => {
        // run this DOM manipulation to decrement the countdown for the user
        document.getElementById("big-numbers").innerHTML = --timer;
        // if the countdown is done, clear the interval and resolve the promise
        if (timer == 0) {
          clearInterval(intervalID);
          resolve();
        }
      };
      // Using setInterval() method to count down once per second
      const intervalID = setInterval(renderCount, 1000);
    });
    // error handling for the Promise
  } catch (error) {
    console.log("Problem in runCountdown:: " + error);
  }
}

function handleSelectPodRacer(target) {
  console.log("selected a pod", target.id);
  // Remove class selected from all racer options
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }
  // Add class selected to current target
  target.classList.add("selected");
  // Save the selected racer to the store
  store.player_id = document.querySelector(".card.podracer.selected").id;
}

function handleSelectTrack(target) {
  console.log("selected a track", target.id);
  // Remove class selected from all track options
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }
  // Add class selected to current target
  target.classList.add("selected");
  // Save the selected track id to the store
  store.track_id = document.querySelector(".card.track.selected").id;
}

function handleAccelerate() {
  console.log("accelerate button clicked");
  // Invoke the API call to accelerate
  accelerate(store.race_id - 1);
}

// HTML VIEWS ------------------------------------------------

function renderRacerCars(racers) {
  if (!racers.length) {
    return `<h4>Loading Racers...</4>`;
  }
  const results = racers.map(renderRacerCard).join("");
  return `<ul id="racers">
  <li>
    <h3>Racer: </h3>
    <p>Top speed: </p>
    <p>Acceleration: </p>
    <p>Handling: </p>
  </li>
  ${results}</ul>`;
}

function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;
  return `
		<li class="card podracer" id="${id}">
			<h4 class="card podracer" id="${id}">${driver_name}</h4>
			<p class="card podracer" id="${id}">${top_speed}</p>
			<p class="card podracer" id="${id}">${acceleration}</p>
			<p class="card podracer" id="${id}">${handling}</p>
      <img src="../assets/images/ship-${id}.jpg" width="100%"/>
		</li>
	`;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `<h4>Loading Tracks...</4>`;
  }
  const results = tracks.map(renderTrackCard).join("");
  return `<ul id="tracks">${results}</ul>`;
}

function renderTrackCard(track) {
  const { id, name } = track;
  return `<li id="${id}" class="card track">
			<h3 id="${id}" class="card track">${name}</h3>
      <img src="../assets/images/track-${id}.jpg" width="100%"/></li>`;
}

function renderCountdown(count) {
  return `<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>`;
}

function renderRaceStartView(track) {
  return `
		<header>
      <img src="../assets/images/track-${track.id}-large.jpg" width="100%" />
		</header>
    <body>
    	<h2>Race: ${track.name}</h2>

		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
    </body>
		<footer></footer>
	`;
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header>
      <img src="../assets/images/race-background.jpg" width="100%" />
		</header>
		<main>
    	<h2>Race Results</h2>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
  for (let i = 0; i < positions.length; i++) {
    positions[i].driver_name = shipNames[i];
  }

  const userPlayer = positions.find((e) => e.id == store.player_id);
  userPlayer.driver_name += " (you)";

  positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  let count = 1;

  const results = positions.map((p) => {
    return `
			<tr>
				<td>
					<p>${count++} - ${p.driver_name}</p>
          <img src="../assets/images/ship-${
            p.id
          }.jpg" width=160px height=120px/>
				</td>
			</tr>
		`;
  });

  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results.join("")}
			</section>
		</main>
	`;
}

function renderAt(element, html) {
  const node = document.querySelector(element);
  node.innerHTML = html;
}

// API CALLS ------------------------------------------------

const SERVER = "http://localhost:8000";

function defaultFetchOpts() {
  return {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SERVER,
    },
  };
}

function getTracks() {
  // GET request to `${SERVER}/api/tracks`
  return fetch(`${SERVER}/api/tracks`, {
    method: "GET",
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) => console.log("Problem with getTracks request::", err));
}

function getRacers() {
  // GET request to `${SERVER}/api/cars`
  return fetch(`${SERVER}/api/cars`, {
    method: "GET",
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) => console.log("Problem with getRacers request::", err));
}

function createRace(player_id, track_id) {
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };

  return fetch(`${SERVER}/api/races`, {
    method: "POST",
    ...defaultFetchOpts(),
    dataType: "jsonp",
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .catch((err) => console.log("Problem with createRace request::", err));
}

function getRace(id) {
  // GET request to `${SERVER}/api/races/${id}`
  return fetch(`${SERVER}/api/races/${id}`, {
    method: "GET",
    ...defaultFetchOpts(),
  })
    .then((res) => res.json())
    .catch((err) => console.log("Problem with getRace request::", err));
}

function startRace(id) {
  // POST request to `${SERVER}/api/races/${id}/start`
  // returns nothing
  return fetch(`${SERVER}/api/races/${id}/start`, {
    method: "POST",
    ...defaultFetchOpts(),
  }).catch((err) => console.log("Problem with startRace request::", err));
}

function accelerate(id) {
  // POST request to `${SERVER}/api/races/${id}/accelerate`
  // returns nothing
  return fetch(`${SERVER}/api/races/${id}/accelerate`, {
    method: "POST",
    ...defaultFetchOpts(),
  }).catch((err) => console.log("Problem with accelerate request::", err));
}
