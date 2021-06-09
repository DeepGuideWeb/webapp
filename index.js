

//The 4 screens
var start = document.querySelector('#start');
var startRedirect = document.querySelector('#start-redirect');
var mid = document.querySelector('#mid');
var end = document.querySelector('#end');

const debug = false;

//Start Screen
var startBt = document.querySelector('#start-redirect-button');

var playBt =document.querySelector('#play-button');
var retryBt = document.querySelector('#retry-button');

var statsH3 = document.querySelector('#stats-h3');

//chart
var chart = document.querySelector('.chart-js').getContext('2d');

var global = document.querySelector('.global-stats');

//Main Screen ---> Game


//End Screen ---> Main Screen
playBt.addEventListener('click', () => {
	swapFocus4(start);
});

retryBt.addEventListener('click', () => {
	startBt.value = soundPack;
	swapFocus4(startRedirect);
});

function scroll2global(){
	global.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
}

global.addEventListener('click', () => {
	scroll2global()
});

if (Object.keys(soundPackSet).length < 2) playBt.style.display = 'none';

//Start at top of page
scroll(0,0);

//making other elements non opaque/non displaying
var active = start;
var id;
active.style.opacity = 1;
active.style.display = 'block';

startRedirect.style.opacity = 0;
mid.style.opacity = 0;
end.style.opacity = 0;

startRedirect.style.display = 'none';
mid.style.display = 'none';
end.style.display = 'none';

Object.entries(soundPackSet).forEach(p => {
	let c = document.createElement('button');
	c.innerHTML = p[1];
	c.classList.add('normal-button');
	c.classList.add('play-button');
	c.value = p[0];
	start.appendChild(c);
});

document.querySelectorAll('.play-button').forEach(pb => {
	pb.addEventListener('click', () => {
		popIn3(pb.value);
		console.log('What: ' + pb.value);
	})
});

//pop in start menu first
//swapFocus4(start);

//assumes all elements start with opacity: 0; & display: 'none';
//Transition from one element to the other by hiding the currently active one and fading-in the next
function swapFocus4(element){
	clearInterval(id);
	let ac = active;
	active = element;
	ac.style.opacity = 0;
	ac.style.display = 'none';
	element.style.display = 'block';	
	id = setInterval(() => {
		element.style.opacity = Number(element.style.opacity) + 0.05;
		if (element.style.opacity >= 1) {
			clearInterval(id);
		}
	}, 5);
}

//Game Itself

var soundPack;
var info = {
	distance: -1,
	radius: -1,
	axis: '',
	soundName: '',
	hrtf: ''
}

var hearts = 3;
var maxRounds = 30;
var state = 'start'

var gameRound = 1;
var trueRound = 1;

var buttons = document.querySelectorAll('.sound-button');
var heart = document.querySelectorAll('.heart');

//Text elements that display rounds
var rounds = document.querySelectorAll('.round');
var audios = []

var soundPackRoot = 'soundPacks/'

rightSound = new Audio('sounds/right.wav');
rightSound.volume = settings.volume;

wrongSound = new Audio('sounds/wrong.wav');
wrongSound.volume = settings.volume;

var myChart;

//Assigns a value to each button 0-8
buttons.forEach(e => {
	e.addEventListener('click', () => {
		action(Number(e.value));
	});
})

var playing = 0;
function play(i){
	audios[playing].pause();
	audios[playing].currentTime = 0;
	playing = i;
	audios[playing].play();
}

function stop(){
	audios[playing].pause();
	audios[playing].currentTime = 0;
}

//Starts the game and resets all game elements
function init(packName){
	console.log(packName);
	hearts = 3;
	gameRound = 1;
	trueRound = 1;
	gameState = 'midGame';
	audios = [];
	soundPack = packName;
	retryBt.value = packName;

	for(let i = 0; i < 9; i++){
		let path = soundPackRoot + packName + '/' + i + '.wav'
		audios.push(new Audio(path))
		audios[i].loop = true;
		audios[i].volume = settings.volume;
	}

	for(let i = 0; i < 3; i++){
		heart[i].innerHTML = '<i class="bi bi-suit-heart-fill">';
	}

	//✓set info from folder name
	//  reg = distance_radius_axis_sound_hrtf
	let reg = /(\d+)_(\d+)_(\w{2})_([a-z0-9A-Z]+)_(.+)/;
	let cap = packName.match(reg);
	info.distance = Number(cap[1]);
	info.radius = Number(cap[2]);
	info.axis = cap[3];
	info.soundName = cap[4];
	info.hrtf = cap[5];

	rounds[0].innerHTML = 'Round 1';

	//set graph
	//fix second graph not apearing
	var tfix = true; //not showing second graph for now cuz only one game mode
	if (!debug && !tfix) {
		try{
			myChart.destroy();
			getMetrics(soundPack, parseMetrics);
		}
		catch(e){
			console.log(e);
		}
		
	}

	play(Math.floor(Math.random() * 9));

	startTime();
}

