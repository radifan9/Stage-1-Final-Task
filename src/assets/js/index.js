"use strict";

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Swiper
  const swiper = new Swiper(".swiper", {
    direction: "horizontal", // 'horizontal' or 'vertical'
    loop: true, // true -> enable continuous loop
    slidesPerView: 9, // number of visible element per view

    // Smooth continuous movement
    speed: 4000, // duration of transition (ms)
    allowTouchMove: true, // ability to grabbing it with mouse
    autoplay: {
      delay: 1, // delay between init and slide moves (ms)
      disableOnInteraction: false, // false -> after mouse grab it moves back
      reverseDirection: true, // true -> left to right
    },
  });
});
