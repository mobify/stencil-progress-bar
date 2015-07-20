define([
    '$',
    'deckard'
], function($) {

    // Utilities

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

    // Use this to throttle requests to __updateSpinner
    // We need to store all this data for each 'instance' so they don't affect one another
    // Specifically, so they don't throttle each other
    var _throttle = function(fn, limit) {

        return function (percentage, $progressBar) {
            var context = this;
            var instance = $progressBar.data('progressbar-timer');

            instance.timerArgs = arguments;

            // Unless there is already an ongoing animation, we can skip the timer
            if (instance.skipTimer || instance.skipTimer === undefined) {

                fn.apply(context, instance.timerArgs);
                instance.skipTimer = false;

                // if this animation completes without a timer being started
                // the next one doesn't need to wait
                setTimeout(function() {
                    if (!instance.timer) {
                        instance.skipTimer = true;
                    }
                }, limit);
                return;
            }

            if (!instance.timer) {
                instance.timer = setTimeout(function() {
                    fn.apply(context, instance.timerArgs);

                    instance.timer = null;
                    instance.skipTimer = true;
                }, limit);
            }
        };
    };


    var defaults = {
        initialValue: 0
    };

    var ProgressBar = function ProgressBar($el, options) {
        this.$el = $el;
        this.options = $.extend(true, {}, defaults, options);

        _setUniqueIds(this.$el);
        _bindEvents(this.$el);

        // this object will store timer information that allows the animation to be throttled
        this.$el.data('progressbar-timer', {});

        this.setProgress(this.options.initialValue);
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
            var newClass = $bar.attr('class').replace(/c--(progress|success|error)\s/, 'c--' + state + ' ');
            $bar.attr('class', newClass);
            $bar.find('.c-progress-bar__label').text(label);
        });

        this.$el.attr('aria-valuetext', label);
    };


    // Methods shared by all progress bar instances

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

    var __updateSpinner = function(percentage, $progressBar) {
        var prevAngle = $progressBar.data('progressbar-angle') || 0;
        var angle = 360 * percentage;
        var $animations = $progressBar.find('animateTransform');

        var direction = angle > prevAngle ? 'clockwise': 'counterclockwise';

        var startAnimationIndex = -1;
        var angleToDeplete = angle;

        $animations.each(function(index, animation) {
            var $animation = $(animation);
            $animation.attr('begin', 'indefinite');

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

        _setAnimationOrder(direction, $progressBar, $animations);

        $animations[startAnimationIndex].beginElement();

        $progressBar.data('progressbar-angle', angle);
    };

    // If a new animation is started while one is currently ongoing,
    // quadrants will not wait for the previous animation to complete like they should
    // The solution: if we're currently animating, don't start another animation!
    // Throttle requests to _updateSpinner to one every 0.5s
    // As that's how long it takes the animation to complete
    var _updateSpinner = _throttle(__updateSpinner, 500);

    var _setAnimationOrder = function(order, $progressBar, $animations) {
        var id = $progressBar.data('progressbar-clipid');

        $animations.each(function(index, animation) {
            var $animation = $(animation);
            var begin;

            if (order === 'clockwise') {
                if (index === 0) {
                    begin = 'indefinite';
                } else {
                    begin = 'anim__' + id + '_' + (index - 1) + '.end';
                }
            } else {
                if (index === 3) {
                    begin = 'indefinite';
                } else {
                    begin = 'anim__' + id + '_' + (index + 1) + '.end';
                }
            }

            $animation.attr('begin', begin);
        });
    };

    var _bindEvents = function($progressBar) {
        $progressBar.on('click', '.c-icon--retry', function() {
            $(this).parents('.c-progress-bar').trigger('progress-retry');
        });

        // For whatever reason, Firefox really really doesn't like fill="freeze"
        // If fill="freeze", Firefox act as if the animation never fully ended
        // If any of the animationTransition elements' attributes are changed
        // they will immediately animation instead of waiting for the previous animation to finish
        // Because fill="freeze" is what makes the effect of the animation stay after it is completed
        // We need to fake that behaviour
        // This works but is suuuuuper janky :(
        if ($.browser.firefox) {
            $progressBar.find('animateTransform').on('progressend', function() {
                var $this = $(this);
                var to = $(this).attr('to');

                $(this).parent().attr('transform', 'rotate(' + to + ')');
            });
        }

    };

    // svg defs are global
    // so, to ensure that each progress bar is clipping correctly, we need to give a unique id to each
    // unfortunately, this means we have to set a lot of ids :(
    var _setUniqueIds = function($progressBar) {
        var id = _uuid();

        $progressBar.data('progressbar-clipid', id);

        // the first four clip paths represent the quadrants
        // these are the same between all progress bars, so we won't worry about them
        // the next four are the unique clipping paths
        // using this weird selector because zepto apparently can't select clippath directly
        var $uniqueClippingPaths = $progressBar.find('rect').parent().slice(4);
        var $progressCircles = $progressBar.find('.c-progress-bar__spinner-progress');

        $uniqueClippingPaths.each(function(index, clippingPath) {
            var $clippingPath = $(clippingPath);
            var clipId = 'progress-bar-' + id + '__clip-' + index;

            $clippingPath.attr('id', clipId);
            $progressCircles.eq(index).attr('clip-path', 'url(#' + clipId + ')');

            // the animation ids cannot include dashes
            // if a dash is included in the begin attribute, the animation will not begin
            // for example, begin="other-anim.end" will never run
            // but begin="otheranim.end" will run
            // also, Firefox doesn't like animation ids that start with numbers
            $clippingPath.find('animateTransform').attr('id', 'anim__' + id + '_' + index);
        });
    };

    return {
        init: function($el, options) {
            if ($.browser.firefox) {
                $animation = $el.find('animateTransform');
                $animation.attr('fill', 'remove');
                $animation.attr('onend', '$(this).trigger("progressend")');
            }

            // If not already initialized, create it and expose it through the data method.
            // Also, expose a separate instance for each progress bar
            $el.each(function(index, progressBar) {
                var $bar = $(progressBar);

                if (!$bar.data('progressbar')) {
                    $bar.data('progressbar', new ProgressBar($bar, options));
                }
            });
        }
    };
});
