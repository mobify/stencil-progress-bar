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
        _updateSpinner(percentage, this.$el);
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


    // Utilities shared by all progress bar instances

    var _updateBar = function(percentage, $progressBar) {
        $progress = $progressBar.find('.c-progress-bar__progress');

        var inversePercent = -100 + (percentage * 100);
        var transformText = "translate3d(" + inversePercent + "%, 0, 0)";

        $progress.css("-webkit-transform", transformText);
        $progress.css("transform", transformText);
    };

    var _updateSpinner = function(percentage, $progressBar) {
        var points = _findSpinnerPolygonPoints(percentage);
        _drawSpinnerPolygon(points, $progressBar);
    };

    var _updateText = function(percentage, $progressBar) {
        var percentString = parseInt(percentage * 100, 10) + '%';

        $progressBar.find('.c-progress-bar__text').text(percentString);
        $progressBar.find('.c-progress-bar__status').text('Progress is ' + percentString);
    };

    var _findSpinnerPolygonPoints = function(percentage) {
        // get angle from percent
        var cx = 22.5;
        var cy = 22.5;

        // use a larger radius than the actual radius to account for the stroke
        var r = 25;
        var currentPoints;

        var angle = Math.PI * 2 * percentage;

        var x = cx + (r * Math.cos(angle));
        var y = cy + (r * Math.sin(angle));

        // determine quadrant so we know which other points to draw
        if (percentage <= 0.25) {
            currentPoints = points.q1.slice();
        } else if (percentage > 0.25 && percentage <= 0.5) {
            currentPoints = points.q2.slice();
        } else if (percentage > 0.5 && percentage <= 0.75) {
            currentPoints = points.q3.slice();
        } else if (percentage > 0.75) {
            currentPoints = points.q4.slice();
        }

        currentPoints.push([x, y]);
        return currentPoints;
    };

    var _drawSpinnerPolygon = function(newPoints, $progressBar) {
        var pointsString = newPoints.reduce(function(prevVal, point, index) {
            return prevVal += " " + point[0] + "," + point[1];
        }, '');

        $progressBar.find('svg polygon').attr('points', pointsString);
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
                $bar.find('polygon').parent().attr('id', 'c-progress-clip-' + id);
                $bar.find('.c-progress-bar__spinner-progress').attr('clip-path', 'url(#c-progress-clip-' + id + ')');
            });
        }
    };
});
