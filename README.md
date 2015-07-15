# Stencil Progress Bar

A progress bar that comes in both standard and radial flavours. 

[Link to demo](#)



## Requirements

- Sass
- AMD loader
- Dust templating



## Installation

Install the Stencil Progress Bar using the AdaptiveJS generator:
```
yo adaptivejs:component --install stencil-progress-bar
```
You can also install interactively by running `yo adaptivejs:component` and choosing the install option.



## Usage

Stencil components installed with the AdaptiveJS generator require no setup. Just load the component’s template in the desired view and use the dust helper to render it. For details, see [using Components in AdaptiveJS](#).



## API

### Template
The template accepts the following parameters.

Name | Type | Description
-----|------|------------
label | string | Sets the initial label for the progress bar
state | one of ['inprogress', 'success', 'failure'] | Sets the initial state for the progress bar
useSpinner | boolean | If `true`, uses the radial form of the progress bar instead of the standard form

This component has no template bodies.


### UI Script

First, require the Progress Bar UI script. Then call `ProgressBar.init`.

```
require([
    // ...
    'progress-bar-ui'
], function(
    // ...
    ProgressBar
) {
    ProgressBar.init($el, options);
});
```

`ProgressBar.init` takes two parameters: `$el` and `options`.

#### $el

`$el` is the progress bar element. The component's instance is accessible through this DOM node. For instance, the following calls the `setProgress` method on an instance of the Progress Bar component:

```
$('.c-progress-bar').data('progressbar').setProgress(0.5);
```

#### Options

Name | Type | Default | Description
-----|------|---------|------------
initialValue | number between 0 and 1 | 0 | Sets the initial value for the progress bar.


#### Component Instance Methods

##### .setProgress(percentage)

Use this function to update the progress bar's value. `percentage` should be a number between 0 and 1. 

```
$(element).data('progressbar').setProgress(0.5);
```

##### .setState(state)

Use this function to change the state of the progress bar. The progress bar component supports 3 states: `inprogress`, `success`, and `failure`. These states determine the visual appearance of the component.

Upon reaching 100%, the progress bar component will not immediately transition into either success or failure states - you need to call these manually.

```
$(element).data('progressbar').setState('success');
```


#### Events

All events are fired at the root element of the component, i.e. `<div class="c-progress-bar">`

Event Type | Description
-----------|------------
progress-retry | This event fires when the user clicks the Retry button. The Retry button is only available when the component is in the `failure` state.


### Stylesheet configurable variables



## Development

* Run `npm install && bower install && bundle install`
* Compile a custom build of zepto. Run the following:
``` 
cd bower_components/zepto
npm install
npm run-script dist
MODULES="zepto event data touch" npm run-script dist
```
* Run `grunt serve`
* Navigate to [localhost:3000/tests/visual](http://localhost:3000/tests/visual)



## Tests

### Visual Tests
Each component has a set of visual tests. These are implemented as an html page that is used to manually verify functionality against a spec (how it should look and behave). This is mainly useful for testing CSS and for development.

* Run `npm install && bower install && bundle install`
* Run `grunt serve`
* Navigate to [localhost:3000/tests/visual](http://localhost:3000/tests/visual)

