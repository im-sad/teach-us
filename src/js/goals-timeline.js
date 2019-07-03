// Make active goal item visible
document.addEventListener('DOMContentLoaded', function() {
  'use strict';

   // TODO: use ES5 or Babel
  (function() {
    let goalsTimelines = document.getElementsByClassName('js-goals');

    for (let i = 0; i < goalsTimelines.length; i++) {
      let activePoint = goalsTimelines[i].getElementsByClassName('is-active')[0];
      let content = goalsTimelines[i].firstElementChild;

      let sb = new ScrollBooster({
        viewport: goalsTimelines[i],
        content: content,
        mode: 'x',
        onUpdate: (data)=> {
          content.style.transform = `translateX(${-data.position.x}px)`
        }
      });

      if (activePoint) {
        let rectLine = goalsTimelines[i].getBoundingClientRect();
        let rectPoint = activePoint.getBoundingClientRect();

        if (rectLine.width / 2 < activePoint.offsetLeft) {
          let offset = activePoint.offsetLeft + (rectPoint.width / 2) - (rectLine.width / 2);
          sb.setPosition({x: offset, y: 0});
        }
      }
    }
  })();

});
