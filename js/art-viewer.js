(function() {
  var viewer = document.getElementById('art-viewer');
  if (!viewer) return;
  var surface = document.getElementById('art-surface');
  var img = surface.querySelector('img');

  // Set the image's natural aspect ratio so CSS can size correctly in fullscreen
  function setAspect() {
    if (img.naturalWidth) {
      viewer.style.setProperty('--art-aspect', img.naturalWidth / img.naturalHeight);
    }
  }
  if (img.complete) setAspect();
  else img.addEventListener('load', setAspect);

  var scale = 1;
  var translateX = 0;
  var translateY = 0;
  var isDragging = false;
  var startX, startY, startTranslateX, startTranslateY;

  var MIN_SCALE = 1;
  var MAX_SCALE = 5;

  function clampTranslate() {
    var rect = viewer.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;
    var scaledW = w * scale;
    var scaledH = h * scale;
    var maxOverscroll = 0.5;

    var minX = -(scaledW - w * (1 - maxOverscroll));
    var maxX = w * maxOverscroll;
    var minY = -(scaledH - h * (1 - maxOverscroll));
    var maxY = h * maxOverscroll;

    translateX = Math.min(maxX, Math.max(minX, translateX));
    translateY = Math.min(maxY, Math.max(minY, translateY));
  }

  function applyTransform() {
    clampTranslate();
    surface.style.transform =
      'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ')';
  }

  // Zoom with scroll wheel — only intercept when zoomed in
  viewer.addEventListener('wheel', function(e) {
    var delta = e.deltaY > 0 ? 0.9 : 1.1;
    var newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * delta));

    if (newScale === MIN_SCALE && scale === MIN_SCALE) return;

    e.preventDefault();

    var rect = viewer.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    var prevScale = scale;
    scale = newScale;
    var ratio = scale / prevScale;
    translateX = mouseX - ratio * (mouseX - translateX);
    translateY = mouseY - ratio * (mouseY - translateY);
    applyTransform();
  }, { passive: false });

  // Pan with mouse drag
  viewer.addEventListener('mousedown', function(e) {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startTranslateX = translateX;
    startTranslateY = translateY;
    viewer.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    translateX = startTranslateX + (e.clientX - startX);
    translateY = startTranslateY + (e.clientY - startY);
    applyTransform();
  });

  window.addEventListener('mouseup', function() {
    isDragging = false;
    viewer.style.cursor = '';
  });

  // Touch support
  var lastTouchDist = 0;
  var lastTouchMid = null;

  viewer.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTranslateX = translateX;
      startTranslateY = translateY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      lastTouchDist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      lastTouchMid = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    }
  }, { passive: true });

  viewer.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      translateX = startTranslateX + (e.touches[0].clientX - startX);
      translateY = startTranslateY + (e.touches[0].clientY - startY);
      applyTransform();
    } else if (e.touches.length === 2) {
      var dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      var mid = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      var rect = viewer.getBoundingClientRect();
      var prevScale = scale;
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (dist / lastTouchDist)));
      var ratio = scale / prevScale;
      var mx = mid.x - rect.left;
      var my = mid.y - rect.top;
      translateX = mx - ratio * (mx - translateX);
      translateY = my - ratio * (my - translateY);
      lastTouchDist = dist;
      lastTouchMid = mid;
      applyTransform();
    }
  }, { passive: false });

  viewer.addEventListener('touchend', function() {
    isDragging = false;
    lastTouchDist = 0;
    lastTouchMid = null;
  });

  // Button controls
  document.getElementById('art-zoom-in').addEventListener('click', function() {
    var rect = viewer.getBoundingClientRect();
    var cx = rect.width / 2;
    var cy = rect.height / 2;
    var prevScale = scale;
    scale = Math.min(MAX_SCALE, scale * 1.3);
    var ratio = scale / prevScale;
    translateX = cx - ratio * (cx - translateX);
    translateY = cy - ratio * (cy - translateY);
    applyTransform();
  });

  document.getElementById('art-zoom-out').addEventListener('click', function() {
    var rect = viewer.getBoundingClientRect();
    var cx = rect.width / 2;
    var cy = rect.height / 2;
    var prevScale = scale;
    scale = Math.max(MIN_SCALE, scale * 0.7);
    var ratio = scale / prevScale;
    translateX = cx - ratio * (cx - translateX);
    translateY = cy - ratio * (cy - translateY);
    applyTransform();
  });

  document.getElementById('art-zoom-reset').addEventListener('click', function() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  });

  // Fullscreen toggle
  var fsBtn = document.getElementById('art-fullscreen');
  fsBtn.addEventListener('click', function() {
    viewer.classList.toggle('art-viewer-fullscreen');
    if (viewer.classList.contains('art-viewer-fullscreen')) {
      document.body.style.overflow = 'hidden';
      fsBtn.innerHTML = '\u2715';
      fsBtn.title = 'Exit fullscreen';
    } else {
      document.body.style.overflow = '';
      fsBtn.innerHTML = '\u26F6';
      fsBtn.title = 'Fullscreen';
    }
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  });

  // ESC to exit fullscreen
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && viewer.classList.contains('art-viewer-fullscreen')) {
      fsBtn.click();
    }
  });
})();
