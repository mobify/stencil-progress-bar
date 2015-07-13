define([
    'selectorLibrary'
], function($) {

    var points = {
        q1: [[22.5,22.5], [45,22.5], [45,45]],
        q2: [[22.5,22.5], [45,22.5], [45,45], [0,45]],
        q3: [[22.5,22.5], [45,22.5], [45,45], [0,45], [0,0]],
        q4: [[22.5,22.5], [45,22.5], [45,45], [0,45], [0,0], [45,0], [22.5,0], [45,0]]
    };

    var init = function() {
        bindEvents();

        setProgress(0.65);
    };

    var setProgress = function(percentage) {
        var percentString = percentage * 100 + '%'

        $('.c-progress-bar__progress').width(percentString);
        $('.c-progress-bar__text').text(percentString);
        calcPoint(percentage);
    };

    var calcPoint = function(percentage) {
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

        drawPolygon(currentPoints);
    };

    var drawPolygon = function(newPoints) {
        var pointsString = newPoints.reduce(function(prevVal, point, index) {
            return prevVal += " " + point[0] + "," + point[1];
        }, '');

        $('svg polygon').attr('points', pointsString);
    };

    var bindEvents = function() {
        $('.c-progress-bar').on('progressChanged', function(e, percentage) {
            setProgress(percentage);
        });
    };

    return {
        init: init,
        setProgress: setProgress
    };
});
