var buttons = document.querySelectorAll('.kekers');

var audios = [];
var soundPackRoot = 'soundPacks/';
var packName = '2_8_DU_phone3shorter_irc_1037';

for(let i = 0; i < 9; i++){
	let path = soundPackRoot + packName + '/' + i + '.wav'
	audios.push(new Audio(path))
	audios[i].volume = settings.volume;
	buttons[i].addEventListener('click', () => {
		play(i);
	});
}


var playing = 0;
function play(i){
	stop();
	playing = i;
	audios[playing].play();
}

function stop(){
	audios[playing].pause();
	audios[playing].currentTime = 0;
}

//make thing to swap between tut mode