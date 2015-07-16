define([
    'selectorLibrary'
], function($) {

    var points = {
        q1: [[22.5,22.5], [45,22.5], [45,45]],
        q2: [[22.5,22.5], [45,22.5], [45,45], [0,45]],
        q3: [[22.5,22.5], [45,22.5], [45,45], [0,45], [0,0]],
        q4: [[22.5,22.5], [45,22.5], [45,45], [0,45], [0,0], [45,0], [22.5,0], [45,0]]
    };

    var defaults = {
        initialValue: 0
    };

    var ProgressBar = function ProgressBar($el, options) {
        this.$el = $el;
        this.options = $.extend(true, {}, defaults, options);

        this.setProgress(this.options.initialValue);
        _bindEvents(this.$el);
    };

    ProgressBar.prototype.setProgress = function setProgress(percentage) {
        percentage = _clampPercentage(percentage);

        _updateBar(percentage, this.$el);
        if (this.$el.find('svg').length) {
            _updateSpinner(percentage, this.$el);
        }
        _updateText(percentage, this.$el);

        this.$el.attr('aria-valuenow', percentage);
    };

    ProgressBar.prototype.setState = function setState(state, label) {
        // Update labels and add the new state class
        this.$el.each(function(index, bar) {
            var $bar = $(bar);
            var newClass = $bar.attr('class').replace(/(c-progress-bar--state-)\w*\s/, '$1' + state + ' ');
            $bar.attr('class', newClass);
            $bar.find('.c-progress-bar__label').text(label);
        });

        this.$el.attr('aria-valuetext', label);
    };


    // Utilities shared by all progress bar instances

    var _updateBar = function(percentage, $progressBar) {
        $progress = $progressBar.find('.c-progress-bar__progress');

        var inversePercent = -100 + (percentage * 100);
        var transformText = "translate3d(" + inversePercent + "%, 0, 0)";

        $progress.css("-webkit-transform", transformText);
        $progress.css("transform", transformText);
    };

    var _updateText = function(percentage, $progressBar) {
        var percentString = parseInt(percentage * 100, 10) + '%';

        $progressBar.find('.c-progress-bar__text').text(percentString);
        $progressBar.find('.c-progress-bar__status').text('Progress is ' + percentString);
    };

    var _updateSpinner = function(percentage, $progressBar) {
        var prevAngle = $progressBar.data('progressbar-angle') || 0;
        var angle = 360 * percentage;
        var $animations = $progressBar.find('animateTransform');

        var animating = $progressBar.data('progressbar-animating');

        // if a new animation is started while one is currently ongoing
        // everything will break
        // when this happens, quadrants will not wait for the previous animation to complete like they should
        // for some reason
        // so, if we're currently animating, don't start another animation
        // TODO: we don't want to lose any progress, so save the value we tried to animate it to
        if (animating) {
            //$progressBar.data('progressbar-next', percentage);
            return;
        }

        var direction = angle > prevAngle ? 'clockwise': 'counterclockwise';
        _setAnimationOrder(direction, $animations);

        var startAnimationIndex = -1;
        var angleToDeplete = angle;

        $animations.each(function(index, animation) {
            var $animation = $(animation);

            // We want to animate from the last animation's position for max smoothness
            var from = $animation.attr('to') || '-90 22.5 22.5';
            var to;

            // Go through each quadrant and give it up to 90 to rotate
            // If there is any angle remaining, move on to the next quadrant
            if (angleToDeplete >= 90) {
                to = '0 22.5 22.5';
                angleToDeplete -= 90;
            } else {
                to = (angleToDeplete - 90) + ' 22.5 22.5';
                angleToDeplete = 0;
            }

            $animation.attr({
                from: from,
                to: to
            });

            // We always want to start the animation on the first quadrant (depending on the direction) that has changed
            // If to and from are the same, this quadrant doesn't actually change
            // So we don't want to start the animation here as it will add an unnecessary delay
            // If we're going clockwise, we want to stop at the first quadrant that has changed
            // If we're going counter clockwise, we want to stop at the last quadrant that has changed
            if (direction === 'clockwise') {
                if (to !== from && startAnimationIndex === -1) {
                    startAnimationIndex = index;
                }
            } else {
                if (to !== from) {
                    startAnimationIndex = index;
                }
            }
        });

        if (startAnimationIndex === -1) {
            // we couldn't find an element that changed, so no animation required
            return;
        }

        $animations[startAnimationIndex].beginElement();

        $progressBar.data('progressbar-angle', angle);
        $progressBar.data('progressbar-animating', true);

    };

    var _setAnimationOrder = function(order, $animations) {
        $animations.each(function(index, animation) {
            var $animation = $(animation);
            var begin;

            if (order === 'clockwise') {
                if (index === 0) {
                    begin = 'indefinite';
                } else {
                    begin = 'anim' + index + '.end';
                }
            } else {
                if (index === 3) {
                    begin = 'indefinite';
                } else {
                    begin = 'anim' + (index + 2) + '.end';
                }
            }

            $animation.attr('begin', begin);
        });
    };

    var _clampPercentage = function(percentage) {
        if (percentage > 1) {
            percentage = 1;
        } else if (percentage < 0) {
            percentage = 0;
        }

        return percentage;
    };

    var _uuid = (function() {
        var counter = 0;

        return function() {
            return counter++;
        };
    })();

    var _bindEvents = function($progressBar) {
        $progressBar.on('click', '.c-icon--retry', function() {
            $(this).parents('.c-progress-bar').trigger('progress-retry');
        });


        $progressBar.find('animateTransform').on('end', function() {
            var $progressBar = $(this).parents('.c-progress-bar');

            $progressBar.data('progressbar-animating', false);

            // if next, run it
            if ($progressBar.data('progressbar-next')) {
                //_animateRadialBar($progressBar.data('progressbar-next'), $progressBar);
            }
        });

    };

    return {
        init: function($el, options) {
            // If not already initialized, create it and expose it through the data method.
            // Also, expose a separate instance for each progress bar
            $el.each(function(index, progressBar) {
                var $bar = $(progressBar);
                var id = _uuid();

                if (!$bar.data('progressbar')) {
                    $bar.data('progressbar', new ProgressBar($bar, options));
                }

                // svg defs are global
                // so, to ensure that each progress bar is clipping correctly, we need to give a unique id to each
                // for whatever reason, zepto can't select the clippath directly
                // $bar.find('polygon').parent().attr('id', 'c-progress-clip-' + id);
                // $bar.find('.c-progress-bar__spinner-progress').attr('clip-path', 'url(#c-progress-clip-' + id + ')');
            });
        },
        'STATE_INPROGRESS': 'inprogress',
        'STATE_SUCCESS': 'success',
        'STATE_FAILURE': 'failure'
    };
});
