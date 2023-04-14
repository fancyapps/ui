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

- **Fancybox** Use image src as fallback for thumbnail source ([#434](https://github.com/fancyapps/ui/issues/434))
- **Fancybox** Link focus on opening ([#424](https://github.com/fancyapps/ui/issues/424))
- **Fancybox** Typescript warnings ([#427](https://github.com/fancyapps/ui/issues/427) and [#429](https://github.com/fancyapps/ui/issues/429))

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

- **Fancybox** Typos in the template ([#406](https://github.com/fancyapps/ui/issues/406))

## Features

- **Fancybox** Added `dnt` option for Vimeo videos

# 5.0.1 (2023-02-23)

### Bug Fixes

- **Fancybox** Problem with preloading images ([#403](https://github.com/fancyapps/ui/issues/403))

# 5.0.0 (2023-02-22)

Initial release
