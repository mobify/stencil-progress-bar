require.config({
    paths: {
        'dust-full': '../../node_modules/dustjs-linkedin/dist/dust-full',
        'adaptivejs': '../../node_modules/adaptivejs',
        'selectorLibrary': '../../bower_components/zeptojs/dist/zepto'
    },
    shim: {
        'dust-full': {
            'exports': 'dust'
        },
        'selectorLibrary': {
            'exports': '$'
        }
    },
});

require([
    'dust-full',
    'adaptivejs/lib/dust-component-helper',
    'adaptivejs/lib/dust-component-sugar',
    '../../tmp/templates',
    '../../progress-bar-ui'
], function(
    dust,
    componentHelper,
    componentSugar,
    templates,
    ui
) {
    var context;

    // Register helpers for precompiled component templates.
    dust = componentHelper(dust);
    templates.forEach(function(name) {
        dust.helpers[name] = componentSugar.makeHelper(name);
    });

    // Define any context required for the tests:
    var context = {
        repo: 'https://github.com/mobify/stencil-progress-bar',
        selectMarkup: 'Insert example markup here',
        useSpinner: true,
        state_inprogress: 'inprogress',
        state_success: 'success',
        state_failure: 'failure',
        label_inprogress: 'Downloading',
        label_success: 'Download Successful',
        label_failure: 'Error Downloading'
    };

    // Render
    dust.render('tests', context, function(err, out) {
        if (!err) {
            document.querySelector('body').innerHTML = out;
        } else {
            console.log(err);
        }
    });

    var incrementProgress = function(element) {
        var counter = 0;

        return setInterval(function() {
            if (counter > 1) {
                counter = 1;
            }

            ui.setProgress(counter, element);
            counter += 0.05;
        }, 500);
    };

    var bindEvents = function() {
        $('.test__button--change-progress').on('click', function() {
            var $this = $(this);
            var $progressBar = $this.parent().find('.c-progress-bar');
            var progressPercentage = 0;

            if ($this.data('progress-value')) {
                progressPercentage = $this.data('progress-value');
            } else {
                // grab the value of the adjacent input
                progressPercentage = $this.prev().val() / 100;
            }

            ui.setProgress(progressPercentage, $progressBar);
        });

        $('.test__button--start-progress').on('click', function() {
            var $this = $(this);
            var $progressBar = $this.parent().find('.c-progress-bar');

            if ($this.data('incrementing')) {
                clearInterval($this.data('incrementing'));
                $this.data('incrementing', false);
            }

            $this.data('incrementing', incrementProgress($progressBar));
        });

        $('.test__button--change-state').on('change', function() {
            var $this = $(this);
            var $progressBar = $this.parent().find('.c-progress-bar');
            var value = $this.val();

            var label = '';

            if (value === 'inprogress') {
                label = 'Downloading';
            } else if (value === 'success') {
                label = 'Download Successful';
            } else {
                label = 'Error Downloading';
            }

            ui.setState(value, label, $progressBar);
        });
    };

    bindEvents();
    ui.init(0.65);
});