var globalRef = '<a href="javascript:void(0)" onclick="javascript:scroll2global()" style="color: var(--mainColor);">global stats</a>';

//Gets called on button press
function action(btn){
	if (gameState != 'midGame') return null;
	if (trueRound == 1) stats[soundPack].totalGames++;
	//✓check if button was right
	let b = btn;
	let p = playing;

	correctX = b%3 === p%3;
	correctY = Math.floor(b/3) === Math.floor(p/3);

	//✓record data
	record(btn, correctX, correctY);


	//right button
	if (correctX && correctY){
		gameRound++;
		trueRound++;
		play(Math.floor(Math.random() * 9));
		rightButtonAnim(btn);
		if (gameRound >= maxRounds) {
			endGame();
			statsH3.innerHTML = `Nice work! ${heartsMessage()} <br> Play again or check your score against the ${globalRef}, or see your personal stats <a href="stats.html?mode=${soundPack}" style="color: var(--mainColor);">here</a>.`;
		}
	}
	else {
		hearts--;
		removeHeart(hearts);
		wrongButtonAnim(btn);
		//no hearts left
		if (hearts <= 0) {
			endGame();	
		}
		else {
			trueRound++;
		}
	}

	//update the round h1 texts
	rounds.forEach(e => {
		e.innerHTML = 'Round ' + gameRound;
	})
}

//Does all the things when the game ends.
function endGame(){
	gameState = 'finished';
	stop();
	incMetric(soundPack, gameRound);
	if (stats[soundPack].bestRound < gameRound) stats[soundPack].bestRound = gameRound;
	saveStats();
	pushProgress(stats.id, soundPack, gameRound);
	statsH3.innerHTML = `Nice work! Play again or check your score against the ${globalRef}, or see your personal stats <a href="stats.html?mode=${soundPack}" style="color: var(--mainColor);">here</a>.`;
	setTimeout(() => {
		swapFocus4(end);
	}, 300);
}

function heartsMessage(){
	switch (hearts) {
		case 3:
			return 'You made it to the end with all 3 hearts left!'
			break;
		case 2:
			return 'You made it to the end with 2 hearts left!'
			break;
		case 1:
			return 'You made it to the end with your last heart!'
			break;
	
		default:
			return 'I have no clue how you made it here!'
			break;
	}
}

//Get's called on correct button presses
function rightButtonAnim(b){
	rightSound.play();
	rightSound.currentTime = 0;
}

//Get's called on wrong button presses
function wrongButtonAnim(b){
	wrongSound.play();
	let button = buttons[b];
	let i = 0;
	let id = setInterval(() => {
		i += Math.PI / 2;
		position = Math.sin(i) * 2 + 2;
		button.style.transform = `translate(0px, ${position}px)`;
		if (i > 2*Math.PI) {
			button.style.transform = '';
			clearInterval(id);
		}
	}, 3)
	wrongSound.currentTime = 0;
}

//Changes hearts to empty visually and shakes them
function removeHeart(h){
	heart[h].innerHTML = '<i class="bi bi-suit-heart">';
	let i = 0;
	let id = setInterval(() => {
		i += Math.PI / 4;
		position = Math.sin(i) * 2;
		heart[h].style.transform = `translate(${position}px, 0px)`;
		if (i > 4*Math.PI) clearInterval(id);
	}, 1)
}

