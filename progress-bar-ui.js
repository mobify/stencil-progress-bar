define([
    'selectorLibrary'
], function($) {

    var points = {
        q1: [[22.5,22.5], [45,22.5], [45,45]],
        q2: [[22.5,22.5], [45,22.5], [45,45], [0,45]],
        q3: [[22.5,22.5], [45,22.5], [45,45], [0,45], [0,0]],
        q4: [[22.5,22.5], [45,22.5], [45,45], [0,45], [0,0], [45,0], [22.5,0], [45,0]]
    };

    var init = function(percentage) {
        var progress = percentage || 0;
        setProgress(progress);

        // svg defs are global
        // so, to ensure that each progress bar is clipping correctly, we need to give a unique id to each
        var $progressBars = $('.c-progress-bar');
        $progressBars.each(function(index, progressBar) {
            var $bar = $(progressBar);
            var id = _uuid();

            // for whatever reason, zepto can't select the clippath directly
            $bar.find('polygon').parent().attr('id', 'c-progress-clip-' + id);
            $bar.find('.c-progress-bar__spinner-progress').attr('clip-path', 'url(#c-progress-clip-' + id + ')');
        });

        _bindEvents();
    };

    var setProgress = function(percentage, element) {
        percentage = _clampPercentage(percentage);

        var progressBar = element || '.c-progress-bar';
        var $progressBar = $(progressBar);

        _updateBar(percentage, $progressBar);
        _updateSpinner(percentage, $progressBar);
        _updateText(percentage, $progressBar);

        $progressBar.attr('aria-valuenow', percentage);
    };

    var setState = function(state, label, element) {
        // Update labels and add the new state class
        var progressBar = element || '.c-progress-bar';
        var $progressBar = $(progressBar);

        $progressBar.each(function(index, bar) {
            var $bar = $(bar);
            var newClass = $bar.attr('class').replace(/(c-progress-bar--state-)\w*\s/, '$1' + state + ' ');
            $bar.attr('class', newClass);
            $bar.find('.c-progress-bar__label').text(label);
        });

        $progressBar.attr('aria-valuetext', label);
    };

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

    var _bindEvents = function() {
        $('.c-progress-bar').on('click', '.c-icon--retry', function() {
            $(this).parents('.c-progress-bar').trigger('progress-retry');
        });
    };

    return {
        init: init,
        setProgress: setProgress,
        setState: setState,
        'STATE_INPROGRESS': 'inprogress',
        'STATE_SUCCESS': 'success',
        'STATE_FAILURE': 'failure'
    };
});
