// Target Cursor - 原生JS版本 (依赖 GSAP)
(function () {
    // 移动端检测：触屏小屏 或 移动端UA，直接不启用
    function isMobileDevice() {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const smallScreen = window.innerWidth <= 768;
      const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      return (hasTouch && smallScreen) || mobileRegex.test(ua);
    }
  
    function initTargetCursor(options) {
      const opts = Object.assign({
        targetSelector: '.cursor-target',
        spinDuration: 2,
        hideDefaultCursor: true,
        hoverDuration: 0.2,
        parallaxOn: true
      }, options || {});
  
      if (isMobileDevice()) return;
      if (typeof gsap === 'undefined') {
        console.warn('TargetCursor: GSAP 未加载，光标特效未启用');
        return;
      }
  
      const borderWidth = 3;
      const cornerSize = 12;
  
      // 创建光标DOM
      const wrapper = document.createElement('div');
      wrapper.className = 'target-cursor-wrapper';
      wrapper.innerHTML =
        '<div class="target-cursor-dot"></div>' +
        '<div class="target-cursor-corner corner-tl"></div>' +
        '<div class="target-cursor-corner corner-tr"></div>' +
        '<div class="target-cursor-corner corner-br"></div>' +
        '<div class="target-cursor-corner corner-bl"></div>';
      document.body.appendChild(wrapper);
  
      const cursor = wrapper;
      const dot = wrapper.querySelector('.target-cursor-dot');
      const corners = Array.from(wrapper.querySelectorAll('.target-cursor-corner'));
  
      const originalCursor = document.body.style.cursor;
      if (opts.hideDefaultCursor) document.body.style.cursor = 'none';
  
      let activeTarget = null;
      let currentLeaveHandler = null;
      let resumeTimeout = null;
      let spinTl = null;
      let targetCornerPositions = null;
      let tickerActive = false;
      const activeStrength = { current: 0 };
  
      function moveCursor(x, y) {
        gsap.to(cursor, { x: x, y: y, duration: 0.1, ease: 'power3.out' });
      }
  
      gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
  
      function createSpinTimeline() {
        if (spinTl) spinTl.kill();
        spinTl = gsap.timeline({ repeat: -1 })
          .to(cursor, { rotation: '+=360', duration: opts.spinDuration, ease: 'none' });
      }
      createSpinTimeline();
  
      // 每帧更新四角，让方框包住目标
      function tickerFn() {
        if (!targetCornerPositions) return;
        const strength = activeStrength.current;
        if (strength === 0) return;
  
        const cursorX = gsap.getProperty(cursor, 'x');
        const cursorY = gsap.getProperty(cursor, 'y');
  
        corners.forEach((corner, i) => {
          const currentX = gsap.getProperty(corner, 'x');
          const currentY = gsap.getProperty(corner, 'y');
          const targetX = targetCornerPositions[i].x - cursorX;
          const targetY = targetCornerPositions[i].y - cursorY;
          const finalX = currentX + (targetX - currentX) * strength;
          const finalY = currentY + (targetY - currentY) * strength;
          const duration = strength >= 0.99 ? (opts.parallaxOn ? 0.2 : 0) : 0.05;
          gsap.to(corner, {
            x: finalX,
            y: finalY,
            duration: duration,
            ease: duration === 0 ? 'none' : 'power1.out',
            overwrite: 'auto'
          });
        });
      }
  
      const moveHandler = e => moveCursor(e.clientX, e.clientY);
      window.addEventListener('mousemove', moveHandler);
  
      // 滚动时检查鼠标是否还在目标上
      const scrollHandler = () => {
        if (!activeTarget) return;
        const mouseX = gsap.getProperty(cursor, 'x');
        const mouseY = gsap.getProperty(cursor, 'y');
        const under = document.elementFromPoint(mouseX, mouseY);
        const stillOver = under &&
          (under === activeTarget || under.closest(opts.targetSelector) === activeTarget);
        if (!stillOver && currentLeaveHandler) currentLeaveHandler();
      };
      window.addEventListener('scroll', scrollHandler, { passive: true });
  
      // 点击缩放
      const mouseDownHandler = () => {
        gsap.to(dot, { scale: 0.7, duration: 0.3 });
        gsap.to(cursor, { scale: 0.9, duration: 0.2 });
      };
      const mouseUpHandler = () => {
        gsap.to(dot, { scale: 1, duration: 0.3 });
        gsap.to(cursor, { scale: 1, duration: 0.2 });
      };
      window.addEventListener('mousedown', mouseDownHandler);
      window.addEventListener('mouseup', mouseUpHandler);
  
      function cleanupTarget(target) {
        if (currentLeaveHandler) target.removeEventListener('mouseleave', currentLeaveHandler);
        currentLeaveHandler = null;
      }
  
      // 鼠标进入目标元素
      const enterHandler = e => {
        let target = null;
        let current = e.target;
        while (current && current !== document.body) {
          if (current.matches && current.matches(opts.targetSelector)) { target = current; break; }
          current = current.parentElement;
        }
        if (!target) return;
        if (activeTarget === target) return;
        if (activeTarget) cleanupTarget(activeTarget);
        if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }
  
        activeTarget = target;
        corners.forEach(corner => gsap.killTweensOf(corner));
  
        gsap.killTweensOf(cursor, 'rotation');
        spinTl && spinTl.pause();
        gsap.set(cursor, { rotation: 0 });
  
        const rect = target.getBoundingClientRect();
        const cursorX = gsap.getProperty(cursor, 'x');
        const cursorY = gsap.getProperty(cursor, 'y');
  
        targetCornerPositions = [
          { x: rect.left - borderWidth, y: rect.top - borderWidth },
          { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
          { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
          { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
        ];
  
        if (!tickerActive) { gsap.ticker.add(tickerFn); tickerActive = true; }
  
        gsap.to(activeStrength, { current: 1, duration: opts.hoverDuration, ease: 'power2.out' });
  
        corners.forEach((corner, i) => {
          gsap.to(corner, {
            x: targetCornerPositions[i].x - cursorX,
            y: targetCornerPositions[i].y - cursorY,
            duration: 0.2,
            ease: 'power2.out'
          });
        });
  
        const leaveHandler = () => {
          if (tickerActive) { gsap.ticker.remove(tickerFn); tickerActive = false; }
          targetCornerPositions = null;
          gsap.set(activeStrength, { current: 0, overwrite: true });
          activeTarget = null;
  
          gsap.killTweensOf(corners);
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
          ];
          const tl = gsap.timeline();
          corners.forEach((corner, index) => {
            tl.to(corner, { x: positions[index].x, y: positions[index].y, duration: 0.3, ease: 'power3.out' }, 0);
          });
  
          // 恢复旋转
          resumeTimeout = setTimeout(() => {
            if (!activeTarget && spinTl) {
              const currentRotation = gsap.getProperty(cursor, 'rotation');
              const normalized = currentRotation % 360;
              spinTl.kill();
              spinTl = gsap.timeline({ repeat: -1 })
                .to(cursor, { rotation: '+=360', duration: opts.spinDuration, ease: 'none' });
              gsap.to(cursor, {
                rotation: normalized + 360,
                duration: opts.spinDuration * (1 - normalized / 360),
                ease: 'none',
                onComplete: () => spinTl && spinTl.restart()
              });
            }
            resumeTimeout = null;
          }, 50);
  
          cleanupTarget(target);
        };
  
        currentLeaveHandler = leaveHandler;
        target.addEventListener('mouseleave', leaveHandler);
      };
  
      window.addEventListener('mouseover', enterHandler, { passive: true });
    }
  
    // 页面加载后自动初始化
    document.addEventListener('DOMContentLoaded', function () {
      initTargetCursor({
        targetSelector: '.cursor-target',
        spinDuration: 2,
        hideDefaultCursor: true,
        hoverDuration: 0.2,
        parallaxOn: true
      });
    });
  })();