//Records and sends stats, updates stats like total rounds,
function record(btn, correctX, correctY){

	let e = timeElapsed();
	// add ✓button clicked, ✓sound location, ✓rest of info from pack
	stats[soundPack].totalRounds++;

	if (correctX) stats[soundPack].totalCorrectX++;
	if (correctY) stats[soundPack].totalCorrectY++;
	if (correctX && correctY) stats[soundPack].totalCorrects++;

	let record = {
		name: stats.id,
		packName: soundPack,
		distance: info.distance,
		radius: info.radius,
		axis: info.axis,
		soundName: info.soundName,
		hrtf: info.hrtf,

		deviceType: settings.deviceType,
		deviceName: settings.deviceName,

		trueRound: trueRound,
		gameRound: gameRound,
		gameNumber: stats[soundPack].totalGames,

		buttonPressed: btn,
		soundPlaying: playing,

		correctX: correctX,
		correctY: correctY,
		correct: correctX && correctY,

		totalRounds: stats[soundPack].totalRounds,
		totalCorrectX: stats[soundPack].totalCorrectX,
		totalCorrectY: stats[soundPack].totalCorrectY,
		totalCorrects: stats[soundPack].totalCorrects, 

		elapsed: e
	}

	saveStats();

	pushBoth(stats.id, stats[soundPack].totalGames, stats[soundPack].totalRounds, record);
}

//For measuring time between rounds
var tstart;
var cur;
function startTime(){
	tstart = new Date();
}

function timeElapsed(){
	cur = new Date();
	let elapsed = cur - tstart;
	tstart = cur;
	return elapsed / 1000;
}

//Draw graph, get's called by getMetric
function parseMetrics(obj) {
	let arr = []
	for(let i = 1; i < 32; i++){
		let o = obj[i];
		arr.push((o != undefined) ? o : 0)
		
	}
	//arr = arr.slice(1,31);
	var max = arr.reduce((a,b) => {
		return Math.max(a,b);
	})
	var sum = arr.reduce((a,b) => {
		return a + b;
	})

    var lab = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
	


	const labels = lab;
	const data = {
		labels: labels,
		datasets: [{
			backgroundColor: '#9B50E2',
			borderColor: '#A25BE4',
			label: 'Rounds',
			data: arr,
			tension: 0.3,
			pointRadius: 4,
			hitRadius: 50,
		}]
	};
	
	const config = {
		type: 'line',
		data,
		options: {
			animation:false,
			layout: {
				padding: 25,
			},
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					enabled: true,
					callbacks: {
						label: function(context) {
							var label = '';
	
							
							if (context.parsed.y !== null) {
								label += (Number(context.parsed.y)*100/sum).toFixed(1) + '%' ;
							}
							return label;
						},
						title: function() {},
					},
					displayColors: false,
					padding: 5,
				}
			},
			scales: {
				y: {
					display: false,
					min: -1,
					font: {
						size: 20,
					},
					ticks: {
						backdropPadding: {
							x: 10,
							y: 4
						}
					}
				},
				x: {
					display: true,
					text: 'hallo',
					step: 1,
					ticks: {
						autoSkip: false,
						maxRotation: 0,
                    	minRotation: 0,
						backdropPadding: {
							x: 10,
							y: 4
						},
						min: 0,
					},
				},
			}
	   }
	};

	myChart = new Chart(
		chart,
		config
	);
}

//Gets the values and calls parseMetrics on them
if (debug){
	var testArr = [0,88,60,30,12,3,4,6,7,4,2,14,28,14,45,23,13,8,7,6,10];
	parseMetrics(testArr);
} 
else {
	getMetrics('all', parseMetrics);
}

//Makes an html element fade-in
function popIn(element){
	element.style.opacity = 0;
	element.style.display = 'block';
	let outID = setInterval(() => {
		element.style.opacity = Number(element.style.opacity) + 0.03;
		if (element.style.opacity >= 1) {
			clearInterval(outID);
		}
	}, 5);
}

//Grabs and sets up the pop up assets, including buttons
function popIn2(pack){
	let out = document.querySelector('.outer-pop');//dark background
	let popBs = document.querySelectorAll('.smol-button');
	popBs.forEach(b => {
		b.addEventListener('click', () => {
			settings.deviceType = b.value;
			saveSettings();
			out.style.display = 'none';
			swapFocus4(mid);
			init(pack);
		})
	})

	popIn(out);
}

//Checks wether or not to call popIn2()
function popIn3(pack){
	if (settings.deviceType == 'default'){
		popIn2(pack);
	}
	else {
		swapFocus4(mid);
		init(pack);
	}
}

//Start game if url bar has ?mode='packname'
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const mode = urlParams.get('mode');
if (mode != null) {
	if (soundPackSet[mode] != undefined || soundPackSet[mode] != null) {
		active.style.opacity = 0;
		active.style.display = 'none';
		
		startRedirect.style.display = 'none';

		active = startRedirect;
		active.style.opacity = 1;
		active.style.display = 'block';

		document.querySelector('#redirect-h3').innerHTML = `${soundPackSet[mode]} Mode`;

		startBt.value = mode;
	}
}