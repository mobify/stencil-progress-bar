# Stencil Progress Bar

A progress bar that comes in both standard and radial flavours. 

[Demo Coming Soon](#)



## Requirements

- Sass
- AMD loader
- Dust templating



## Installation

Install the Stencil Progress Bar using the AdaptiveJS generator:
```shell
yo adaptivejs:component --install stencil-progress-bar
```
You can also install interactively by running `yo adaptivejs:component` and choosing the install option.



## Usage

Stencil components installed with the AdaptiveJS generator require no setup. Just load the component’s template in the desired view and use the dust helper to render it. For details, see [using Components in AdaptiveJS](https://github.com/mobify/devcenter-assets/blob/master/mobifydevcenter/v2.0/documentation/Components/Use%20a%20Component.md).



## API

### Template
The template accepts the following parameters.

Name | Type | Description
-----|------|------------
value | number within [0, 1] | Sets the initial value for the progress bar
label | string | Sets the initial label for the progress bar
state | one of ['inprogress', 'success', 'failure'] | Sets the initial state for the progress bar
isRadial | boolean | If `true`, uses the radial progress bar instead of the linear progress bar

This component has no template bodies.


### UI Script

If you don't need to use non-default options when initializing the Progress Bar, you don't need to include anything, as Adaptive.js will do that for you.

If you do need to use non-default options during initialization, you first require the Progress Bar UI script. Then call `ProgressBar.init`.

```js
require([
    // ...
    'progress-bar-ui'
], function(
    // ...
    ProgressBar
) {
    ProgressBar.init($el);
});
```

`ProgressBar.init` takes one parameter: `$el`.

#### $el

`$el` is the progress bar element. The component's instance is accessible through this DOM node. For instance, the following calls the `setProgress` method on an instance of the Progress Bar component:

```js
$('.c-progress-bar').data('component').setProgress(0.5);
```


#### Component Instance Methods

##### .setProgress(percentage)

Use this function to update the progress bar's value. `percentage` should be a number between 0 and 1. 

```js
$(element).data('component').setProgress(0.5);
```


##### .setState(state, label)

Use this function to change the state of the progress bar. The progress bar component supports 3 states: `progress`, `success`, and `error`. These states determine the visual appearance of the component. The label is the text displayed with the progress bar.

Upon reaching 100%, the progress bar component will not immediately transition into either success or failure states - you need to call these manually.

```js
$(element).data('component').setState('success', 'Download successful');
```


#### Events

All events are fired at the root element of the component, i.e. `<div class="c-progress-bar">`

Event Type | Description
-----------|------------
progress-retry | This event fires when the user clicks the Retry button. The Retry button is only available when the component is in the `failure` state.


### Stylesheet configurable variables

Name | Default | Description
-----|---------|------------
$progress-bar__progress-color   | black   | Set the progress bar color when state=progress
$progress-bar__success-color    | #27ae60 | Set the progress bar color when state=success
$progress-bar__error-color      | #c0392b | Set the progress bar color when state=error
$progress-bar__background-color | #888    | Set the color of the progress bar's background


## Development

* Run `npm install && bower install && bundle install`
* Run `grunt serve`
* Navigate to [localhost:3000/tests/visual](http://localhost:3000/tests/visual)



## Tests

### Visual Tests
Each component has a set of visual tests. These are implemented as an html page that is used to manually verify functionality against a spec (how it should look and behave). This is mainly useful for testing CSS and for development. You can view the tests by following the Development steps above.
