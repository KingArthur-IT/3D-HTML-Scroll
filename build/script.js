//For slick sliders
function InitSliders(stopNumber) {
    if (stopNumber == 1) {
        //stop1
        $('.slider-firstStop').slick({
            dots: true,
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            slidesToScroll: 1,
            nextArrow: $('.slider-firstStop-right'),
            prevArrow: $('.slider-firstStop-left'),
        });
    }
    if (stopNumber == 2) {
        //stop2
        $('.slider-secondStop').slick({
            dots: true,
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            slidesToScroll: 1,
            nextArrow: $('.slider-secondStop-right'),
            prevArrow: $('.slider-secondStop-left'),
        });    
    }
    if (stopNumber == 3) {
        //stop3
        $('.slider-thirdStop').slick({
            dots: true,
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            slidesToScroll: 1,
            nextArrow: $('.slider-thirdStop-right'),
            prevArrow: $('.slider-thirdStop-left'),
        });   
    }
}