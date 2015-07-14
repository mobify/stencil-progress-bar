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
No bodies

#### label

#### state

#### useSpinner



### UI Script

#### Options

#### Methods

##### setProgress

```
$(elemenet).data('progressbar').setProgress(0.5);
```

##### setState

```
$(elemenet).data('progressbar').setState('success');
```

#### Events


### Stylesheet configurable variables


## Development

* run `npm install`
* run `bower install`
* run `grunt serve`
* navigate to [localhost:3000/tests/visual](http://localhost:3000/tests/visual)

## Tests

### Visual Tests
Each component has a set of visual tests. These are implemented as an html page that is used to manually verify functionality against a spec (how it should look and behave). This is mainly useful for testing CSS and for development.

* Run `npm install && bower install && bundle install`
* Run `grunt serve`
* Navigate to [localhost:3000/tests/visual](http://localhost:3000/tests/visual)

