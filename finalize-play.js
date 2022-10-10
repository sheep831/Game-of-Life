const unitLength = 20; //格仔length
let boxColor = "#921920";
const strokeColor = 189;
let columns; /* To be determined by window width */
let rows; /* To be determined by window height */
let currentBoard; //只save 0/1 有/冇
let nextBoard;
let mDown = true;
let buttonStartState = "Stop"; //Show current Status
let gameStart = false;
let result = 3;
let survivalMin = 2;
let survivalMax = 3;
let countOfTurn = 0;
let colorPicks = ["#921920"];
let countOfUserDraw = 0;
let generationCounter = 0;

//change of rule of survival
let minSur = document.querySelector("#minsur");
let maxSur = document.querySelector("#maxsur");
minSur.addEventListener("change", function () {
  if (minSur.value < maxSur.value) {
    survivalMin = parseInt(minSur.value);
  } else if (minSur.value === maxSur.value) {
    alert("Max and Min cannot be the same number");
    minSur.value = 2;
    maxSur.value = 3;
  } else {
    alert("Input a number smaller than Max");
    minSur.value = 2;
    maxSur.value = 3;
  }
});
maxSur.addEventListener("change", function () {
  if (maxSur.value > minSur.value) {
    survivalMax = parseInt(maxSur.value);
  } else if (minSur.value === maxSur.value) {
    alert("Max and Min cannot be the same number");
    minSur.value = 2;
    maxSur.value = 3;
  } else {
    alert("Input a number larger than Min");
    minSur.value = 2;
    maxSur.value = 3;
  }
});

let reproduction = document.querySelector("#reproduce"); //change rule of reproduction
reproduction.addEventListener("change", function () {
  result = reproduction.options[reproduction.selectedIndex].text;
});

let startButton = document.querySelector("#start");
startButton.addEventListener("click", function () {
  //按一下就轉state
  if (buttonStartState === "Start") {
    gameStart = false;
    mDown = true;
    startButton.innerText = "Status: Stop";
    buttonStartState = "Stop";
    noLoop();
  } else if (buttonStartState === "Stop") {
    startButton.innerText = "Status: Start";
    mDown = false;
    gameStart = true;
    buttonStartState = "Start";
    countOfTurn++;
  }
});

let speedBar = document.querySelector("#customRange1"); //change of speed
speedBar.addEventListener("change", function () {
  let changeOfSpeed = parseInt(speedBar.value);
  frameRate(changeOfSpeed);
});

let nextStep = document.getElementById("nextStep"); //button next-step
nextStep.addEventListener("click", function () {
  gameStart = false;
  generate();
});

//change of colors
document.querySelector("#boxSelect").addEventListener("change", function () {
  getBoxColor();
  boxColor = boxSelect;
  colorPicks.push(boxColor);
  countOfUserDraw++;
});

function getBoxColor() {
  let boxSelection = document.querySelector("#boxSelect").value;
  boxSelect = `${boxSelection}`;
}

