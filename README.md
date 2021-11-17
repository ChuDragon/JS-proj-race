# Course: Intermediate JavaScript
### Part 4. Asynchronous Programming with JavaScript
### Project 3. UdaciRacer Simulator

## Student Developer: Roman Chuyan
The focus of this project was practicing asynchronous JS code: promises, async/await, setInterval, callbacks, as well as exception handling.
I use mostly ES6 syntax, and try to adhere to best practices on variable declaration and comments. 
This is a learning project (not meant for production), focusing on mastering the concepts rather than perfecting the app.
See Concepts Practiced below. Finally, I plan to leave the code as-is at this stage of my progress as a developer.

## Functionality
This is a game that races 'spaceships.' You, the user, select a racer spaceship and 'track' planetary system. The game begins and you accelerate your ship by clicking the acceleration button. As you accelerate so do the other players and the leaderboard live-updates as players change position on the track. The final view is a results page displaying the players' rankings.

The game has three main views:
1. The form to create a race
2. The race progress view: the live-updating leaderboard and acceleration button
3. The race results view

## Starter Code
#### Udacity supplied us with the following:
1. An API in the form of a binary held in the /bin folder. My work was 100% in the front end.
2. I added all images and updated some syling in HTML and CSS. However, the focus of this course section was not UI development or styling, so Udacity provided pieces of UI in HTML, and I just had to call them in JS code at the right times. 

## Setup/Dependencies
Dependencies are setup in the /node_modules folder. To run the up, you need to perform both of these steps:

### 1. Start the Server
To run the server, run the command for your OS in your terminal at the root of the project.

| Your OS               | Command to start the API                                  |
| --------------------- | --------------------------------------------------------- |
| Mac                   | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server-osx`   |
| Windows               | `ORIGIN_ALLOWED=http://localhost:3000 ./bin/server.exe`   |

#### WINDOWS USERS -- Setting Environment Variables
If you are using a windows machine:
1. `cd` into the root of the project containing data.json 
2. Run the following command to add the environment variable:
```set DATA_FILE=./data.json```

### 2. Start the Frontend
In another terminal tab, run `npm start` or `yarn start` (npm or yarn must be installed) at the root of this project. Then you should then be able to access the app in http://localhost:3000.

## Concepts Practiced

### Callbacks 
Callback functions were used within the front end logic for rendering UI elements.

### Promises
Promises was the primary method for dealing with API responses. I chained .then/.catch clauses on promises, and created new promises to handle async logic.

### Async Await
Async/await was used in game processes, to wait for those asynchronous calls the output of which was required for subsequent logic. 

### Exception Handling 
I added error handling logic in the form of try/catch or.catch to all async functions.