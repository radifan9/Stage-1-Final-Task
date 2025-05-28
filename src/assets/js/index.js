"use strict";

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Swiper
  const swiper = new Swiper(".swiper", {
    direction: "horizontal",
    loop: true,
    slidesPerView: 8,
    spaceBetween: 30,

    // Smooth continuous movement
    speed: 4000,
    allowTouchMove: true,
    autoplay: {
      delay: 1,
      disableOnInteraction: false,
      reverseDirection: true,
    },

    // Enable continuous smooth sliding
    freeMode: {
      enabled: true,
      momentum: false,
    },
  });
});