function setup() {
  //set up initial value, preparation work
  const canvas = createCanvas(
    windowWidth * 0.6 - 200,
    (windowWidth * 0.6 - 200) / 1.618
  );
  canvas.parent(document.querySelector("#canvas")); //insert the canvas to the id#canvas div

  /*Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);

  /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  currentBoard = [];
  nextBoard = [];
  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
  }
  // Now both currentBoard and nextBoard are array of array of undefined values.
  init(); // Set the initial values of the currentBoard and nextBoard
}

function windowResized() {
  //枱布 will follow the window size
  resizeCanvas(windowWidth * 0.6 - 200, (windowWidth * 0.6 - 200) / 1.618);
}

function countLife() {   //counting lives.
  let count = 0;
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (currentBoard[i][j]["life"] == 1) count++;
    }
  }
  if (countOfTurn < 1) {
    return (
      (document.querySelector("#original").innerText = count),
      (document.querySelector("#remaining").innerText = count)
    )
  } else {
    return (document.querySelector("#remaining").innerText = count)
  }
}

function draw() {
  //run once per frame
  background(250, 235, 215); //枱布
  if (gameStart) {
    generate();
  }
  countLife();

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      // for (const colorPick of colorPicks) {
      if (currentBoard[i][j]["life"] == 1) {
        //has life
        fill(colorPicks[countOfUserDraw]);
      } else {
        //no life
        fill(255);
      }
      stroke(strokeColor);
      rect(i * unitLength, j * unitLength, unitLength, unitLength, 20); //rectangle
      //rectangle pointer on middle
      if (mDown)
        drawRect(
          mouseX - unitLength / 2,
          mouseY - unitLength / 2,
          unitLength,
          unitLength,
          boxColor,
          true
        );
    }
  }
}
// }

function drawRect(x, y, width, height, hexColor, hasStroke) {
  let c = color(hexColor);
  fill(c);
  if (hasStroke) {
    strokeWeight(2);
    stroke(100, 200, 100);
  } else {
    noStroke();
  }
  rect(x, y, width, height, 20);
}

function generate() {
  //生仔
  //Loop over every single box on the board
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      let neighbors = 0;
      for (let i of [-1, 0, 1]) {
        // loop all living members in the Moore neighborhood(8 boxes surrounding)
        for (let j of [-1, 0, 1]) {
          if (i == 0 && j == 0) {
            // the cell itself is not its own neighbor
            continue;
          }
          // The modulo operator is crucial for wrapping on the edge, solve out of bound
          neighbors +=
            currentBoard[(x + i + columns) % columns][(y + j + rows) % rows][
              "life"
            ];
        }
      }
      // Rules of Life
      if (currentBoard[x][y]["life"] == 1 && neighbors < survivalMin) {
        // Die of Loneliness
        nextBoard[x][y]["life"] = 0;
        nextBoard[x][y]["gen"] = 0;
        
      } else if (currentBoard[x][y]["life"] == 1 && neighbors > survivalMax) {
        // Die of Overpopulation
        nextBoard[x][y]["life"] = 0;
        nextBoard[x][y]["gen"] = 0;
        
      } else if (currentBoard[x][y]["life"] == 0 && neighbors == result) {
        // New life due to Reproduction
        nextBoard[x][y]["life"] = 1;
        nextBoard[x][y]["gen"] = 1;
        
      } else {
        // Stasis neigbors 2-3
        nextBoard[x][y]["life"] = currentBoard[x][y]["life"];
        nextBoard[x][y]["gen"] = currentBoard[x][y]["gen"];
        nextBoard[x][y]["gen"] += 1;
        
      }
    }
  }
  // ***Swap the nextBoard to be the current Board
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
  generationCounter++;
  document.querySelector("#generation").innerText = generationCounter
}

function mouseDragged() {
  /**
   * If the mouse coordinate is outside the board
   */
  const x = Math.floor(mouseX / unitLength);
  const y = Math.floor(mouseY / unitLength);

  if (x < 0 || y < 0 || x >= columns || y >= rows) {
    return;
  }
  currentBoard[x][y]["life"] = 1;
  fill(boxColor);
  stroke(strokeColor);
  rect(x * unitLength, y * unitLength, unitLength, unitLength, 20);
}

function mousePressed() {
  //如果仲玩緊，再press就會留咗畫
  noLoop(); //停止draw
  mouseDragged(); //畫嘢
}

function mouseReleased() {
  loop();
}

//Buttons---------------------------------

function init() {
  //clear the board
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      currentBoard[i][j] = { life: 0, gen: 0};
      nextBoard[i][j] = { life: 0, gen: 0};
    }
  }
}

function rand() {
  //random board
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      currentBoard[i][j]["life"] = Math.random() > 0.8 ? 1 : 0;
      nextBoard[i][j]["life"] = 1;
    }
  }
}

let resetGame = document.querySelector("#reset-game");
resetGame.addEventListener("click", function () {
  init();
  startButton.innerText = "Status: Stop";
  buttonStartState = "Stop";
  gameStart = false;
  mDown = true;
  document.querySelector("#remaining").innerText = 0
  document.querySelector("#original").innerText = 0
  document.querySelector("#generation").innerText = 0
  generationCounter = 0;
  countOfTurn = 0;
  survivalMax = 3;
  survivalMin = 2;
  result = 3;
  document.querySelector('#reproduce').value = 3;
  minSur.value = 2;
  maxSur.value = 3;

});

//random initial
let random = document.querySelector("#random");
random.addEventListener("click", function () {
  rand();
  startButton.innerText = "Status: Stop";
  buttonStartState = "Stop";
  gameStart = false;
  mDown = true;
});

//pop-up rules
document.querySelector("#rules").addEventListener("click", function () {
  document.querySelector(".modal").classList.add("show");
});

document.querySelector(".modal").addEventListener("click", function () {
  document.querySelector(".modal").classList.remove("show");
});

document.querySelector(".rules").addEventListener("click", function (event) {
  event.stopPropagation();
});
