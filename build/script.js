$(window).on('load', function () {
    $('.slider').slick({
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: $('.arrow-right'),
        prevArrow: $('.arrow-left'),
    });
})