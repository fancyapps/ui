# 5.0.36 (2024-04-10)

### Bug Fixes

- **Fancybox** Content flashes on close with Safari 17.4 ([642](https://github.com/fancyapps/ui/issues/642))
- **Fancybox** Issue with `:empty` selector ([631](https://github.com/fancyapps/ui/issues/631))

# 5.0.35 (2024-03-13)

### Bug Fixes

- **Fancybox** Scroll position after closing ([628](https://github.com/fancyapps/ui/issues/628))

### Features

- **Fancybox** Add option `closeExisting` ([629](https://github.com/fancyapps/ui/issues/629))

# 5.0.34 (2024-03-12)

### Bug Fixes

- **Carousel** Animation direction of synchronized carousels ([622](https://github.com/fancyapps/ui/issues/622))
- **Fancybox** Tweak CSS to work for Shopify

### Features

- **Fancybox** Support `data-width` and `data-height` attributes for images

# 5.0.33 (2024-01-03)

### Bug Fixes

- **Panzoom** Refactored code to correctly show the zoom-in cursor when click action is "iterateZoom"

# 5.0.32 (2023-12-21)

### Bug Fixes

- **Fancybox** Improved Hash plugin, see [264](https://github.com/fancyapps/ui/issues/264)

# 5.0.31 (2023-12-18)

### Bug Fixes

- **Fancybox** Fix an issue with fullscreen and multiple instances
- **Carousel** Fix incorrect page selection when using margins, infinite navigation and `dragFree`

# 5.0.30 (2023-12-14)

### Bug Fixes

- Fix l10n TS files ([598](https://github.com/fancyapps/ui/issues/598))

### Features

- **Carousel** Added new method `setPageFromPosition`, see [597](https://github.com/fancyapps/ui/issues/597)

# 5.0.29 (2023-12-12)

### Bug Fixes

- **Fancybox** Fix an issue with Carousel dimensions in Fancybox modal ([589](https://github.com/fancyapps/ui/issues/589))
- **Fancybox** Fix an issue with Youtube video start time containing minutes ([596](https://github.com/fancyapps/ui/issues/596))
- **Fancybox** Slideshow needs to restart after manually changing a gallery item
- **Fancybox** Fix an issue with container custom position and closing animation

# 5.0.28 (2023-11-15)

### Features

- **Fancybox** Added additional CSS variables to control transition durations ([523](https://github.com/fancyapps/ui/issues/523))
- **Carousel** The navigation plugin reuses existing DOM elements
- Improved TypeScript support

# 5.0.27 (2023-11-09)

### Bug Fixes

- **Fancybox** Fix an issue with keyboard navigation ([583](https://github.com/fancyapps/ui/issues/583))
- **Fancybox** Fix an issue with scrollable content when using `wheel:slide` ([582](https://github.com/fancyapps/ui/issues/582))

# 5.0.26 (2023-11-06)

### Bug Fixes

- **Carousel** Fix classic thumbnail CSS affecting dimensions

# 5.0.25 (2023-11-03)

### Bug Fixes

- **Fancybox** Fix an issue with animations ([579](https://github.com/fancyapps/ui/issues/579))

### Features

- **Carousel** Added new method `addSlide()` that allows to add a new slide at a selected location
- **Carousel** A completely reworked thumbail plugin:
  1. Modern thumbnails can now be infinite, this also improves overall performance with large number of items.
  2. New thumbnails are also created when new slides are added to the carousel. This allows, for example, to create a Fancybox gallery with an infinite number of images.

# 5.0.24 (2023-10-05)

### Bug Fixes

- **Fancybox** Exit fullscreen mode only if started by Fancybox ([520](https://github.com/fancyapps/ui/issues/520))
- **Fancybox** Fix an issue with elements inside the content that contain Panzoom data attributes

### Features

- Added Slovak translations
- **Carousel** Added event `beforeChange`, can be used to prevent slide change

# 5.0.23 (2023-09-28)

### Bug Fixes

- **Fancybox** Fix close button click event not working when text is selected ([565](https://github.com/fancyapps/ui/issues/565))
- **Fancybox** Fix repetition of events ([554](https://github.com/fancyapps/ui/issues/554))
- **Fancybox** Fix an issue with not yet loaded image after very fast clicks on toolbar buttons
- **Fancybox** Fix an issue with captions containing only numbers
- **Fancybox** HTML5 videos should support `data-width` and `data-height` attributes
- **Carousel** Fix scrolling in Safari when using a mouse ([529](https://github.com/fancyapps/ui/issues/529))
- **Carousel** Fix an issue when combining Carousel with Panzoom and using lazy image loading
- **Panzoom** Fix pin position after resizing window in full screen mode
- **Panzoom** Allow the click event of the Pins plugin to be executed in order to combine with Fancybox

# 5.0.22 (2023-08-09)

### Bug Fixes

- **Fancybox** Classic thumbnails doesn't work on click ([535](https://github.com/fancyapps/ui/issues/535))
- **Fancybox** The cursor should indicate whether the carousel is draggable or currently being dragged

# 5.0.21 (2023-08-08)

### Features

- **Fancybox** Allow Caption to be an Element ([531](https://github.com/fancyapps/ui/issues/531))
- **Carousel** `appendSlide()` supports a custom element ([537](https://github.com/fancyapps/ui/issues/537))
- **Panzoom** Zoom in on the current display area centered around the axis ([519](https://github.com/fancyapps/ui/issues/519))

### Bug Fixes

- **Fancybox** Videos wrong size when scrolling through carousel ([535](https://github.com/fancyapps/ui/issues/535))
- **Fancybox** Classic mode thumbnails are refreshed repeatedly ([540](https://github.com/fancyapps/ui/issues/540))
- **Fancybox** Carousel swipe doesn't work with links ([524](https://github.com/fancyapps/ui/issues/524))
- **Fancybox** Focus outline for thumbnails after using keyboard

# 5.0.20 (2023-07-04)

### Features

- **Fancybox** Add ability to position elements (for example, navigation arrows) relative to the image
- **Fancybox** Add ability to place caption anywhere (including toolbar)
- **Fancybox** Add ability to dynamically add new content (example: `Fancybox.getInstance().carousel.appendSlide({src : "https://lipsum.app/id/1/800x600/"});`)
- Add Latvian translations
- **Fancybox** Add CSS variable `--f-transition-duration` to control transition duration more easily

# 5.0.19 (2023-05-25)

### Bug Fixes

- **Carousel** In specific cases, an incorrect position occurs after a click ([498](https://github.com/fancyapps/ui/issues/498))

### Features

- **Fancybox** Add `createSlide` event to the thumbnail plugin

# 5.0.18 (2023-05-22)

### Features

- **Fancybox** Add `startSlideshow` and `endSlideshow` events
- **Fancybox** Add navigation using the mouse wheel above the thumbnails
- **Fancybox** Add option to show custom content instead of default error message ([388](https://github.com/fancyapps/ui/issues/388))
- Add Czech translations
- Add Chinese (Simplified) translations

# 5.0.17 (2023-04-26)

### Features

- **Fancybox** Scale the container to maintain dimensions regardless of the pinch zoom level of the device
- **Fancybox** Add `Slideshow.progressParentEl` option to more easily specify the location of progress bar
- **Fancybox** Add support for YouTube Shorts
- **Carousel** Remove infinite navigation restriction in specific cases

# 5.0.16 (2023-04-14)

### Features

- **Fancybox** Add `Html.iframeAttr` option that allows to customize the attributes of an iframe element
- **Carousel** The `slidesPerPage` option now respects the actual width of each slide element
- Fancybox and Carousel components now expose the components they use and thus they do not need to be loaded separately

# 5.0.15 (2023-04-06)

### Bug Fixes

- **Fancybox** Fix `parentEl` option
- **Fancybox** Fix click event while highlighting text in input ([471](https://github.com/fancyapps/ui/issues/471))
- **Fancybox** Fix close button not showing in HTML5 Video ([469](https://github.com/fancyapps/ui/issues/469))

### Features

- **Fancybox** Add `fromSelector()` static method
- **Fancybox** Improve zoom-in animation performance
- **Carousel** Improve guesture handling

# 5.0.14 (2023-03-30)

### Bug Fixes

- **Panzoom** Fix issue with rotation animation after quick click
- **Panzoom** Fix the original image size rounding issue

### Features

- **Carousel** New `load` event for lazy loaded images
- **Carousel** Add support for viewport element padding
- **Fancybox** Add support for HTML content as a simple text string as well as multiple elements

# 5.0.13 (2023-03-27)

### Features

- Add Japanese translations
- **Fancybox** Add support for the `<picture>` element using a new `Images.content` option

# 5.0.12 (2023-03-24)

### Bug Fixes

- **Carousel** Fix scrolling issue on Macbook using Firefox

### Features

- **Panzoom** Add support for the `<picture>` element

# 5.0.11 (2023-03-23)

### Bug Fixes

- Fix French translations
- **Panzoom** Don't add `is-draggable` class name if content fits

# 5.0.10 (2023-03-22)

### Bug Fixes

- **Fancybox** Reverse the scroll direction of the mouse wheel ([425](https://github.com/fancyapps/ui/issues/425))

### Features

- Add Spanish translations
- Add French translations

# 5.0.9 (2023-03-21)

### Bug Fixes

- **Fancybox** Background scrolls behind dialog ([450](https://github.com/fancyapps/ui/issues/450))
- **Fancybox** Fixed unwanted double click in specific scenarios

### Features

- Added Italian translations
- **Fancybox** Opt out of youtube nocookie ([447](https://github.com/fancyapps/ui/issues/447))
- **Fancybox** Allow to download as different names ([440](https://github.com/fancyapps/ui/issues/440))

# 5.0.8 (2023-03-16)

### Bug Fixes

- **Fancybox** Improved focus handling

### Features

- Added language template and Polish translations
- **Fancybox** Support private Vimeo videos ([436](https://github.com/fancyapps/ui/issues/436))
- **Carousel** Added `getProgress(slideIndex)` method that can be used for tweening (parallax effects, etc)

# 5.0.7 (2023-03-12)

### Bug Fixes

- **Fancybox** Use image src as fallback for thumbnail source ([434](https://github.com/fancyapps/ui/issues/434))
- **Fancybox** Link focus on opening ([424](https://github.com/fancyapps/ui/issues/424))
- **Fancybox** Typescript warnings ([427](https://github.com/fancyapps/ui/issues/427) and [429](https://github.com/fancyapps/ui/issues/429))

### Features

- **Fancybox** Add `mainClass` option ([432](https://github.com/fancyapps/ui/issues/432))
- **Carousel** Revised flick gesture recognition
- **Carousel** Revised thumbnail size and spacing
- **Carousel** Improved positioning when changing container width

# 5.0.6 (2023-03-03)

### Bug Fixes

- **Fancybox** Fix issue with page scrolling when using `wheel: "slide"` and `hideScrollbar: false` options

### Features

- **Fancybox** Changed navigation order when using `wheel: "slide"` option
- **Fancybox** Added class name for thumbnails to indicate content type (`type-image`, `type-video`, etc)

# 5.0.5 (2023-03-02)

### Bug Fixes

- **Fancybox** Fix issue with zoom-in animation from large images

# 5.0.4 (2023-03-01)

### Bug Fixes

- **Fancybox** Fix blurry images in Safari

### Features

- **Fancybox** Improved accessibility

# 5.0.3 (2023-02-26)

### Bug Fixes

- **Fancybox** Fix `Images.protected` option

# 5.0.2 (2023-02-24)

### Bug Fixes

- **Fancybox** Typos in the template ([406](https://github.com/fancyapps/ui/issues/406))

## Features

- **Fancybox** Added `dnt` option for Vimeo videos

# 5.0.1 (2023-02-23)

### Bug Fixes

- **Fancybox** Problem with preloading images ([403](https://github.com/fancyapps/ui/issues/403))

# 5.0.0 (2023-02-22)

Initial release
