!/*! License details at fancyapps.com/license */function(t,i){"object"==typeof exports&&"u">typeof module?i(exports):"function"==typeof define&&define.amd?define(["exports"],i):i((t="u">typeof globalThis?globalThis:t||self).window=t.window||{})}(this,function(t){"use strict";let i={defaultCaption:"<em>{{NO_CAPTION}}</em>",mainTpl:`<dialog class="fancybox__dialog">
    <div class="fancybox__container" tabindex="0" aria-label="{{MODAL}}">
      <div class="fancybox__backdrop"></div>
      <div class="fancybox__carousel">
        <div class="fancybox__grid">
          <div class="fancybox__column with-viewport">
            <div class="fancybox__viewport"></div>
          </div>
          <div class="fancybox__column with-sidebar">
            <div class="fancybox__sidebar"></div>
          </div>
        </div>
      </div>
    </div>
  </dialog>`,showOnStart:!0};t.Sidebar=()=>{let t,e=!1;function o(){let e=t?.getOptions().Sidebar;return"object"==typeof e&&null!==e&&e.constructor===Object&&"[object Object]"===Object.prototype.toString.call(e)?{...i,...e}:i}function n(i){e&&t?.getContainer()?.classList.toggle("has-sidebar",i)}function a(){let i=t?.getCarousel()?.getPlugins().Toolbar;i?.add("sidebar",{tpl:'<button class="f-button" title="{{TOGGLE_SIDEBAR}}"><svg><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></button>',click:()=>n()})}function l(){let i=t?.getOptions();if(!t||!i||!1===i.Sidebar)return;e=!0;let n=o();i.mainTpl=n.mainTpl,i.Carousel=i.Carousel||{},i.Carousel.formatCaption=(i,e)=>{let o=e.caption||"";if(!o){let i=t?.getOptions().triggerEl?.dataset.fancybox;if(i){let t=document.querySelector(`[data-fancybox-caption="${i}"]`);t&&(o=t.innerHTML)}}if(!o){let i=n.defaultCaption;o="function"==typeof i?t?i(t):"":i}return o&&"string"==typeof o&&t&&(o=t.localize(o)),o},i.Carousel.captionEl=()=>t?.getContainer()?.querySelector(".fancybox__sidebar")||null;let a=i.Carousel.Thumbs;!1!==a&&((a=a||{}).parentEl=t=>t.getViewport()?.parentElement||null,i.Carousel.Thumbs=a)}function s(){n(o().showOnStart)}return{init:function(i){(t=i).on("Carousel.initPlugins",a),t.on("initSlides",l),t.on("initLayout",s)},destroy:function(){e=!1,t?.off("Carousel.initPlugins",a),t?.off("initSlides",l),t?.off("initLayout",s)},isEnabled:function(){return e},toggle:n}}});