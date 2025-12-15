(function ($) {
    "use strict";

    $(window).on("load", function () {
        if ($('.hero-swiper').length) {

            // 1. Initialize Swiper
            var heroSwiper = new Swiper('.hero-swiper', {
                effect: 'creative',
                speed: 1000,
                parallax: true,
                loop: true,
                // Enable autoplay but we will stop it manually
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                creativeEffect: {
                    prev: {
                        shadow: true,
                        translate: [0, 0, -400],
                        opacity: 0,
                        scale: 0.9,
                    },
                    next: {
                        translate: ['100%', 0, 0],
                        rotate: [0, 0, 10],
                        scale: 0.5,
                    },
                },
                on: {
                    slideChangeTransitionStart: function (swiper) {
                        handleSlideLogic(swiper);
                    }
                    // We handle init manually below
                }
            });

            // 2. Initial Check (Page Load)
            heroSwiper.autoplay.stop(); // Stop immediately

            // Swiper's loop mode might mean activeIndex is not 0, but it points to the active slide.
            // We need to find the video in the *currently active* slide.
            var activeSlide = $(heroSwiper.slides[heroSwiper.activeIndex]);
            var firstSlideVideo = activeSlide.find('video').get(0);

            if (firstSlideVideo) {
                // Scenario: Page loads on Video Slide
                firstSlideVideo.currentTime = 0;
                firstSlideVideo.muted = true;
                var playPromise = firstSlideVideo.play();

                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn("Autoplay blocked:", error);
                        heroSwiper.slideNext();
                    });
                }

                // Wait for End
                $(firstSlideVideo).off('ended').on('ended', function () {
                    heroSwiper.slideNext();
                    heroSwiper.autoplay.start();
                });
            } else {
                // Page starts on an image (unlikely if Slide 1 is video, but possible with loop logic)
                heroSwiper.autoplay.start();
            }

            // 3. Logic for Slide Changes (Loop / Transitions)
            function handleSlideLogic(swiper) {
                // Pause all videos to be safe
                $('.hero-swiper video').each(function () {
                    this.pause();
                    this.currentTime = 0;
                });

                var activeSlide = $(swiper.slides[swiper.activeIndex]);
                var videoElement = activeSlide.find('video').get(0);

                if (videoElement) {
                    // Video Slide
                    swiper.autoplay.stop();

                    videoElement.currentTime = 0;
                    videoElement.muted = true;
                    videoElement.play();

                    $(videoElement).off('ended').on('ended', function () {
                        swiper.slideNext();
                        swiper.autoplay.start();
                    });
                } else {
                    // Image Slide
                    swiper.autoplay.start();
                }
            }

        }
    });

})(jQuery);
