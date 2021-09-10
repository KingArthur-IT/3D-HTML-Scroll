//Intro screen behavior
var firstScreenScroolCount = 0;
var animationDuration = 500;

document.getElementsByClassName('intro__scroll-down')[0].addEventListener('click', () => {
    scrollToSecondScreen();
    scrollToSecondScreen();
    scrollToSecondScreen();
    scrollToSecondScreen();
});

function scrollToSecondScreen(delta) {
    if (delta < 0) return;
    firstScreenScroolCount++;
    //First trigger - change title
    if (firstScreenScroolCount == 1) { 
        document.getElementsByClassName('first-title')[0].style.opacity = 0.0;
        document.getElementsByClassName('first-title')[0].style.transform = 'translateX(-1000px)';
        document.getElementsByClassName('intro__orange-line')[0].style.opacity = '0.0';
        document.getElementsByClassName('intro__orange-line')[0].style.transform = 'translateX(-1000px)';
        setTimeout(() => {
            document.getElementsByClassName('first-title')[0].style.display = 'none';
            document.getElementsByClassName('second-title')[0].style.display = 'block';
            setTimeout(() => {
                document.getElementsByClassName('second-title')[0].style.opacity = 1.0;
                document.getElementsByClassName('second-title')[0].style.transform = 'translateX(0px)';
                document.getElementsByClassName('intro__orange-line')[0].style.opacity = '1.0';
                document.getElementsByClassName('intro__orange-line')[0].style.transform = 'translateX(0px)';
            }, 100);
        }, animationDuration);
    }
    //Second trigger - change subtitle
    if (firstScreenScroolCount == 2) { 
        document.getElementsByClassName('first-subtitle')[0].style.opacity = 0.0;
        document.getElementsByClassName('first-subtitle')[0].style.transform = 'translateX(-1000px)';
        setTimeout(() => {
            document.getElementsByClassName('first-subtitle')[0].style.display = 'none';
            document.getElementsByClassName('second-subtitle')[0].style.display = 'block';
            setTimeout(() => {
                document.getElementsByClassName('second-subtitle')[0].style.opacity = 1.0;
                document.getElementsByClassName('second-subtitle')[0].style.transform = 'translateX(0px)';
            }, 100);
        }, animationDuration);
    }
    //Third trigger - del design squares and img
    if (firstScreenScroolCount == 3) { 
        document.getElementsByClassName('intro__red')[0].style.opacity = 0.0;
        document.getElementsByClassName('intro__yellow')[0].style.opacity = 0.0;
        document.getElementsByClassName('intro__bg-image')[0].style.transform = 'translateX(500px)';
        document.getElementsByClassName('intro__bg-image')[0].style.opacity = 0.0;
        setTimeout(() => {
            document.getElementsByClassName('intro__bg-image')[0].style.display = 'none';
        }, animationDuration);
    }
    //4th trigger - del button, add text and rails
    if (firstScreenScroolCount == 4) { 
        document.getElementsByClassName('intro__scroll-down')[0].style.opacity = 0.0;
        document.getElementsByClassName('intro__scroll-down')[0].style.transform = 'translateX(-300px)';
        setTimeout(() => {
            document.getElementsByClassName('intro__scroll-down')[0].style.display = 'none';
            document.getElementsByClassName('second-screen-info')[0].style.display = 'flex';
            document.getElementsByClassName('second-screen-info')[0].style.opacity = 1.0;
            document.getElementsByClassName('second-screen-info')[0].style.transform = 'translateX(0px)';
            document.getElementsByClassName('rails-bg-wrapper')[0].style.opacity = '1.0';
        }, animationDuration);
    }
    //5th trigger - start 3d scene
    if (firstScreenScroolCount == 5) {
        document.getElementsByClassName('intro')[0].style.opacity = 0.0;
        document.getElementsByClassName('canvas-wrapper')[0].style.opacity = 1.0;
        document.getElementsByClassName('canvas-wrapper')[0].style.display = 'block';
        setTimeout(() => {
            document.getElementsByClassName('intro')[0].style.display = 'none';
            document.getElementsByClassName('transition')[0].style.opacity = '0.0';
            setTimeout(() => {
                document.getElementsByClassName('transition')[0].style.display = 'none';
            }, 5000);
        }, 1500);
    }
}

//3d 
//from model to info
document.getElementsByClassName('model-wrapper__btn')[0].addEventListener('click', infoAboutObject, false);
document.getElementsByClassName('stop-info__close')[0].addEventListener('click', closeInfoAboutObject, false);
        
function showLayout() {
	for (let index = 0; index < document.getElementsByClassName('threeD-layout').length; index++) {
        document.getElementsByClassName('threeD-layout')[index].style.opacity = "1.0";
    }
}


function infoAboutObject() {
	document.getElementsByClassName('model-wrapper')[0].style.opacity = '0';
	setTimeout(() => {
		document.getElementsByClassName('model-wrapper')[0].style.transform = 'scale(0.0)';
		document.getElementsByClassName('model-wrapper')[0].style.position = 'absolute';
		
        document.getElementsByClassName('stop-info')[0].style.opacity = '1.0';
        document.getElementsByClassName('stop-info')[0].style.transform = 'scale(1.0)';
        document.getElementsByClassName('stop-info')[0].style.position = 'relative';
	}, 600);
}

function closeInfoAboutObject() {
	document.getElementsByClassName('stop-info')[0].style.opacity = '0.0';
    setTimeout(() => {
        document.getElementsByClassName('stop-info')[0].style.transform = 'scale(0.0)';
        document.getElementsByClassName('stop-info')[0].style.position = 'absolute';
        
        document.getElementsByClassName('model-wrapper')[0].style.opacity = '1.0';
        document.getElementsByClassName('model-wrapper')[0].style.transform = 'scale(1.0)';
        document.getElementsByClassName('model-wrapper')[0].style.position = 'relative';
	}, 600);
}


//change person description
document.getElementsByClassName('setPersonDescription-first')[0].addEventListener('click', setPersonDescriptionFirst, false);
document.getElementsByClassName('setPersonDescription-second')[0].addEventListener('click', setPersonDescriptionSecond, false);
document.getElementsByClassName('setPersonDescription-third')[0].addEventListener('click', setPersonDescriptionThird, false);

function setPersonDescriptionFirst() {
    document.getElementsByClassName('first-person-description')[0].style.display = 'flex';
    document.getElementsByClassName('second-person-description')[0].style.display = 'none';
    document.getElementsByClassName('third-person-description')[0].style.display = 'none';
}
function setPersonDescriptionSecond() {
    document.getElementsByClassName('first-person-description')[0].style.display = 'none';
    document.getElementsByClassName('second-person-description')[0].style.display = 'flex';
    document.getElementsByClassName('third-person-description')[0].style.display = 'none';
}
function setPersonDescriptionThird() {
    document.getElementsByClassName('first-person-description')[0].style.display = 'none';
    document.getElementsByClassName('second-person-description')[0].style.display = 'none';
    document.getElementsByClassName('third-person-description')[0].style.display = 'flex';
}