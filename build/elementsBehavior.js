
document.getElementsByClassName('hamburger')[0].addEventListener("click", function () {
	this.classList.toggle("is-active");	
})

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
