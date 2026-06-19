(function() {
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
        showSlide(index);
      });
    });

    setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  inputs.forEach(function(input) {
    var targetId = input.getAttribute("data-search-target");
    var target = targetId ? document.getElementById(targetId) : null;
    if (!target) {
      return;
    }
    var items = Array.prototype.slice.call(target.querySelectorAll(".movie-card, .rank-row, .mini-card"));

    input.addEventListener("input", function() {
      var query = input.value.trim().toLowerCase();
      items.forEach(function(item) {
        var text = item.textContent.toLowerCase() + " " + [
          item.getAttribute("data-title"),
          item.getAttribute("data-year"),
          item.getAttribute("data-region"),
          item.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        item.classList.toggle("is-filtered-out", query && text.indexOf(query) === -1);
      });
    });
  });
})();
