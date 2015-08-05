require.config({
    paths: {
        'dust-full': '../../node_modules/dustjs-linkedin/dist/dust-full',
        'adaptivejs': '../../node_modules/adaptivejs',
        '$': '../../node_modules/jquery/dist/jquery',
        'deckard': '../../bower_components/deckard/dist/deckard'
    },
    shim: {
        'dust-full': {
            'exports': 'dust'
        },
        '$': {
            'exports': 'jQuery'
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
    context = {
        repo: 'https://github.com/mobify/stencil-progress-bar',
        selectMarkup: 'Insert example markup here',
        isRadial: true,
        state_progress: 'progress',
        state_success: 'success',
        state_error: 'error',
        label_progress: 'Downloading',
        label_success: 'Download Successful',
        label_error: 'Error Downloading'
    };

    // Render
    dust.render('tests', context, function(err, out) {
        if (!err) {
            document.querySelector('body').innerHTML = out;

            $('[data-adaptivejs-component="stencil-progress-bar"]').each(function(i, el) {
                ui.init($(el));
            });
        } else {
            console.log(err);
        }
    });

    var incrementProgress = function(element) {
        var counter = 0;
        var interval;

        interval = setInterval(function() {
            if (counter > 1) {
                counter = 1;
                clearInterval(interval);
            }

            element.data('component').setProgress(counter);
            counter += 0.05;
        }, 550);

        return interval;
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


            $progressBar.each(function(index, bar) {
                $(bar).data('component').setProgress(progressPercentage);
            });
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

            if (value === 'progress') {
                label = 'Downloading';
            } else if (value === 'success') {
                label = 'Download Successful';
            } else {
                label = 'Error Downloading';
            }

            $progressBar.each(function(index, bar) {
                $(bar).data('component').setState(value, label);
            });
        });

        $('.c-progress-bar').on('progress-retry', function() {
            $('.test__try-message').append('<div>progress-retry triggered!</div>');
        });
    };

    bindEvents();
});
