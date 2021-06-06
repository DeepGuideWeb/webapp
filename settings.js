document.addEventListener("DOMContentLoaded", function(event) {
	//console.log('loaded');
  });

window.onbeforeunload = function (e) {
	settings.volume = document.querySelector('#volume').value;
	settings.deviceType = document.querySelector('.btn-radio.active').firstElementChild.value
	settings.deviceName = document.querySelector('#devicename').value;
	saveSettings();
};

//Setting up page from local storage

//set volume
document.querySelector('#volume').value = settings.volume;

/* //set device type
if (settings.deviceType == 'earbuds') {
	document.querySelector('#option1').click();
}
else document.querySelector('#option2').click();
 */

//set device type
switch (settings.deviceType) {
	case 'earbuds':
		document.querySelector('#option1').click();
		break;
	case 'headphones':
		document.querySelector('#option2').click();
		break;
	case 'other':
		document.querySelector('#option3').click();
		break;
}

//set device name
document.querySelector('#devicename').value = settings.deviceName;
