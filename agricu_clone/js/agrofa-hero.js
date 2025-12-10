(function ($) {
    "use strict";
    function thmOwlInit() {
        let agrofaowlCarousel = $(".agrofa-owl__carousel");
        if (agrofaowlCarousel.length) {
            agrofaowlCarousel.each(function () {
                let elm = $(this);
                let options = elm.data("owl-options");
                let thmOwlCarousel = elm.owlCarousel(
                    "object" === typeof options ? options : JSON.parse(options)
                );
                elm.find("button").each(function () {
                    $(this).attr("aria-label", "carousel button");
                });
            });
        }
    }
    $(window).on("load", function () {
        thmOwlInit();
    });
})(jQuery);
