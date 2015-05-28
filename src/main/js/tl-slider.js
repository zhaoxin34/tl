$(document).ready(function() {
    'use strict';
    $('#content-slider').lightSlider({
        item: 1,
        loop: false,
        slideMove: 2,
        easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
        speed: 600,
        controls: true,
        gallery: false,
        pager: false,
        responsive: [{
            breakpoint: 800,
            settings: {
                item: 3,
                slideMove: 1,
                slideMargin: 6,
            }
        }, {
            breakpoint: 480,
            settings: {
                item: 2,
                slideMove: 1
            }
        }]
    });
});
