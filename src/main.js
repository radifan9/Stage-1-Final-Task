import "./style.css";

import Swiper from "swiper/bundle";
import "swiper/css/bundle";

const swiper = new Swiper(".tech-stack-slider", {
  slidesPerView: "auto",
  spaceBetween: 30,
  loop: true,
  allowTouchMove: false, // Disable manual swiping
  autoplay: {
    delay: 1, // Minimal delay
    disableOnInteraction: false,
    reverseDirection: true,
  },
  speed: 6000, // Adjust this value to control the sliding speed
  slidesPerView: "auto",
  freeMode: {
    enabled: true,
    momentum: false,
  },
});
