/* nvd3 version 1.8.3 (https://github.com/novus/nvd3) 2016-04-26 */
(function(){

// set up main nv object
var nv = {};

// the major global objects under the nv namespace
nv.dev = false; //set false when in production
nv.tooltip = nv.tooltip || {}; // For the tooltip system
nv.utils = nv.utils || {}; // Utility subsystem
nv.models = nv.models || {}; //stores all the possible models/components
nv.charts = {}; //stores all the ready to use charts
nv.logs = {}; //stores some statistics and potential error messages
nv.dom = {}; //DOM manipulation functions

// Node/CommonJS - require D3
if (typeof(module) !== 'undefined' && typeof(exports) !== 'undefined' && typeof(d3) == 'undefined') {
    d3 = require('d3');
}

nv.dispatch = d3.dispatch('render_start', 'render_end');

// Function bind polyfill
// Needed ONLY for phantomJS as it's missing until version 2.0 which is unreleased as of this comment
// https://github.com/ariya/phantomjs/issues/10522
// http://kangax.github.io/compat-table/es5/#Function.prototype.bind
// phantomJS is used for running the test suite
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}

//  Development render timers - disabled if dev = false
if (nv.dev) {
    nv.dispatch.on('render_start', function(e) {
        nv.logs.startTime = +new Date();
    });

    nv.dispatch.on('render_end', function(e) {
        nv.logs.endTime = +new Date();
        nv.logs.totalTime = nv.logs.endTime - nv.logs.startTime;
        nv.log('total', nv.logs.totalTime); // used for development, to keep track of graph generation times
    });
}

// Logs all arguments, and returns the last so you can test things in place
// Note: in IE8 console.log is an object not a function, and if modernizr is used
// then calling Function.prototype.bind with with anything other than a function
// causes a TypeError to be thrown.
nv.log = function() {
    if (nv.dev && window.console && console.log && console.log.apply)
        console.log.apply(console, arguments);
    else if (nv.dev && window.console && typeof console.log == "function" && Function.prototype.bind) {
        var log = Function.prototype.bind.call(console.log, console);
        log.apply(console, arguments);
    }
    return arguments[arguments.length - 1];
};

// print console warning, should be used by deprecated functions
nv.deprecated = function(name, info) {
    if (console && console.warn) {
        console.warn('nvd3 warning: `' + name + '` has been deprecated. ', info || '');
    }
};

// The nv.render function is used to queue up chart rendering
// in non-blocking async functions.
// When all queued charts are done rendering, nv.dispatch.render_end is invoked.
nv.render = function render(step) {
    // number of graphs to generate in each timeout loop
    step = step || 1;

    nv.render.active = true;
    nv.dispatch.render_start();

    var renderLoop = function() {
        var chart, graph;

        for (var i = 0; i < step && (graph = nv.render.queue[i]); i++) {
            chart = graph.generate();
            if (typeof graph.callback == typeof(Function)) graph.callback(chart);
        }

        nv.render.queue.splice(0, i);

        if (nv.render.queue.length) {
            setTimeout(renderLoop);
        }
        else {
            nv.dispatch.render_end();
            nv.render.active = false;
        }
    };

    setTimeout(renderLoop);
};

nv.render.active = false;
nv.render.queue = [];

/*
Adds a chart to the async rendering queue. This method can take arguments in two forms:
nv.addGraph({
    generate: <Function>
    callback: <Function>
})

or

nv.addGraph(<generate Function>, <callback Function>)

The generate function should contain code that creates the NVD3 model, sets options
on it, adds data to an SVG element, and invokes the chart model. The generate function
should return the chart model.  See examples/lineChart.html for a usage example.

The callback function is optional, and it is called when the generate function completes.
*/
nv.addGraph = function(obj) {
    if (typeof arguments[0] === typeof(Function)) {
        obj = {generate: arguments[0], callback: arguments[1]};
    }

    nv.render.queue.push(obj);

    if (!nv.render.active) {
        nv.render();
    }
};

// Node/CommonJS exports
if (typeof(module) !== 'undefined' && typeof(exports) !== 'undefined') {
  module.exports = nv;
}

if (typeof(window) !== 'undefined') {
  window.nv = nv;
}
/* Facade for queueing DOM write operations
 * with Fastdom (https://github.com/wilsonpage/fastdom)
 * if available.
 * This could easily be extended to support alternate
 * implementations in the future.
 */
nv.dom.write = function(callback) {
	if (window.fastdom !== undefined) {
		return fastdom.mutate(callback);
	}
	return callback();
};

/* Facade for queueing DOM read operations
 * with Fastdom (https://github.com/wilsonpage/fastdom)
 * if available.
 * This could easily be extended to support alternate
 * implementations in the future.
 */
nv.dom.read = function(callback) {
	if (window.fastdom !== undefined) {
		return fastdom.measure(callback);
	}
	return callback();
};
/* Utility class to handle creation of an interactive layer.
 This places a rectangle on top of the chart. When you mouse move over it, it sends a dispatch
 containing the X-coordinate. It can also render a vertical line where the mouse is located.

 dispatch.elementMousemove is the important event to latch onto.  It is fired whenever the mouse moves over
 the rectangle. The dispatch is given one object which contains the mouseX/Y location.
 It also has 'pointXValue', which is the conversion of mouseX to the x-axis scale.
 */
nv.interactiveGuideline = function() {
    "use strict";

    var margin = { left: 0, top: 0 } //Pass the chart's top and left magins. Used to calculate the mouseX/Y.
        ,   width = null
        ,   height = null
        ,   xScale = d3.scale.linear()
        ,   dispatch = d3.dispatch('elementMousemove', 'elementMouseout', 'elementClick', 'elementDblclick', 'elementMouseDown', 'elementMouseUp')
        ,   showGuideLine = true
        ,   svgContainer = null // Must pass the chart's svg, we'll use its mousemove event.
        ,   tooltip = nv.models.tooltip()
        ,   isMSIE = "ActiveXObject" in window // Checkt if IE by looking for activeX.
    ;

    tooltip
        .duration(0)
        .hideDelay(0)
        .hidden(false);

    function layer(selection) {
        selection.each(function(data) {
            var container = d3.select(this);
            var availableWidth = (width || 960), availableHeight = (height || 400);
            var wrap = container.selectAll("g.nv-wrap.nv-interactiveLineLayer")
                .data([data]);
            var wrapEnter = wrap.enter()
                .append("g").attr("class", " nv-wrap nv-interactiveLineLayer");
            wrapEnter.append("g").attr("class","nv-interactiveGuideLine");

            if (!svgContainer) {
                return;
            }

            function mouseHandler() {
                var d3mouse = d3.mouse(this);
                var mouseX = d3mouse[0];
                var mouseY = d3mouse[1];
                var subtractMargin = true;
                var mouseOutAnyReason = false;
                if (isMSIE) {
                    /*
                     D3.js (or maybe SVG.getScreenCTM) has a nasty bug in Internet Explorer 10.
                     d3.mouse() returns incorrect X,Y mouse coordinates when mouse moving
                     over a rect in IE 10.
                     However, d3.event.offsetX/Y also returns the mouse coordinates
                     relative to the triggering <rect>. So we use offsetX/Y on IE.
                     */
                    mouseX = d3.event.offsetX;
                    mouseY = d3.event.offsetY;

                    /*
                     On IE, if you attach a mouse event listener to the <svg> container,
                     it will actually trigger it for all the child elements (like <path>, <circle>, etc).
                     When this happens on IE, the offsetX/Y is set to where ever the child element
                     is located.
                     As a result, we do NOT need to subtract margins to figure out the mouse X/Y
                     position under this scenario. Removing the line below *will* cause
                     the interactive layer to not work right on IE.
                     */
                    if(d3.event.target.tagName !== "svg") {
                        subtractMargin = false;
                    }

                    if (d3.event.target.className.baseVal.match("nv-legend")) {
                        mouseOutAnyReason = true;
                    }

                }

                if(subtractMargin) {
                    mouseX -= margin.left;
                    mouseY -= margin.top;
                }

                /* If mouseX/Y is outside of the chart's bounds,
                 trigger a mouseOut event.
                 */
                if (d3.event.type === 'mouseout'
                    || mouseX < 0 || mouseY < 0
                    || mouseX > availableWidth || mouseY > availableHeight
                    || (d3.event.relatedTarget && d3.event.relatedTarget.ownerSVGElement === undefined)
                    || mouseOutAnyReason
                    ) {

                    if (isMSIE) {
                        if (d3.event.relatedTarget
                            && d3.event.relatedTarget.ownerSVGElement === undefined
                            && (d3.event.relatedTarget.className === undefined
                                || d3.event.relatedTarget.className.match(tooltip.nvPointerEventsClass))) {

                            return;
                        }
                    }
                    dispatch.elementMouseout({
                        mouseX: mouseX,
                        mouseY: mouseY
                    });
                    layer.renderGuideLine(null); //hide the guideline
                    tooltip.hidden(true);
                    return;
                } else {
                    tooltip.hidden(false);
                }


                var scaleIsOrdinal = typeof xScale.rangeBands === 'function';
                var pointXValue = undefined;

                // Ordinal scale has no invert method
                if (scaleIsOrdinal) {
                    var elementIndex = d3.bisect(xScale.range(), mouseX) - 1;
                    // Check if mouseX is in the range band
                    if (xScale.range()[elementIndex] + xScale.rangeBand() >= mouseX) {
                        pointXValue = xScale.domain()[d3.bisect(xScale.range(), mouseX) - 1];
                    }
                    else {
                        dispatch.elementMouseout({
                            mouseX: mouseX,
                            mouseY: mouseY
                        });
                        layer.renderGuideLine(null); //hide the guideline
                        tooltip.hidden(true);
                        return;
                    }
                }
                else {
                    pointXValue = xScale.invert(mouseX);
                }

                dispatch.elementMousemove({
                    mouseX: mouseX,
                    mouseY: mouseY,
                    pointXValue: pointXValue
                });

                //If user double clicks the layer, fire a elementDblclick
                if (d3.event.type === "dblclick") {
                    dispatch.elementDblclick({
                        mouseX: mouseX,
                        mouseY: mouseY,
                        pointXValue: pointXValue
                    });
                }

                // if user single clicks the layer, fire elementClick
                if (d3.event.type === 'click') {
                    dispatch.elementClick({
                        mouseX: mouseX,
                        mouseY: mouseY,
                        pointXValue: pointXValue
                    });
                }

                // if user presses mouse down the layer, fire elementMouseDown
                if (d3.event.type === 'mousedown') {
                	dispatch.elementMouseDown({
                		mouseX: mouseX,
                		mouseY: mouseY,
                		pointXValue: pointXValue
                	});
                }

                // if user presses mouse down the layer, fire elementMouseUp
                if (d3.event.type === 'mouseup') {
                	dispatch.elementMouseUp({
                		mouseX: mouseX,
                		mouseY: mouseY,
                		pointXValue: pointXValue
                	});
                }
            }

            svgContainer
                .on("touchmove",mouseHandler)
                .on("mousemove",mouseHandler, true)
                .on("mouseout" ,mouseHandler,true)
                .on("mousedown" ,mouseHandler,true)
                .on("mouseup" ,mouseHandler,true)
                .on("dblclick" ,mouseHandler)
                .on("click", mouseHandler)
            ;

            layer.guideLine = null;
            //Draws a vertical guideline at the given X postion.
            layer.renderGuideLine = function(x) {
                if (!showGuideLine) return;
                if (layer.guideLine && layer.guideLine.attr("x1") === x) return;
                nv.dom.write(function() {
                    var line = wrap.select(".nv-interactiveGuideLine")
                        .selectAll("line")
                        .data((x != null) ? [nv.utils.NaNtoZero(x)] : [], String);
                    line.enter()
                        .append("line")
                        .attr("class", "nv-guideline")
                        .attr("x1", function(d) { return d;})
                        .attr("x2", function(d) { return d;})
                        .attr("y1", availableHeight)
                        .attr("y2",0);
                    line.exit().remove();
                });
            }
        });
    }

    layer.dispatch = dispatch;
    layer.tooltip = tooltip;

    layer.margin = function(_) {
        if (!arguments.length) return margin;
        margin.top    = typeof _.top    != 'undefined' ? _.top    : margin.top;
        margin.left   = typeof _.left   != 'undefined' ? _.left   : margin.left;
        return layer;
    };

    layer.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return layer;
    };

    layer.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return layer;
    };

    layer.xScale = function(_) {
        if (!arguments.length) return xScale;
        xScale = _;
        return layer;
    };

    layer.showGuideLine = function(_) {
        if (!arguments.length) return showGuideLine;
        showGuideLine = _;
        return layer;
    };

    layer.svgContainer = function(_) {
        if (!arguments.length) return svgContainer;
        svgContainer = _;
        return layer;
    };

    return layer;
};

/* Utility class that uses d3.bisect to find the index in a given array, where a search value can be inserted.
 This is different from normal bisectLeft; this function finds the nearest index to insert the search value.

 For instance, lets say your array is [1,2,3,5,10,30], and you search for 28.
 Normal d3.bisectLeft will return 4, because 28 is inserted after the number 10.  But interactiveBisect will return 5
 because 28 is closer to 30 than 10.

 Unit tests can be found in: interactiveBisectTest.html

 Has the following known issues:
 * Will not work if the data points move backwards (ie, 10,9,8,7, etc) or if the data points are in random order.
 * Won't work if there are duplicate x coordinate values.
 */
nv.interactiveBisect = function (values, searchVal, xAccessor) {
    "use strict";
    if (! (values instanceof Array)) {
        return null;
    }
    var _xAccessor;
    if (typeof xAccessor !== 'function') {
        _xAccessor = function(d) {
            return d.x;
        }
    } else {
        _xAccessor = xAccessor;
    }
    var _cmp = function(d, v) {
        // Accessors are no longer passed the index of the element along with
        // the element itself when invoked by d3.bisector.
        //
        // Starting at D3 v3.4.4, d3.bisector() started inspecting the
        // function passed to determine if it should consider it an accessor
        // or a comparator. This meant that accessors that take two arguments
        // (expecting an index as the second parameter) are treated as
        // comparators where the second argument is the search value against
        // which the first argument is compared.
        return _xAccessor(d) - v;
    };

    var bisect = d3.bisector(_cmp).left;
    var index = d3.max([0, bisect(values,searchVal) - 1]);
    var currentValue = _xAccessor(values[index]);

    if (typeof currentValue === 'undefined') {
        currentValue = index;
    }

    if (currentValue === searchVal) {
        return index; //found exact match
    }

    var nextIndex = d3.min([index+1, values.length - 1]);
    var nextValue = _xAccessor(values[nextIndex]);

    if (typeof nextValue === 'undefined') {
        nextValue = nextIndex;
    }

    if (Math.abs(nextValue - searchVal) >= Math.abs(currentValue - searchVal)) {
        return index;
    } else {
        return nextIndex
    }
};

/*
 Returns the index in the array "values" that is closest to searchVal.
 Only returns an index if searchVal is within some "threshold".
 Otherwise, returns null.
 */
nv.nearestValueIndex = function (values, searchVal, threshold) {
    "use strict";
    var yDistMax = Infinity, indexToHighlight = null;
    values.forEach(function(d,i) {
        var delta = Math.abs(searchVal - d);
        if ( d != null && delta <= yDistMax && delta < threshold) {
            yDistMax = delta;
            indexToHighlight = i;
        }
    });
    return indexToHighlight;
};

/* Model which can be instantiated to handle tooltip rendering.
 Example usage:
 var tip = nv.models.tooltip().gravity('w').distance(23)
 .data(myDataObject);

 tip();    //just invoke the returned function to render tooltip.
 */
nv.models.tooltip = function() {
    "use strict";

    /*
    Tooltip data. If data is given in the proper format, a consistent tooltip is generated.
    Example Format of data:
    {
        key: "Date",
        value: "August 2009",
        series: [
            {key: "Series 1", value: "Value 1", color: "#000"},
            {key: "Series 2", value: "Value 2", color: "#00f"}
        ]
    }
    */
    var id = "nvtooltip-" + Math.floor(Math.random() * 100000) // Generates a unique id when you create a new tooltip() object.
        ,   data = null
        ,   gravity = 'w'   // Can be 'n','s','e','w'. Determines how tooltip is positioned.
        ,   distance = 25 // Distance to offset tooltip from the mouse location.
        ,   snapDistance = 0   // Tolerance allowed before tooltip is moved from its current position (creates 'snapping' effect)
        ,   classes = null  // Attaches additional CSS classes to the tooltip DIV that is created.
        ,   chartContainer = null // Parent dom element of the SVG that holds the chart.
        ,   hidden = true  // Start off hidden, toggle with hide/show functions below.
        ,   hideDelay = 200  // Delay (in ms) before the tooltip hides after calling hide().
        ,   tooltip = null // d3 select of the tooltip div.
        ,   lastPosition = { left: null, top: null } // Last position the tooltip was in.
        ,   enabled = true  // True -> tooltips are rendered. False -> don't render tooltips.
        ,   duration = 100 // Tooltip movement duration, in ms.
        ,   headerEnabled = true // If is to show the tooltip header.
        ,   nvPointerEventsClass = "nv-pointer-events-none" // CSS class to specify whether element should not have mouse events.
    ;

    /*
     Function that returns the position (relative to the viewport) the tooltip should be placed in.
     Should return: {
        left: <leftPos>,
        top: <topPos>
     }
     */
    var position = function() {
        return {
            left: d3.event !== null ? d3.event.clientX : 0,
            top: d3.event !== null ? d3.event.clientY : 0
        };
    };

    // Format function for the tooltip values column.
    var valueFormatter = function(d, i) {
        return d;
    };

    // Format function for the tooltip header value.
    var headerFormatter = function(d) {
        return d;
    };

    var keyFormatter = function(d, i) {
        return d;
    };

    // By default, the tooltip model renders a beautiful table inside a DIV.
    // You can override this function if a custom tooltip is desired.
    var contentGenerator = function(d) {
        if (d === null) {
            return '';
        }

        var table = d3.select(document.createElement("table"));
        if (headerEnabled) {
            var theadEnter = table.selectAll("thead")
                .data([d])
                .enter().append("thead");

            theadEnter.append("tr")
                .append("td")
                .attr("colspan", 3)
                .append("strong")
                .classed("x-value", true)
                .html(headerFormatter(d.value));
        }

        var tbodyEnter = table.selectAll("tbody")
            .data([d])
            .enter().append("tbody");

        var trowEnter = tbodyEnter.selectAll("tr")
                .data(function(p) { return p.series})
                .enter()
                .append("tr")
                .classed("highlight", function(p) { return p.highlight});

        trowEnter.append("td")
            .classed("legend-color-guide",true)
            .append("div")
            .style("background-color", function(p) { return p.color});

        trowEnter.append("td")
            .classed("key",true)
            .classed("total",function(p) { return !!p.total})
            .html(function(p, i) { return keyFormatter(p.key, i)});

        trowEnter.append("td")
            .classed("value",true)
            .html(function(p, i) { return valueFormatter(p.value, i) });

        trowEnter.selectAll("td").each(function(p) {
            if (p.highlight) {
                var opacityScale = d3.scale.linear().domain([0,1]).range(["#fff",p.color]);
                var opacity = 0.6;
                d3.select(this)
                    .style("border-bottom-color", opacityScale(opacity))
                    .style("border-top-color", opacityScale(opacity))
                ;
            }
        });

        var html = table.node().outerHTML;
        if (d.footer !== undefined)
            html += "<div class='footer'>" + d.footer + "</div>";
        return html;

    };

    var dataSeriesExists = function(d) {
        if (d && d.series) {
            if (nv.utils.isArray(d.series)) {
                return true;
            }
            // if object, it's okay just convert to array of the object
            if (nv.utils.isObject(d.series)) {
                d.series = [d.series];
                return true;
            }
        }
        return false;
    };

    // Calculates the gravity offset of the tooltip. Parameter is position of tooltip
    // relative to the viewport.
    var calcGravityOffset = function(pos) {
        var height = tooltip.node().offsetHeight,
            width = tooltip.node().offsetWidth,
            clientWidth = document.documentElement.clientWidth, // Don't want scrollbars.
            clientHeight = document.documentElement.clientHeight, // Don't want scrollbars.
            left, top, tmp;

        // calculate position based on gravity
        switch (gravity) {
            case 'e':
                left = - width - distance;
                top = - (height / 2);
                if(pos.left + left < 0) left = distance;
                if((tmp = pos.top + top) < 0) top -= tmp;
                if((tmp = pos.top + top + height) > clientHeight) top -= tmp - clientHeight;
                break;
            case 'w':
                left = distance;
                top = - (height / 2);
                if (pos.left + left + width > clientWidth) left = - width - distance;
                if ((tmp = pos.top + top) < 0) top -= tmp;
                if ((tmp = pos.top + top + height) > clientHeight) top -= tmp - clientHeight;
                break;
            case 'n':
                left = - (width / 2) - 5; // - 5 is an approximation of the mouse's height.
                top = distance;
                if (pos.top + top + height > clientHeight) top = - height - distance;
                if ((tmp = pos.left + left) < 0) left -= tmp;
                if ((tmp = pos.left + left + width) > clientWidth) left -= tmp - clientWidth;
                break;
            case 's':
                left = - (width / 2);
                top = - height - distance;
                if (pos.top + top < 0) top = distance;
                if ((tmp = pos.left + left) < 0) left -= tmp;
                if ((tmp = pos.left + left + width) > clientWidth) left -= tmp - clientWidth;
                break;
            case 'center':
                left = - (width / 2);
                top = - (height / 2);
                break;
            default:
                left = 0;
                top = 0;
                break;
        }

        return { 'left': left, 'top': top };
    };

    /*
     Positions the tooltip in the correct place, as given by the position() function.
     */
    var positionTooltip = function() {
        nv.dom.read(function() {
            var pos = position(),
                gravityOffset = calcGravityOffset(pos),
                left = pos.left + gravityOffset.left,
                top = pos.top + gravityOffset.top;

            // delay hiding a bit to avoid flickering
            if (hidden) {
                tooltip
                    .interrupt()
                    .transition()
                    .delay(hideDelay)
                    .duration(0)
                    .style('opacity', 0);
            } else {
                // using tooltip.style('transform') returns values un-usable for tween
                var old_translate = 'translate(' + lastPosition.left + 'px, ' + lastPosition.top + 'px)';
                var new_translate = 'translate(' + left + 'px, ' + top + 'px)';
                var translateInterpolator = d3.interpolateString(old_translate, new_translate);
                var is_hidden = tooltip.style('opacity') < 0.1;

                tooltip
                    .interrupt() // cancel running transitions
                    .transition()
                    .duration(is_hidden ? 0 : duration)
                    // using tween since some versions of d3 can't auto-tween a translate on a div
                    .styleTween('transform', function (d) {
                        return translateInterpolator;
                    }, 'important')
                    // Safari has its own `-webkit-transform` and does not support `transform`
                    .styleTween('-webkit-transform', function (d) {
                        return translateInterpolator;
                    })
                    .style('-ms-transform', new_translate)
                    .style('opacity', 1);
            }

            lastPosition.left = left;
            lastPosition.top = top;
        });
    };

    // Creates new tooltip container, or uses existing one on DOM.
    function initTooltip() {
        if (!tooltip || !tooltip.node()) {
            var container = chartContainer ? chartContainer : document.body;
            // Create new tooltip div if it doesn't exist on DOM.

            var data = [1];
            tooltip = d3.select(container).selectAll('.nvtooltip').data(data);

            tooltip.enter().append('div')
                   .attr("class", "nvtooltip " + (classes ? classes : "xy-tooltip"))
                   .attr("id", id)
                   .style("top", 0).style("left", 0)
                   .style('opacity', 0)
                   .style('position', 'fixed')
                   .selectAll("div, table, td, tr").classed(nvPointerEventsClass, true)
                   .classed(nvPointerEventsClass, true);

            tooltip.exit().remove()
        }
    }

    // Draw the tooltip onto the DOM.
    function nvtooltip() {
        if (!enabled) return;
        if (!dataSeriesExists(data)) return;

        nv.dom.write(function () {
            initTooltip();
            // Generate data and set it into tooltip.
            // Bonus - If you override contentGenerator and return falsey you can use something like
            //         React or Knockout to bind the data for your tooltip.
            var newContent = contentGenerator(data);
            if (newContent) {
                tooltip.node().innerHTML = newContent;
            }

            positionTooltip();
        });

        return nvtooltip;
    }

    nvtooltip.nvPointerEventsClass = nvPointerEventsClass;
    nvtooltip.options = nv.utils.optionsFunc.bind(nvtooltip);

    nvtooltip._options = Object.create({}, {
        // simple read/write options
        duration: {get: function(){return duration;}, set: function(_){duration=_;}},
        gravity: {get: function(){return gravity;}, set: function(_){gravity=_;}},
        distance: {get: function(){return distance;}, set: function(_){distance=_;}},
        snapDistance: {get: function(){return snapDistance;}, set: function(_){snapDistance=_;}},
        classes: {get: function(){return classes;}, set: function(_){classes=_;}},
        chartContainer: {get: function(){return chartContainer;}, set: function(_){chartContainer=_;}},
        enabled: {get: function(){return enabled;}, set: function(_){enabled=_;}},
        hideDelay: {get: function(){return hideDelay;}, set: function(_){hideDelay=_;}},
        contentGenerator: {get: function(){return contentGenerator;}, set: function(_){contentGenerator=_;}},
        valueFormatter: {get: function(){return valueFormatter;}, set: function(_){valueFormatter=_;}},
        headerFormatter: {get: function(){return headerFormatter;}, set: function(_){headerFormatter=_;}},
        keyFormatter: {get: function(){return keyFormatter;}, set: function(_){keyFormatter=_;}},
        headerEnabled: {get: function(){return headerEnabled;}, set: function(_){headerEnabled=_;}},
        position: {get: function(){return position;}, set: function(_){position=_;}},

        // Deprecated options
        fixedTop: {get: function(){return null;}, set: function(_){
            // deprecated after 1.8.1
            nv.deprecated('fixedTop', 'feature removed after 1.8.1');
        }},
        offset: {get: function(){return {left: 0, top: 0};}, set: function(_){
            // deprecated after 1.8.1
            nv.deprecated('offset', 'use chart.tooltip.distance() instead');
        }},

        // options with extra logic
        hidden: {get: function(){return hidden;}, set: function(_){
            if (hidden != _) {
                hidden = !!_;
                nvtooltip();
            }
        }},
        data: {get: function(){return data;}, set: function(_){
            // if showing a single data point, adjust data format with that
            if (_.point) {
                _.value = _.point.x;
                _.series = _.series || {};
                _.series.value = _.point.y;
                _.series.color = _.point.color || _.series.color;
            }
            data = _;
        }},

        // read only properties
        node: {get: function(){return tooltip.node();}, set: function(_){}},
        id: {get: function(){return id;}, set: function(_){}}
    });

    nv.utils.initOptions(nvtooltip);
    return nvtooltip;
};


/*
Gets the browser window size

Returns object with height and width properties
 */
nv.utils.windowSize = function() {
    // Sane defaults
    var size = {width: 640, height: 480};

    // Most recent browsers use
    if (window.innerWidth && window.innerHeight) {
        size.width = window.innerWidth;
        size.height = window.innerHeight;
        return (size);
    }

    // IE can use depending on mode it is in
    if (document.compatMode=='CSS1Compat' &&
        document.documentElement &&
        document.documentElement.offsetWidth ) {

        size.width = document.documentElement.offsetWidth;
        size.height = document.documentElement.offsetHeight;
        return (size);
    }

    // Earlier IE uses Doc.body
    if (document.body && document.body.offsetWidth) {
        size.width = document.body.offsetWidth;
        size.height = document.body.offsetHeight;
        return (size);
    }

    return (size);
};


/* handle dumb browser quirks...  isinstance breaks if you use frames
typeof returns 'object' for null, NaN is a number, etc.
 */
nv.utils.isArray = Array.isArray;
nv.utils.isObject = function(a) {
    return a !== null && typeof a === 'object';
};
nv.utils.isFunction = function(a) {
    return typeof a === 'function';
};
nv.utils.isDate = function(a) {
    return toString.call(a) === '[object Date]';
};
nv.utils.isNumber = function(a) {
    return !isNaN(a) && typeof a === 'number';
};


/*
Binds callback function to run when window is resized
 */
nv.utils.windowResize = function(handler) {
    if (window.addEventListener) {
        window.addEventListener('resize', handler);
    } else {
        nv.log("ERROR: Failed to bind to window.resize with: ", handler);
    }
    // return object with clear function to remove the single added callback.
    return {
        callback: handler,
        clear: function() {
            window.removeEventListener('resize', handler);
        }
    }
};


/*
Backwards compatible way to implement more d3-like coloring of graphs.
Can take in nothing, an array, or a function/scale
To use a normal scale, get the range and pass that because we must be able
to take two arguments and use the index to keep backward compatibility
*/
nv.utils.getColor = function(color) {
    //if you pass in nothing, get default colors back
    if (color === undefined) {
        return nv.utils.defaultColor();

    //if passed an array, turn it into a color scale
    } else if(nv.utils.isArray(color)) {
        var color_scale = d3.scale.ordinal().range(color);
        return function(d, i) {
            var key = i === undefined ? d : i;
            return d.color || color_scale(key);
        };

    //if passed a function or scale, return it, or whatever it may be
    //external libs, such as angularjs-nvd3-directives use this
    } else {
        //can't really help it if someone passes rubbish as color
        return color;
    }
};


/*
Default color chooser uses a color scale of 20 colors from D3
 https://github.com/mbostock/d3/wiki/Ordinal-Scales#categorical-colors
 */
nv.utils.defaultColor = function() {
    // get range of the scale so we'll turn it into our own function.
    return nv.utils.getColor(d3.scale.category20().range());
};


/*
Returns a color function that takes the result of 'getKey' for each series and
looks for a corresponding color from the dictionary
*/
nv.utils.customTheme = function(dictionary, getKey, defaultColors) {
    // use default series.key if getKey is undefined
    getKey = getKey || function(series) { return series.key };
    defaultColors = defaultColors || d3.scale.category20().range();

    // start at end of default color list and walk back to index 0
    var defIndex = defaultColors.length;

    return function(series, index) {
        var key = getKey(series);
        if (nv.utils.isFunction(dictionary[key])) {
            return dictionary[key]();
        } else if (dictionary[key] !== undefined) {
            return dictionary[key];
        } else {
            // no match in dictionary, use a default color
            if (!defIndex) {
                // used all the default colors, start over
                defIndex = defaultColors.length;
            }
            defIndex = defIndex - 1;
            return defaultColors[defIndex];
        }
    };
};


/*
From the PJAX example on d3js.org, while this is not really directly needed
it's a very cool method for doing pjax, I may expand upon it a little bit,
open to suggestions on anything that may be useful
*/
nv.utils.pjax = function(links, content) {

    var load = function(href) {
        d3.html(href, function(fragment) {
            var target = d3.select(content).node();
            target.parentNode.replaceChild(
                d3.select(fragment).select(content).node(),
                target);
            nv.utils.pjax(links, content);
        });
    };

    d3.selectAll(links).on("click", function() {
        history.pushState(this.href, this.textContent, this.href);
        load(this.href);
        d3.event.preventDefault();
    });

    d3.select(window).on("popstate", function() {
        if (d3.event.state) {
            load(d3.event.state);
        }
    });
};


/*
For when we want to approximate the width in pixels for an SVG:text element.
Most common instance is when the element is in a display:none; container.
Forumla is : text.length * font-size * constant_factor
*/
nv.utils.calcApproxTextWidth = function (svgTextElem) {
    if (nv.utils.isFunction(svgTextElem.style) && nv.utils.isFunction(svgTextElem.text)) {
        var fontSize = parseInt(svgTextElem.style("font-size").replace("px",""), 10);
        var textLength = svgTextElem.text().length;
        return nv.utils.NaNtoZero(textLength * fontSize * 0.5);
    }
    return 0;
};


/*
Numbers that are undefined, null or NaN, convert them to zeros.
*/
nv.utils.NaNtoZero = function(n) {
    if (!nv.utils.isNumber(n)
        || isNaN(n)
        || n === null
        || n === Infinity
        || n === -Infinity) {

        return 0;
    }
    return n;
};

/*
Add a way to watch for d3 transition ends to d3
*/
d3.selection.prototype.watchTransition = function(renderWatch){
    var args = [this].concat([].slice.call(arguments, 1));
    return renderWatch.transition.apply(renderWatch, args);
};


/*
Helper object to watch when d3 has rendered something
*/
nv.utils.renderWatch = function(dispatch, duration) {
    if (!(this instanceof nv.utils.renderWatch)) {
        return new nv.utils.renderWatch(dispatch, duration);
    }

    var _duration = duration !== undefined ? duration : 250;
    var renderStack = [];
    var self = this;

    this.models = function(models) {
        models = [].slice.call(arguments, 0);
        models.forEach(function(model){
            model.__rendered = false;
            (function(m){
                m.dispatch.on('renderEnd', function(arg){
                    m.__rendered = true;
                    self.renderEnd('model');
                });
            })(model);

            if (renderStack.indexOf(model) < 0) {
                renderStack.push(model);
            }
        });
    return this;
    };

    this.reset = function(duration) {
        if (duration !== undefined) {
            _duration = duration;
        }
        renderStack = [];
    };

    this.transition = function(selection, args, duration) {
        args = arguments.length > 1 ? [].slice.call(arguments, 1) : [];

        if (args.length > 1) {
            duration = args.pop();
        } else {
            duration = _duration !== undefined ? _duration : 250;
        }
        selection.__rendered = false;

        if (renderStack.indexOf(selection) < 0) {
            renderStack.push(selection);
        }

        if (duration === 0) {
            selection.__rendered = true;
            selection.delay = function() { return this; };
            selection.duration = function() { return this; };
            return selection;
        } else {
            if (selection.length === 0) {
                selection.__rendered = true;
            } else if (selection.every( function(d){ return !d.length; } )) {
                selection.__rendered = true;
            } else {
                selection.__rendered = false;
            }

            var n = 0;
            return selection
                .transition()
                .duration(duration)
                .each(function(){ ++n; })
                .each('end', function(d, i) {
                    if (--n === 0) {
                        selection.__rendered = true;
                        self.renderEnd.apply(this, args);
                    }
                });
        }
    };

    this.renderEnd = function() {
        if (renderStack.every( function(d){ return d.__rendered; } )) {
            renderStack.forEach( function(d){ d.__rendered = false; });
            dispatch.renderEnd.apply(this, arguments);
        }
    }

};


/*
Takes multiple objects and combines them into the first one (dst)
example:  nv.utils.deepExtend({a: 1}, {a: 2, b: 3}, {c: 4});
gives:  {a: 2, b: 3, c: 4}
*/
nv.utils.deepExtend = function(dst){
    var sources = arguments.length > 1 ? [].slice.call(arguments, 1) : [];
    sources.forEach(function(source) {
        for (var key in source) {
            var isArray = nv.utils.isArray(dst[key]);
            var isObject = nv.utils.isObject(dst[key]);
            var srcObj = nv.utils.isObject(source[key]);

            if (isObject && !isArray && srcObj) {
                nv.utils.deepExtend(dst[key], source[key]);
            } else {
                dst[key] = source[key];
            }
        }
    });
};


/*
state utility object, used to track d3 states in the models
*/
nv.utils.state = function(){
    if (!(this instanceof nv.utils.state)) {
        return new nv.utils.state();
    }
    var state = {};
    var _self = this;
    var _setState = function(){};
    var _getState = function(){ return {}; };
    var init = null;
    var changed = null;

    this.dispatch = d3.dispatch('change', 'set');

    this.dispatch.on('set', function(state){
        _setState(state, true);
    });

    this.getter = function(fn){
        _getState = fn;
        return this;
    };

    this.setter = function(fn, callback) {
        if (!callback) {
            callback = function(){};
        }
        _setState = function(state, update){
            fn(state);
            if (update) {
                callback();
            }
        };
        return this;
    };

    this.init = function(state){
        init = init || {};
        nv.utils.deepExtend(init, state);
    };

    var _set = function(){
        var settings = _getState();

        if (JSON.stringify(settings) === JSON.stringify(state)) {
            return false;
        }

        for (var key in settings) {
            if (state[key] === undefined) {
                state[key] = {};
            }
            state[key] = settings[key];
            changed = true;
        }
        return true;
    };

    this.update = function(){
        if (init) {
            _setState(init, false);
            init = null;
        }
        if (_set.call(this)) {
            this.dispatch.change(state);
        }
    };

};


/*
Snippet of code you can insert into each nv.models.* to give you the ability to
do things like:
chart.options({
  showXAxis: true,
  tooltips: true
});

To enable in the chart:
chart.options = nv.utils.optionsFunc.bind(chart);
*/
nv.utils.optionsFunc = function(args) {
    if (args) {
        d3.map(args).forEach((function(key,value) {
            if (nv.utils.isFunction(this[key])) {
                this[key](value);
            }
        }).bind(this));
    }
    return this;
};


/*
numTicks:  requested number of ticks
data:  the chart data

returns the number of ticks to actually use on X axis, based on chart data
to avoid duplicate ticks with the same value
*/
nv.utils.calcTicksX = function(numTicks, data) {
    // find max number of values from all data streams
    var numValues = 1;
    var i = 0;
    for (i; i < data.length; i += 1) {
        var stream_len = data[i] && data[i].values ? data[i].values.length : 0;
        numValues = stream_len > numValues ? stream_len : numValues;
    }
    nv.log("Requested number of ticks: ", numTicks);
    nv.log("Calculated max values to be: ", numValues);
    // make sure we don't have more ticks than values to avoid duplicates
    numTicks = numTicks > numValues ? numTicks = numValues - 1 : numTicks;
    // make sure we have at least one tick
    numTicks = numTicks < 1 ? 1 : numTicks;
    // make sure it's an integer
    numTicks = Math.floor(numTicks);
    nv.log("Calculating tick count as: ", numTicks);
    return numTicks;
};


/*
returns number of ticks to actually use on Y axis, based on chart data
*/
nv.utils.calcTicksY = function(numTicks, data) {
    // currently uses the same logic but we can adjust here if needed later
    return nv.utils.calcTicksX(numTicks, data);
};


/*
Add a particular option from an options object onto chart
Options exposed on a chart are a getter/setter function that returns chart
on set to mimic typical d3 option chaining, e.g. svg.option1('a').option2('b');

option objects should be generated via Object.create() to provide
the option of manipulating data via get/set functions.
*/
nv.utils.initOption = function(chart, name) {
    // if it's a call option, just call it directly, otherwise do get/set
    if (chart._calls && chart._calls[name]) {
        chart[name] = chart._calls[name];
    } else {
        chart[name] = function (_) {
            if (!arguments.length) return chart._options[name];
            chart._overrides[name] = true;
            chart._options[name] = _;
            return chart;
        };
        // calling the option as _option will ignore if set by option already
        // so nvd3 can set options internally but the stop if set manually
        chart['_' + name] = function(_) {
            if (!arguments.length) return chart._options[name];
            if (!chart._overrides[name]) {
                chart._options[name] = _;
            }
            return chart;
        }
    }
};


/*
Add all options in an options object to the chart
*/
nv.utils.initOptions = function(chart) {
    chart._overrides = chart._overrides || {};
    var ops = Object.getOwnPropertyNames(chart._options || {});
    var calls = Object.getOwnPropertyNames(chart._calls || {});
    ops = ops.concat(calls);
    for (var i in ops) {
        nv.utils.initOption(chart, ops[i]);
    }
};


/*
Inherit options from a D3 object
d3.rebind makes calling the function on target actually call it on source
Also use _d3options so we can track what we inherit for documentation and chained inheritance
*/
nv.utils.inheritOptionsD3 = function(target, d3_source, oplist) {
    target._d3options = oplist.concat(target._d3options || []);
    oplist.unshift(d3_source);
    oplist.unshift(target);
    d3.rebind.apply(this, oplist);
};


/*
Remove duplicates from an array
*/
nv.utils.arrayUnique = function(a) {
    return a.sort().filter(function(item, pos) {
        return !pos || item != a[pos - 1];
    });
};


/*
Keeps a list of custom symbols to draw from in addition to d3.svg.symbol
Necessary since d3 doesn't let you extend its list -_-
Add new symbols by doing nv.utils.symbols.set('name', function(size){...});
*/
nv.utils.symbolMap = d3.map();


/*
Replaces d3.svg.symbol so that we can look both there and our own map
 */
nv.utils.symbol = function() {
    var type,
        size = 64;
    function symbol(d,i) {
        var t = type.call(this,d,i);
        var s = size.call(this,d,i);
        if (d3.svg.symbolTypes.indexOf(t) !== -1) {
            return d3.svg.symbol().type(t).size(s)();
        } else {
            return nv.utils.symbolMap.get(t)(s);
        }
    }
    symbol.type = function(_) {
        if (!arguments.length) return type;
        type = d3.functor(_);
        return symbol;
    };
    symbol.size = function(_) {
        if (!arguments.length) return size;
        size = d3.functor(_);
        return symbol;
    };
    return symbol;
};


/*
Inherit option getter/setter functions from source to target
d3.rebind makes calling the function on target actually call it on source
Also track via _inherited and _d3options so we can track what we inherit
for documentation generation purposes and chained inheritance
*/
nv.utils.inheritOptions = function(target, source) {
    // inherit all the things
    var ops = Object.getOwnPropertyNames(source._options || {});
    var calls = Object.getOwnPropertyNames(source._calls || {});
    var inherited = source._inherited || [];
    var d3ops = source._d3options || [];
    var args = ops.concat(calls).concat(inherited).concat(d3ops);
    args.unshift(source);
    args.unshift(target);
    d3.rebind.apply(this, args);
    // pass along the lists to keep track of them, don't allow duplicates
    target._inherited = nv.utils.arrayUnique(ops.concat(calls).concat(inherited).concat(ops).concat(target._inherited || []));
    target._d3options = nv.utils.arrayUnique(d3ops.concat(target._d3options || []));
};


/*
Runs common initialize code on the svg before the chart builds
*/
nv.utils.initSVG = function(svg) {
    svg.classed({'nvd3-svg':true});
};

/*
Sanitize and provide default for the container height.
*/
nv.utils.sanitizeHeight = function(height, container) {
    return (height || parseInt(container.style('height'), 10) || 400);
};


/*
Sanitize and provide default for the container width.
*/
nv.utils.sanitizeWidth = function(width, container) {
    return (width || parseInt(container.style('width'), 10) || 960);
};


/*
Calculate the available height for a chart.
*/
nv.utils.availableHeight = function(height, container, margin) {
    return Math.max(0,nv.utils.sanitizeHeight(height, container) - margin.top - margin.bottom);
};

/*
Calculate the available width for a chart.
*/
nv.utils.availableWidth = function(width, container, margin) {
    return Math.max(0,nv.utils.sanitizeWidth(width, container) - margin.left - margin.right);
};

/*
Clear any rendered chart components and display a chart's 'noData' message
*/
nv.utils.noData = function(chart, container) {
    var opt = chart.options(),
        margin = opt.margin(),
        noData = opt.noData(),
        data = (noData == null) ? ["No Data Available."] : [noData],
        height = nv.utils.availableHeight(null, container, margin),
        width = nv.utils.availableWidth(null, container, margin),
        x = margin.left + width/2,
        y = margin.top + height/2;

    //Remove any previously created chart components
    container.selectAll('g').remove();

    var noDataText = container.selectAll('.nv-noData').data(data);

    noDataText.enter().append('text')
        .attr('class', 'nvd3 nv-noData')
        .attr('dy', '-.7em')
        .style('text-anchor', 'middle');

    noDataText
        .attr('x', x)
        .attr('y', y)
        .text(function(t){ return t; });
};

/*
 Wrap long labels.
 */
nv.utils.wrapTicks = function (text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1,
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
};

/*
Check equality of 2 array
*/
nv.utils.arrayEquals = function (array1, array2) {
    if (array1 === array2)
        return true;

    if (!array1 || !array2)
        return false;

    // compare lengths - can save a lot of time 
    if (array1.length != array2.length)
        return false;

    for (var i = 0,
        l = array1.length; i < l; i++) {
        // Check if we have nested arrays
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!nv.arrayEquals(array1[i], array2[i]))
                return false;
        } else if (array1[i] != array2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};
    nv.models.axis = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var axis = d3.svg.axis();
    var scale = d3.scale.linear();

    var margin = {top: 0, right: 0, bottom: 0, left: 0}
        , width = 75 //only used for tickLabel currently
        , height = 60 //only used for tickLabel currently
        , axisLabelText = null
        , showMaxMin = true //TODO: showMaxMin should be disabled on all ordinal scaled axes
        , rotateLabels = 0
        , rotateYLabel = true
        , staggerLabels = false
        , isOrdinal = false
        , ticks = null
        , axisLabelDistance = 0
        , fontSize = undefined
        , duration = 250
        , dispatch = d3.dispatch('renderEnd')
        ;
    axis
        .scale(scale)
        .orient('bottom')
        .tickFormat(function(d) { return d })
    ;

    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var scale0;
    var renderWatch = nv.utils.renderWatch(dispatch, duration);

    function chart(selection) {
        renderWatch.reset();
        selection.each(function(data) {
            var container = d3.select(this);
            nv.utils.initSVG(container);

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap.nv-axis').data([data]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-axis');
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g');

            if (ticks !== null)
                axis.ticks(ticks);
            else if (axis.orient() == 'top' || axis.orient() == 'bottom')
                axis.ticks(Math.abs(scale.range()[1] - scale.range()[0]) / 100);

            //TODO: consider calculating width/height based on whether or not label is added, for reference in charts using this component
            g.watchTransition(renderWatch, 'axis').call(axis);

            scale0 = scale0 || axis.scale();

            var fmt = axis.tickFormat();
            if (fmt == null) {
                fmt = scale0.tickFormat();
            }

            var axisLabel = g.selectAll('text.nv-axislabel')
                .data([axisLabelText || null]);
            axisLabel.exit().remove();

            //only skip when fontSize is undefined so it can be cleared with a null or blank string
            if (fontSize !== undefined) {
                g.selectAll('g').select("text").style('font-size', fontSize);
            }

            var xLabelMargin;
            var axisMaxMin;
            var w;
            switch (axis.orient()) {
                case 'top':
                    axisLabel.enter().append('text').attr('class', 'nv-axislabel');
                  w = 0;
                  if (scale.range().length === 1) {
                    w = isOrdinal ? scale.range()[0] * 2 + scale.rangeBand() : 0;
                  } else if (scale.range().length === 2) {
                    w = isOrdinal ? scale.range()[0] + scale.range()[1] + scale.rangeBand() : scale.range()[1];
                  } else if ( scale.range().length > 2){
                    w = scale.range()[scale.range().length-1]+(scale.range()[1]-scale.range()[0]);
                  };
                    axisLabel
                        .attr('text-anchor', 'middle')
                        .attr('y', 0)
                        .attr('x', w/2);
                    if (showMaxMin) {
                        axisMaxMin = wrap.selectAll('g.nv-axisMaxMin')
                            .data(scale.domain());
                        axisMaxMin.enter().append('g').attr('class',function(d,i){
                                return ['nv-axisMaxMin','nv-axisMaxMin-x',(i == 0 ? 'nv-axisMin-x':'nv-axisMax-x')].join(' ')
                        }).append('text');
                        axisMaxMin.exit().remove();
                        axisMaxMin
                            .attr('transform', function(d,i) {
                                return 'translate(' + nv.utils.NaNtoZero(scale(d)) + ',0)'
                            })
                            .select('text')
                            .attr('dy', '-0.5em')
                            .attr('y', -axis.tickPadding())
                            .attr('text-anchor', 'middle')
                            .text(function(d,i) {
                                var v = fmt(d);
                                return ('' + v).match('NaN') ? '' : v;
                            });
                        axisMaxMin.watchTransition(renderWatch, 'min-max top')
                            .attr('transform', function(d,i) {
                                return 'translate(' + nv.utils.NaNtoZero(scale.range()[i]) + ',0)'
                            });
                    }
                    break;
                case 'bottom':
                    xLabelMargin = axisLabelDistance + 36;
                    var maxTextWidth = 30;
                    var textHeight = 0;
                    var xTicks = g.selectAll('g').select("text");
                    var rotateLabelsRule = '';
                    if (rotateLabels%360) {
                        //Reset transform on ticks so textHeight can be calculated correctly
                        xTicks.attr('transform', ''); 
                        //Calculate the longest xTick width
                        xTicks.each(function(d,i){
                            var box = this.getBoundingClientRect();
                            var width = box.width;
                            textHeight = box.height;
                            if(width > maxTextWidth) maxTextWidth = width;
                        });
                        rotateLabelsRule = 'rotate(' + rotateLabels + ' 0,' + (textHeight/2 + axis.tickPadding()) + ')';
                        //Convert to radians before calculating sin. Add 30 to margin for healthy padding.
                        var sin = Math.abs(Math.sin(rotateLabels*Math.PI/180));
                        xLabelMargin = (sin ? sin*maxTextWidth : maxTextWidth)+30;
                        //Rotate all xTicks
                        xTicks
                            .attr('transform', rotateLabelsRule)
                            .style('text-anchor', rotateLabels%360 > 0 ? 'start' : 'end');
                    } else {
                        if (staggerLabels) {
                            xTicks
                                .attr('transform', function(d,i) {
                                    return 'translate(0,' + (i % 2 == 0 ? '0' : '12') + ')'
                                });
                        } else {
                            xTicks.attr('transform', "translate(0,0)");
                        }
                    }
                    axisLabel.enter().append('text').attr('class', 'nv-axislabel');
                    w = 0;
                    if (scale.range().length === 1) {
                        w = isOrdinal ? scale.range()[0] * 2 + scale.rangeBand() : 0;
                    } else if (scale.range().length === 2) {
                        w = isOrdinal ? scale.range()[0] + scale.range()[1] + scale.rangeBand() : scale.range()[1];
                    } else if ( scale.range().length > 2){
                        w = scale.range()[scale.range().length-1]+(scale.range()[1]-scale.range()[0]);
                    };
                    axisLabel
                        .attr('text-anchor', 'middle')
                        .attr('y', xLabelMargin)
                        .attr('x', w/2);
                    if (showMaxMin) {
                        //if (showMaxMin && !isOrdinal) {
                        axisMaxMin = wrap.selectAll('g.nv-axisMaxMin')
                            //.data(scale.domain())
                            .data([scale.domain()[0], scale.domain()[scale.domain().length - 1]]);
                        axisMaxMin.enter().append('g').attr('class',function(d,i){
                                return ['nv-axisMaxMin','nv-axisMaxMin-x',(i == 0 ? 'nv-axisMin-x':'nv-axisMax-x')].join(' ')
                        }).append('text');
                        axisMaxMin.exit().remove();
                        axisMaxMin
                            .attr('transform', function(d,i) {
                                return 'translate(' + nv.utils.NaNtoZero((scale(d) + (isOrdinal ? scale.rangeBand() / 2 : 0))) + ',0)'
                            })
                            .select('text')
                            .attr('dy', '.71em')
                            .attr('y', axis.tickPadding())
                            .attr('transform', rotateLabelsRule)
                            .style('text-anchor', rotateLabels ? (rotateLabels%360 > 0 ? 'start' : 'end') : 'middle')
                            .text(function(d,i) {
                                var v = fmt(d);
                                return ('' + v).match('NaN') ? '' : v;
                            });
                        axisMaxMin.watchTransition(renderWatch, 'min-max bottom')
                            .attr('transform', function(d,i) {
                                return 'translate(' + nv.utils.NaNtoZero((scale(d) + (isOrdinal ? scale.rangeBand() / 2 : 0))) + ',0)'
                            });
                    }

                    break;
                case 'right':
                    axisLabel.enter().append('text').attr('class', 'nv-axislabel');
                    axisLabel
                        .style('text-anchor', rotateYLabel ? 'middle' : 'begin')
                        .attr('transform', rotateYLabel ? 'rotate(90)' : '')
                        .attr('y', rotateYLabel ? (-Math.max(margin.right, width) + 12) : -10) //TODO: consider calculating this based on largest tick width... OR at least expose this on chart
                        .attr('x', rotateYLabel ? (d3.max(scale.range()) / 2) : axis.tickPadding());
                    if (showMaxMin) {
                        axisMaxMin = wrap.selectAll('g.nv-axisMaxMin')
                            .data(scale.domain());
                       	axisMaxMin.enter().append('g').attr('class',function(d,i){
                                return ['nv-axisMaxMin','nv-axisMaxMin-y',(i == 0 ? 'nv-axisMin-y':'nv-axisMax-y')].join(' ')
                        }).append('text')
                            .style('opacity', 0);
                        axisMaxMin.exit().remove();
                        axisMaxMin
                            .attr('transform', function(d,i) {
                                return 'translate(0,' + nv.utils.NaNtoZero(scale(d)) + ')'
                            })
                            .select('text')
                            .attr('dy', '.32em')
                            .attr('y', 0)
                            .attr('x', axis.tickPadding())
                            .style('text-anchor', 'start')
                            .text(function(d, i) {
                                var v = fmt(d);
                                return ('' + v).match('NaN') ? '' : v;
                            });
                        axisMaxMin.watchTransition(renderWatch, 'min-max right')
                            .attr('transform', function(d,i) {
                                return 'translate(0,' + nv.utils.NaNtoZero(scale.range()[i]) + ')'
                            })
                            .select('text')
                            .style('opacity', 1);
                    }
                    break;
                case 'left':
                    /*
                     //For dynamically placing the label. Can be used with dynamically-sized chart axis margins
                     var yTicks = g.selectAll('g').select("text");
                     yTicks.each(function(d,i){
                     var labelPadding = this.getBoundingClientRect().width + axis.tickPadding() + 16;
                     if(labelPadding > width) width = labelPadding;
                     });
                     */
                    axisLabel.enter().append('text').attr('class', 'nv-axislabel');
                    axisLabel
                        .style('text-anchor', rotateYLabel ? 'middle' : 'end')
                        .attr('transform', rotateYLabel ? 'rotate(-90)' : '')
                        .attr('y', rotateYLabel ? (-Math.max(margin.left, width) + 25 - (axisLabelDistance || 0)) : -10)
                        .attr('x', rotateYLabel ? (-d3.max(scale.range()) / 2) : -axis.tickPadding());
                    if (showMaxMin) {
                        axisMaxMin = wrap.selectAll('g.nv-axisMaxMin')
                            .data(scale.domain());
                        axisMaxMin.enter().append('g').attr('class',function(d,i){
                                return ['nv-axisMaxMin','nv-axisMaxMin-y',(i == 0 ? 'nv-axisMin-y':'nv-axisMax-y')].join(' ')
                        }).append('text')
                            .style('opacity', 0);
                        axisMaxMin.exit().remove();
                        axisMaxMin
                            .attr('transform', function(d,i) {
                                return 'translate(0,' + nv.utils.NaNtoZero(scale0(d)) + ')'
                            })
                            .select('text')
                            .attr('dy', '.32em')
                            .attr('y', 0)
                            .attr('x', -axis.tickPadding())
                            .attr('text-anchor', 'end')
                            .text(function(d,i) {
                                var v = fmt(d);
                                return ('' + v).match('NaN') ? '' : v;
                            });
                        axisMaxMin.watchTransition(renderWatch, 'min-max right')
                            .attr('transform', function(d,i) {
                                return 'translate(0,' + nv.utils.NaNtoZero(scale.range()[i]) + ')'
                            })
                            .select('text')
                            .style('opacity', 1);
                    }
                    break;
            }
            axisLabel.text(function(d) { return d });

            if (showMaxMin && (axis.orient() === 'left' || axis.orient() === 'right')) {
                //check if max and min overlap other values, if so, hide the values that overlap
                g.selectAll('g') // the g's wrapping each tick
                    .each(function(d,i) {
                        d3.select(this).select('text').attr('opacity', 1);
                        if (scale(d) < scale.range()[1] + 10 || scale(d) > scale.range()[0] - 10) { // 10 is assuming text height is 16... if d is 0, leave it!
                            if (d > 1e-10 || d < -1e-10) // accounts for minor floating point errors... though could be problematic if the scale is EXTREMELY SMALL
                                d3.select(this).attr('opacity', 0);

                            d3.select(this).select('text').attr('opacity', 0); // Don't remove the ZERO line!!
                        }
                    });

                //if Max and Min = 0 only show min, Issue #281
                if (scale.domain()[0] == scale.domain()[1] && scale.domain()[0] == 0) {
                    wrap.selectAll('g.nv-axisMaxMin').style('opacity', function (d, i) {
                        return !i ? 1 : 0
                    });
                }
            }

            if (showMaxMin && (axis.orient() === 'top' || axis.orient() === 'bottom')) {
                var maxMinRange = [];
                wrap.selectAll('g.nv-axisMaxMin')
                    .each(function(d,i) {
                        try {
                            if (i) // i== 1, max position
                                maxMinRange.push(scale(d) - this.getBoundingClientRect().width - 4);  //assuming the max and min labels are as wide as the next tick (with an extra 4 pixels just in case)
                            else // i==0, min position
                                maxMinRange.push(scale(d) + this.getBoundingClientRect().width + 4)
                        }catch (err) {
                            if (i) // i== 1, max position
                                maxMinRange.push(scale(d) - 4);  //assuming the max and min labels are as wide as the next tick (with an extra 4 pixels just in case)
                            else // i==0, min position
                                maxMinRange.push(scale(d) + 4);
                        }
                    });
                // the g's wrapping each tick
                g.selectAll('g').each(function(d, i) {
                    if (scale(d) < maxMinRange[0] || scale(d) > maxMinRange[1]) {
                        if (d > 1e-10 || d < -1e-10) // accounts for minor floating point errors... though could be problematic if the scale is EXTREMELY SMALL
                            d3.select(this).remove();
                        else
                            d3.select(this).select('text').remove(); // Don't remove the ZERO line!!
                    }
                });
            }

            //Highlight zero tick line
            g.selectAll('.tick')
                .filter(function (d) {
                    /*
                    The filter needs to return only ticks at or near zero.
                    Numbers like 0.00001 need to count as zero as well,
                    and the arithmetic trick below solves that.
                    */
                    return !parseFloat(Math.round(d * 100000) / 1000000) && (d !== undefined)
                }) 
                .classed('zero', true);
            
            //store old scales for use in transitions on update
            scale0 = scale.copy();

        });

        renderWatch.renderEnd('axis immediate');
        return chart;
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    // expose chart's sub-components
    chart.axis = axis;
    chart.dispatch = dispatch;

    chart.options = nv.utils.optionsFunc.bind(chart);
    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        axisLabelDistance: {get: function(){return axisLabelDistance;}, set: function(_){axisLabelDistance=_;}},
        staggerLabels:     {get: function(){return staggerLabels;}, set: function(_){staggerLabels=_;}},
        rotateLabels:      {get: function(){return rotateLabels;}, set: function(_){rotateLabels=_;}},
        rotateYLabel:      {get: function(){return rotateYLabel;}, set: function(_){rotateYLabel=_;}},
        showMaxMin:        {get: function(){return showMaxMin;}, set: function(_){showMaxMin=_;}},
        axisLabel:         {get: function(){return axisLabelText;}, set: function(_){axisLabelText=_;}},
        height:            {get: function(){return height;}, set: function(_){height=_;}},
        ticks:             {get: function(){return ticks;}, set: function(_){ticks=_;}},
        width:             {get: function(){return width;}, set: function(_){width=_;}},
        fontSize:          {get: function(){return fontSize;}, set: function(_){fontSize=_;}},

        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top !== undefined    ? _.top    : margin.top;
            margin.right  = _.right !== undefined  ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left !== undefined   ? _.left   : margin.left;
        }},
        duration: {get: function(){return duration;}, set: function(_){
            duration=_;
            renderWatch.reset(duration);
        }},
        scale: {get: function(){return scale;}, set: function(_){
            scale = _;
            axis.scale(scale);
            isOrdinal = typeof scale.rangeBands === 'function';
            nv.utils.inheritOptionsD3(chart, scale, ['domain', 'range', 'rangeBand', 'rangeBands']);
        }}
    });

    nv.utils.initOptions(chart);
    nv.utils.inheritOptionsD3(chart, axis, ['orient', 'tickValues', 'tickSubdivide', 'tickSize', 'tickPadding', 'tickFormat']);
    nv.utils.inheritOptionsD3(chart, scale, ['domain', 'range', 'rangeBand', 'rangeBands']);

    return chart;
};
// Chart design based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/

nv.models.bullet = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {top: 0, right: 0, bottom: 0, left: 0}
        , orient = 'left' // TODO top & bottom
        , reverse = false
        , ranges = function(d) { return d.ranges }
        , markers = function(d) { return d.markers ? d.markers : [] }
        , measures = function(d) { return d.measures }
        , rangeLabels = function(d) { return d.rangeLabels ? d.rangeLabels : [] }
        , markerLabels = function(d) { return d.markerLabels ? d.markerLabels : []  }
        , measureLabels = function(d) { return d.measureLabels ? d.measureLabels : []  }
        , forceX = [0]// List of numbers to Force into the X scale (ie. 0, or a max / min, etc.)
        , forceY = [0]
        , width = 260
        , height = 8
        , container = null
        , tickFormat = null
        //, color = nv.utils.getColor(['#193346'])
        , colorRed = nv.utils.getColor(['#f74d52'])
        , colorViolet = nv.utils.getColor(['#512b8d'])
        , dispatch = d3.dispatch('elementMouseover', 'elementMouseout', 'elementMousemove')
        , defaultRangeLabels = ["목표", "지난주 평균"]
        , legacyRangeClassNames = ["Goals", "LastWeek"]
        , vertical = "false"
        ;
    function sortLabels(labels, values){
        var lz = labels.slice();
        labels.sort(function(a, b){
            var iA = lz.indexOf(a);
            var iB = lz.indexOf(b);
            return d3.descending(values[iA], values[iB]);
        });
    };

    function chart(selection) {
        selection.each(function(d, i) {

            var availableWidth = width - margin.left - margin.right,
                availableHeight = height - margin.top - margin.bottom;

            container = d3.select(this);
            nv.utils.initSVG(container);

            var rangez = ranges.call(this, d, i).slice(),
                markerz = markers.call(this, d, i).slice(),
                measurez = measures.call(this, d, i).slice(),
                rangeLabelz = rangeLabels.call(this, d, i).slice(),
                markerLabelz = markerLabels.call(this, d, i).slice(),
                measureLabelz = measureLabels.call(this, d, i).slice();

            // Sort labels according to their sorted values
            sortLabels(rangeLabelz, rangez);
            sortLabels(markerLabelz, markerz);
            sortLabels(measureLabelz, measurez);

            // sort values descending
            //rangez.sort(d3.descending);
            if(rangez[0] < rangez[1]){
                rangez[1] = rangez[0];
                defaultRangeLabels[1] = "지난주 100% 달성";
            }

            markerz.sort(d3.descending);
            measurez.sort(d3.descending);

            // Setup Scales
            // Compute the new x-scale.
            var x1 = d3.scale.linear()
                .domain( d3.extent(d3.merge([forceX, rangez])) )
                .range(reverse ? [availableWidth, 0] : [0, availableWidth]);
            var y1 = d3.scale.linear()
               .domain( d3.extent(d3.merge([forceY, rangez])) )
               .range(reverse ? [availableHeight, 0] : [0, availableHeight]);

            // Retrieve the old x-scale, if this is an update.
            var x0 = this.__chart__ || d3.scale.linear()
                .domain([0, Infinity])
                .range(x1.range());
            var y0 = this.__chart__ || d3.scale.linear()
                  .domain([0, Infinity])
                  .range(y1.range());

            // Stash the new scale.
            if(vertical === "true") {
                this.__chart__ = y1;
            } else {
                this.__chart__ = x1;
            }

            //var rangeMin = d3.min(rangez), //rangez[2]
            //    rangeMax = d3.max(rangez), //rangez[0]
            //    rangeAvg = rangez[1];


            var rangeMin = rangez[2],
                rangeAvg = rangez[1],
                rangeMax = rangez[0];

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap.nv-bullet').data([d]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-bullet');
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g');

            //generate all parts of graph[goal, lastweek]
            for(var i=0,il=rangez.length; i<il; i++){
                var rangeClassNames = 'nv-range nv-range'+i;
                if(i <= 2){
                    rangeClassNames = rangeClassNames + ' nv-range'+legacyRangeClassNames[i];
                }
                gEnter.append('rect').attr('class', rangeClassNames);
            }
            //today status
            gEnter.append('rect').attr('class', 'nv-measure');

            //set class base water point
            gEnter.append('circle').attr('class', 'base-point-water-outer');
            gEnter.append('circle').attr('class', 'base-point-water-inner');


            if(vertical === "true") {
                wrap.attr('transform', 'translate(' + margin.left + ',' + availableHeight + ')' + ' scale(1, -1)' );
            } else {
                wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            }

            var w0 = function(d) { return Math.abs(x0(d) - x0(0)) },
            // TODO: could optimize by precalculating x0(0) and x1(0)
                w1 = function(d) { return Math.abs(x1(d) - x1(0)) },
                h0 = function(d) { return Math.abs(y0(d) - y0(0)) },
                h1 = function(d) { return Math.abs(y1(d) - y1(0)) };
            var xp0 = function(d) { return d < 0 ? x0(d) : x0(0) },
                xp1 = function(d) { return d < 0 ? x1(d) : x1(0) },
                yp0 = function(d) { return d < 0 ? y0(d) : y0(0) },
                yp1 = function(d) { return d < 0 ? y1(d) : y1(0) }

            if(vertical === "true") {
                for(var i=0,il=rangez.length; i<il; i++){
                    var range = rangez[i];
                    g.select('rect.nv-range'+i)
                       .attr('width', availableWidth / 4)
                       .attr('height', h1(range))
                       .attr('y', yp1(range))
                       .attr('x', 7.5)
                       .datum(range)
                }
            } else {
                for(var i=0,il=rangez.length; i<il; i++){
                    var range = rangez[i];
                    g.select('rect.nv-range'+i)
                       .attr('height', availableHeight - 2)
                       .attr('width', w1(range))
                       .attr('x', xp1(range))
                       .datum(range)
                }
            }

            if(vertical === "true") {
                g.select('rect.nv-measure')
                   .style('fill', colorViolet)
                   .attr('height', measurez < 0 ? y1(0) - y1(measurez[0]) : y1(measurez[0]) - y1(0))
                   .attr('y', yp1(measurez))
                   .attr('width', availableWidth / 4)
                   .attr('x', 7.5)
                   .on('mouseover', function() {
                       dispatch.elementMouseover({
                           value: measurez[0],
                           label: measureLabelz[0] || '오늘 ',
                           color: d3.select(this).style("fill")
                       })
                   })
                   .on('mousemove', function() {
                       dispatch.elementMousemove({
                           value: measurez[0],
                           label: measureLabelz[0] || '오늘',
                           color: d3.select(this).style("fill")
                       })
                   })
                   .on('mouseout', function() {
                       dispatch.elementMouseout({
                           value: measurez[0],
                           label: measureLabelz[0] || '오늘',
                           color: d3.select(this).style("fill")
                       })
                   });
            } else {
                g.select('rect.nv-measure')
                   .style('fill', colorRed)
                   .attr('height', availableHeight - 2)
                   .attr('y', 0)
                   .attr('width', measurez < 0 ?
                   x1(0) - x1(measurez[0]) : x1(measurez[0]) - x1(0))
                   .attr('x', xp1(measurez))
                   .on('mouseover', function() {
                       dispatch.elementMouseover({
                           value: measurez[0],
                           label: measureLabelz[0] || '오늘 ',
                           color: d3.select(this).style("fill")
                       })
                   })
                   .on('mousemove', function() {
                       dispatch.elementMousemove({
                           value: measurez[0],
                           label: measureLabelz[0] || '오늘',
                           color: d3.select(this).style("fill")
                       })
                   })
                   .on('mouseout', function() {
                       dispatch.elementMouseout({
                           value: measurez[0],
                           label: measureLabelz[0] || '오늘',
                           color: d3.select(this).style("fill")
                       })
                   });
            }
            //set attributes of base water point
            if(vertical === "true") {
                g.select('circle.base-point-water-outer')
                   .style('fill', '#512B8D')
                   .attr('cx', 7.5)
                   .attr('cy', 7.5)
                   .attr('r', 7.5)
                   .attr( 'transform', function(d) {
                       return 'translate('
                          + (2.5)
                          + ','
                          + (availableHeight - 15)  + ')'
                   });

                g.select('circle.base-point-water-inner')
                   .style('fill', '#A0A6A9')
                   .attr('cx', 7.5)
                   .attr('cy', 7.5)
                   .attr('r', 4.5)
                   .attr( 'transform', function(d) {
                       return 'translate('
                          + (2.5)
                          + ','
                          + (availableHeight - 15)  + ')'
                   });
            }

            //var h3 =  availableHeight / 6;
            var h3 =  availableHeight / 3 - 0.5,
                w3 = availableWidth / 3;


            var markerData = markerz.map( function(marker, index) {
                return {value: marker, label: markerLabelz[index]}
            });

            //<svg>
            //<circle cx="10" cy="10" r="10" fill= "#512B8D"/>
            //<polygon points="15,9 11,9 11,5 9,5 9,9 5,9 5,11 9,11 9,15 11,15 11,11 15,11 "
            //fill= "#FFFFFF"/>
            //</svg>

            if(vertical === "true") {
                var gEnterObj = gEnter.selectAll("circle.nv-markerTriangle")
                   .data(markerData)
                   .enter();

                gEnterObj
                   .append('circle')
                   .attr('class', 'nv-markerTriangle')
                   .attr('cx', 10)
                   .attr('cy', 10)
                   .attr('y', measurez < 0 ? y1(0) - y1(measurez[0]) : y1(measurez[0]) - y1(0))
                   .attr('x', 0)
                   .attr('r', 10)
                   .attr('fill', "#512B8D")
                   .attr( 'transform', function(d) {
                    return 'translate('
                       + (0)
                       + ','
                       + y1(d.value - 40)  + ')'
                    });
                //y1(d.value - 40) >> for 10px up
                gEnterObj
                   .append('polygon')
                   .attr('points', "15,9 11,9 11,5 9,5 9,9 5,9 5,11 9,11 9,15 11,15 11,11 15,11 ")
                   .attr('y', measurez < 0 ? y1(0) - y1(measurez[0]) : y1(measurez[0]) - y1(0))
                   .attr('x', 0)
                   .attr('fill', "#ffffff")
                   .attr( 'transform', function(d) {
                       return 'translate('
                          + (0)
                          + ','
                          + y1(d.value - 40)  + ')'
                   });

                gEnter
                   .selectAll(".nv-markerTriangle")
                   .on('mouseover', function(d) {
                       dispatch.elementMouseover({
                           value: d.value,
                           label: d.label || '건강을 마셔요!',
                           color: d3.select(this).style("fill"),
                           pos: [x1(d.value), availableHeight/2]
                       })
                   })
                   .on('mousemove', function(d) {
                       dispatch.elementMousemove({
                           value: d.value,
                           label: d.label || '건강을 마셔요',
                           color: d3.select(this).style("fill")
                       })
                   })
                   .on('mouseout', function(d, i) {
                       dispatch.elementMouseout({
                           value: d.value,
                           label: d.label || '건강을 마셔요',
                           color: d3.select(this).style("fill")
                       })
                   });
            } else {
                gEnter
                   .selectAll("path.nv-markerTriangle")
                   .data(markerData)
                   .enter()
                   .append('path')
                   .attr('class', 'nv-markerTriangle')
                   .attr('d', 'M0,' + h3 + 'L' + h3 + ',' + (-h3) + ' ' + (-h3) + ',' + (-h3) + 'Z')
                   .on('mouseover', function(d) {
                       dispatch.elementMouseover({
                           value: d.value,
                           label: d.label || '어제',
                           color: d3.select(this).style("fill"),
                           pos: [x1(d.value), availableHeight/2]
                       })

                   })
                   .on('mousemove', function(d) {
                       dispatch.elementMousemove({
                           value: d.value,
                           label: d.label || '어제',
                           color: d3.select(this).style("fill")
                       })
                   })
                   .on('mouseout', function(d, i) {
                       dispatch.elementMouseout({
                           value: d.value,
                           label: d.label || '어제',
                           color: d3.select(this).style("fill")
                       })
                   });
            }



            if(!(vertical === "true")) {
                g.selectAll("path.nv-markerTriangle")
                   .data(markerData)
                   .attr('transform', function(d) {
                       return 'translate('
                          + x1(d.value)
                          + ','
                          + (availableHeight / 2 - 1.5) + ')'
                   });
            }


            wrap.selectAll('.nv-range')
                .on('mouseover', function(d,i) {
                    var label = rangeLabelz[i] || defaultRangeLabels[i];
                    dispatch.elementMouseover({
                        value: d,
                        label: label,
                        color: d3.select(this).style("fill")
                    })
                })
                .on('mousemove', function() {
                    dispatch.elementMousemove({
                        value: measurez[0],
                        label: measureLabelz[0] || '어제',
                        color: d3.select(this).style("fill")
                    })
                })
                .on('mouseout', function(d,i) {
                    var label = rangeLabelz[i] || defaultRangeLabels[i];
                    dispatch.elementMouseout({
                        value: d,
                        label: label,
                        color: d3.select(this).style("fill")
                    })
                });
        });

        return chart;
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        ranges:      {get: function(){return ranges;}, set: function(_){ranges=_;}}, // ranges (bad, satisfactory, good)
        markers:     {get: function(){return markers;}, set: function(_){markers=_;}}, // markers (previous, goal)
        measures: {get: function(){return measures;}, set: function(_){measures=_;}}, // measures (actual, forecast)
        forceX:      {get: function(){return forceX;}, set: function(_){forceX=_;}},
        width:    {get: function(){return width;}, set: function(_){width=_;}},
        height:    {get: function(){return height;}, set: function(_){height=_;}},
        tickFormat:    {get: function(){return tickFormat;}, set: function(_){tickFormat=_;}},

        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    !== undefined ? _.top    : margin.top;
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }},
        orient: {get: function(){return orient;}, set: function(_){ // left, right, top, bottom
            orient = _;
            reverse = orient == 'right' || orient == 'bottom';
        }},
        color:  {get: function(){return color;}, set: function(_){
            color = nv.utils.getColor(_);
        }},
        vertical: {get: function(){return vertical;}, set: function(_){vertical=_;}}
    });

    nv.utils.initOptions(chart);
    return chart;
};

// Chart design based on the recommendations of Stephen Few. Implementation
// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
// http://projects.instantcognition.com/protovis/bulletchart/
nv.models.bulletChart = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var bullet = nv.models.bullet();
    var tooltip = nv.models.tooltip();

    var orient = 'left' // TODO top & bottom
        , reverse = false
        , margin = {top: 5, right: 40, bottom: 20, left: 120}
        , ranges = function(d) { return d.ranges }
        , markers = function(d) { return d.markers ? d.markers : [] }
        , measures = function(d) { return d.measures }
        , width = null
        , height = 55
        , tickFormat = null
	     , ticks = null
        , noData = null
        , dispatch = d3.dispatch()
        ;



    tooltip
        .duration(0)
        .headerEnabled(false);

    function chart(selection) {
        selection.each(function(d, i) {
            var container = d3.select(this);
            nv.utils.initSVG(container);

            var availableWidth = nv.utils.availableWidth(width, container, margin),
                availableHeight = height - margin.top - margin.bottom,
                that = this;

            chart.update = function() { chart(selection) };
            chart.container = this;

            // Display No Data message if there's nothing to show.
            if (!d || !ranges.call(this, d, i)) {
                nv.utils.noData(chart, container)
                return chart;
            } else {
                container.selectAll('.nv-noData').remove();
            }

            var rangez = ranges.call(this, d, i).slice().sort(d3.descending),
                markerz = markers.call(this, d, i).slice().sort(d3.descending),
                measurez = measures.call(this, d, i).slice().sort(d3.descending);

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-wrap.nv-bulletChart').data([d]);
            var wrapEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-wrap nv-bulletChart');
            var gEnter = wrapEnter.append('g');
            var g = wrap.select('g');

            gEnter.append('g').attr('class', 'nv-bulletWrap');
            gEnter.append('g').attr('class', 'nv-titles');

            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // Compute the new x-scale.
            var x1 = d3.scale.linear()
                .domain([0, Math.max(rangez[0], (markerz[0] || 0), measurez[0])])  // TODO: need to allow forceX and forceY, and xDomain, yDomain
                .range(reverse ? [availableWidth, 0] : [0, availableWidth]);

            // Retrieve the old x-scale, if this is an update.
            var x0 = this.__chart__ || d3.scale.linear()
                .domain([0, Infinity])
                .range(x1.range());

            // Stash the new scale.
            this.__chart__ = x1;

            var w0 = function(d) { return Math.abs(x0(d) - x0(0)) },
            // TODO: could optimize by precalculating x0(0) and x1(0)
                w1 = function(d) { return Math.abs(x1(d) - x1(0)) };

            var title = gEnter.select('.nv-titles').append('g')
                .attr('text-anchor', 'end')
                .attr('transform', 'translate(-6,' + (height - margin.top - margin.bottom) / 2 + ')');
            title.append('text')
                .attr('class', 'nv-title')
                .text(function(d) { return d.title; });

            title.append('text')
                .attr('class', 'nv-subtitle')
                .attr('dy', '1em')
                .text(function(d) { return d.subtitle; });

            bullet
                .width(availableWidth)
                .height(availableHeight)

            var bulletWrap = g.select('.nv-bulletWrap');
            d3.transition(bulletWrap).call(bullet);

            // Compute the tick format.
            var format = tickFormat || x1.tickFormat( availableWidth / 100 );

            // Update the tick groups.
            var tick = g.selectAll('g.nv-tick')
                .data(x1.ticks( ticks ? ticks : (availableWidth / 50) ), function(d) {
                    return this.textContent || format(d);
                });

            // Initialize the ticks with the old scale, x0.
            var tickEnter = tick.enter().append('g')
                .attr('class', 'nv-tick')
                .attr('transform', function(d) { return 'translate(' + x0(d) + ',0)' })
                .style('opacity', 1e-6);

            tickEnter.append('line')
                .attr('y1', availableHeight)
                .attr('y2', availableHeight * 7 / 6);

            tickEnter.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '1em')
                .attr('y', availableHeight * 7 / 6)
                .text(format);

            // Transition the updating ticks to the new scale, x1.
            var tickUpdate = d3.transition(tick)
                .attr('transform', function(d) { return 'translate(' + x1(d) + ',0)' })
                .style('opacity', 1);

            tickUpdate.select('line')
                .attr('y1', availableHeight)
                .attr('y2', availableHeight * 7 / 6);

            tickUpdate.select('text')
                .attr('y', availableHeight * 7 / 6);

            // Transition the exiting ticks to the new scale, x1.
            d3.transition(tick.exit())
                .attr('transform', function(d) { return 'translate(' + x1(d) + ',0)' })
                .style('opacity', 1e-6)
                .remove();
        });

        d3.timer.flush();
        return chart;
    }

    //============================================================
    // Event Handling/Dispatching (out of chart's scope)
    //------------------------------------------------------------

    bullet.dispatch.on('elementMouseover.tooltip', function(evt) {
        evt['series'] = {
            key: evt.label,
            value: evt.value,
            color: evt.color
        };
        tooltip.data(evt).hidden(false);
    });

    bullet.dispatch.on('elementMouseout.tooltip', function(evt) {
        tooltip.hidden(true);
    });

    bullet.dispatch.on('elementMousemove.tooltip', function(evt) {
        tooltip();
    });

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.bullet = bullet;
    chart.dispatch = dispatch;
    chart.tooltip = tooltip;

    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        ranges:      {get: function(){return ranges;}, set: function(_){ranges=_;}}, // ranges (bad, satisfactory, good)
        markers:     {get: function(){return markers;}, set: function(_){markers=_;}}, // markers (previous, goal)
        measures: {get: function(){return measures;}, set: function(_){measures=_;}}, // measures (actual, forecast)
        width:    {get: function(){return width;}, set: function(_){width=_;}},
        height:    {get: function(){return height;}, set: function(_){height=_;}},
        tickFormat:    {get: function(){return tickFormat;}, set: function(_){tickFormat=_;}},
        ticks:    {get: function(){return ticks;}, set: function(_){ticks=_;}},
        noData:    {get: function(){return noData;}, set: function(_){noData=_;}},

        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    !== undefined ? _.top    : margin.top;
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }},
        orient: {get: function(){return orient;}, set: function(_){ // left, right, top, bottom
            orient = _;
            reverse = orient == 'right' || orient == 'bottom';
        }}
    });

    nv.utils.inheritOptions(chart, bullet);
    nv.utils.initOptions(chart);

    return chart;
};

nv.models.legend = function() {
    "use strict";

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {top: 5, right: 0, bottom: 5, left: 0}
        , width = 400
        , height = 20
        , getKey = function(d) { return d.key }
        , color = nv.utils.getColor()
        , maxKeyLength = 20 //default value for key lengths
        , align = true
        , padding = 32 //define how much space between legend items. - recommend 32 for furious version
        , rightAlign = true
        , updateState = true   //If true, legend will update data.disabled and trigger a 'stateChange' dispatch.
        , radioButtonMode = false   //If true, clicking legend items will cause it to behave like a radio button. (only one can be selected at a time)
        , expanded = false
        , dispatch = d3.dispatch('legendClick', 'legendDblclick', 'legendMouseover', 'legendMouseout', 'stateChange')
        , vers = 'classic' //Options are "classic" and "furious"
        ;

    function chart(selection) {
        selection.each(function(data) {
            var availableWidth = width - margin.left - margin.right,
                container = d3.select(this);
            nv.utils.initSVG(container);

            // Setup containers and skeleton of chart
            var wrap = container.selectAll('g.nv-legend').data([data]);
            var gEnter = wrap.enter().append('g').attr('class', 'nvd3 nv-legend').append('g');
            var g = wrap.select('g');

            wrap.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var series = g.selectAll('.nv-series')
                .data(function(d) {
                    if(vers != 'furious') return d;

                    return d.filter(function(n) {
                        return expanded ? true : !n.disengaged;
                    });
                });

            var seriesEnter = series.enter().append('g').attr('class', 'nv-series');
            var seriesShape;

            var versPadding;
            switch(vers) {
                case 'furious' :
                    versPadding = 23;
                    break;
                case 'classic' :
                    versPadding = 20;
            }

            if(vers == 'classic') {
                seriesEnter.append('circle')
                    .style('stroke-width', 2)
                    .attr('class','nv-legend-symbol')
                    .attr('r', 5);

                seriesShape = series.select('.nv-legend-symbol');
            } else if (vers == 'furious') {
                seriesEnter.append('rect')
                    .style('stroke-width', 2)
                    .attr('class','nv-legend-symbol')
                    .attr('rx', 3)
                    .attr('ry', 3);
                seriesShape = series.select('.nv-legend-symbol');

                seriesEnter.append('g')
                    .attr('class', 'nv-check-box')
                    .property('innerHTML','<path d="M0.5,5 L22.5,5 L22.5,26.5 L0.5,26.5 L0.5,5 Z" class="nv-box"></path><path d="M5.5,12.8618467 L11.9185089,19.2803556 L31,0.198864511" class="nv-check"></path>')
                    .attr('transform', 'translate(-10,-8)scale(0.5)');

                var seriesCheckbox = series.select('.nv-check-box');

                seriesCheckbox.each(function(d,i) {
                    d3.select(this).selectAll('path')
                        .attr('stroke', setTextColor(d,i));
                });
            }

            seriesEnter.append('text')
                .attr('text-anchor', 'start')
                .attr('class','nv-legend-text')
                .attr('dy', '.32em')
                .attr('dx', '8');

            var seriesText = series.select('text.nv-legend-text');

            series
                .on('mouseover', function(d,i) {
                    dispatch.legendMouseover(d,i);  //TODO: Make consistent with other event objects
                })
                .on('mouseout', function(d,i) {
                    dispatch.legendMouseout(d,i);
                })
                .on('click', function(d,i) {
                    dispatch.legendClick(d,i);
                    // make sure we re-get data in case it was modified
                    var data = series.data();
                    if (updateState) {
                        if(vers =='classic') {
                            if (radioButtonMode) {
                                //Radio button mode: set every series to disabled,
                                //  and enable the clicked series.
                                data.forEach(function(series) { series.disabled = true});
                                d.disabled = false;
                            }
                            else {
                                d.disabled = !d.disabled;
                                if (data.every(function(series) { return series.disabled})) {
                                    //the default behavior of NVD3 legends is, if every single series
                                    // is disabled, turn all series' back on.
                                    data.forEach(function(series) { series.disabled = false});
                                }
                            }
                        } else if(vers == 'furious') {
                            if(expanded) {
                                d.disengaged = !d.disengaged;
                                d.userDisabled = d.userDisabled == undefined ? !!d.disabled : d.userDisabled;
                                d.disabled = d.disengaged || d.userDisabled;
                            } else if (!expanded) {
                                d.disabled = !d.disabled;
                                d.userDisabled = d.disabled;
                                var engaged = data.filter(function(d) { return !d.disengaged; });
                                if (engaged.every(function(series) { return series.userDisabled })) {
                                    //the default behavior of NVD3 legends is, if every single series
                                    // is disabled, turn all series' back on.
                                    data.forEach(function(series) {
                                        series.disabled = series.userDisabled = false;
                                    });
                                }
                            }
                        }
                        dispatch.stateChange({
                            disabled: data.map(function(d) { return !!d.disabled }),
                            disengaged: data.map(function(d) { return !!d.disengaged })
                        });

                    }
                })
                .on('dblclick', function(d,i) {
                    if(vers == 'furious' && expanded) return;
                    dispatch.legendDblclick(d,i);
                    if (updateState) {
                        // make sure we re-get data in case it was modified
                        var data = series.data();
                        //the default behavior of NVD3 legends, when double clicking one,
                        // is to set all other series' to false, and make the double clicked series enabled.
                        data.forEach(function(series) {
                            series.disabled = true;
                            if(vers == 'furious') series.userDisabled = series.disabled;
                        });
                        d.disabled = false;
                        if(vers == 'furious') d.userDisabled = d.disabled;
                        dispatch.stateChange({
                            disabled: data.map(function(d) { return !!d.disabled })
                        });
                    }
                });

            series.classed('nv-disabled', function(d) { return d.userDisabled });
            series.exit().remove();

            seriesText
                .attr('fill', setTextColor)
                .text(getKey);

            //TODO: implement fixed-width and max-width options (max-width is especially useful with the align option)
            // NEW ALIGNING CODE, TODO: clean up
            var legendWidth = 0;
            if (align) {

                var seriesWidths = [];
                series.each(function(d,i) {
                    var legendText;
                    if (getKey(d) && (getKey(d).length > maxKeyLength)) {
                        var trimmedKey = getKey(d).substring(0, maxKeyLength);
                        legendText = d3.select(this).select('text').text(trimmedKey + "...");
                        d3.select(this).append("svg:title").text(getKey(d));
                    } else {
                        legendText = d3.select(this).select('text');
                    }
                    var nodeTextLength;
                    try {
                        nodeTextLength = legendText.node().getComputedTextLength();
                        // If the legendText is display:none'd (nodeTextLength == 0), simulate an error so we approximate, instead
                        if(nodeTextLength <= 0) throw Error();
                    }
                    catch(e) {
                        nodeTextLength = nv.utils.calcApproxTextWidth(legendText);
                    }

                    seriesWidths.push(nodeTextLength + padding);
                });

                var seriesPerRow = 0;
                var columnWidths = [];
                legendWidth = 0;

                while ( legendWidth < availableWidth && seriesPerRow < seriesWidths.length) {
                    columnWidths[seriesPerRow] = seriesWidths[seriesPerRow];
                    legendWidth += seriesWidths[seriesPerRow++];
                }
                if (seriesPerRow === 0) seriesPerRow = 1; //minimum of one series per row

                while ( legendWidth > availableWidth && seriesPerRow > 1 ) {
                    columnWidths = [];
                    seriesPerRow--;

                    for (var k = 0; k < seriesWidths.length; k++) {
                        if (seriesWidths[k] > (columnWidths[k % seriesPerRow] || 0) )
                            columnWidths[k % seriesPerRow] = seriesWidths[k];
                    }

                    legendWidth = columnWidths.reduce(function(prev, cur, index, array) {
                        return prev + cur;
                    });
                }

                var xPositions = [];
                for (var i = 0, curX = 0; i < seriesPerRow; i++) {
                    xPositions[i] = curX;
                    curX += columnWidths[i];
                }

                series
                    .attr('transform', function(d, i) {
                        return 'translate(' + xPositions[i % seriesPerRow] + ',' + (5 + Math.floor(i / seriesPerRow) * versPadding) + ')';
                    });

                //position legend as far right as possible within the total width
                if (rightAlign) {
                    g.attr('transform', 'translate(' + (width - margin.right - legendWidth) + ',' + margin.top + ')');
                }
                else {
                    g.attr('transform', 'translate(0' + ',' + margin.top + ')');
                }

                height = margin.top + margin.bottom + (Math.ceil(seriesWidths.length / seriesPerRow) * versPadding);

            } else {

                var ypos = 5,
                    newxpos = 5,
                    maxwidth = 0,
                    xpos;
                series
                    .attr('transform', function(d, i) {
                        var length = d3.select(this).select('text').node().getComputedTextLength() + padding;
                        xpos = newxpos;

                        if (width < margin.left + margin.right + xpos + length) {
                            newxpos = xpos = 5;
                            ypos += versPadding;
                        }

                        newxpos += length;
                        if (newxpos > maxwidth) maxwidth = newxpos;

                        if(legendWidth < xpos + maxwidth) {
                            legendWidth = xpos + maxwidth;
                        }
                        return 'translate(' + xpos + ',' + ypos + ')';
                    });

                //position legend as far right as possible within the total width
                g.attr('transform', 'translate(' + (width - margin.right - maxwidth) + ',' + margin.top + ')');

                height = margin.top + margin.bottom + ypos + 15;
            }

            if(vers == 'furious') {
                // Size rectangles after text is placed
                seriesShape
                    .attr('width', function(d,i) {
                        return seriesText[0][i].getComputedTextLength() + 27;
                    })
                    .attr('height', 18)
                    .attr('y', -9)
                    .attr('x', -15);

                // The background for the expanded legend (UI)
                gEnter.insert('rect',':first-child')
                    .attr('class', 'nv-legend-bg')
                    .attr('fill', '#eee')
                    // .attr('stroke', '#444')
                    .attr('opacity',0);

                var seriesBG = g.select('.nv-legend-bg');

                seriesBG
                .transition().duration(300)
                    .attr('x', -versPadding )
                    .attr('width', legendWidth + versPadding - 12)
                    .attr('height', height + 10)
                    .attr('y', -margin.top - 10)
                    .attr('opacity', expanded ? 1 : 0);


            }

            seriesShape
                .style('fill', setBGColor)
                .style('fill-opacity', setBGOpacity)
                .style('stroke', setBGColor);
        });

        function setTextColor(d,i) {
            if(vers != 'furious') return '#000';
            if(expanded) {
                return d.disengaged ? '#000' : '#fff';
            } else if (!expanded) {
                if(!d.color) d.color = color(d,i);
                return !!d.disabled ? d.color : '#fff';
            }
        }

        function setBGColor(d,i) {
            if(expanded && vers == 'furious') {
                return d.disengaged ? '#eee' : d.color || color(d,i);
            } else {
                return d.color || color(d,i);
            }
        }


        function setBGOpacity(d,i) {
            if(expanded && vers == 'furious') {
                return 1;
            } else {
                return !!d.disabled ? 0 : 1;
            }
        }

        return chart;
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;
    chart.options = nv.utils.optionsFunc.bind(chart);

    chart._options = Object.create({}, {
        // simple options, just get/set the necessary values
        width:      {get: function(){return width;}, set: function(_){width=_;}},
        height:     {get: function(){return height;}, set: function(_){height=_;}},
        key:        {get: function(){return getKey;}, set: function(_){getKey=_;}},
        align:      {get: function(){return align;}, set: function(_){align=_;}},
        maxKeyLength:   {get: function(){return maxKeyLength;}, set: function(_){maxKeyLength=_;}},
        rightAlign:    {get: function(){return rightAlign;}, set: function(_){rightAlign=_;}},
        padding:       {get: function(){return padding;}, set: function(_){padding=_;}},
        updateState:   {get: function(){return updateState;}, set: function(_){updateState=_;}},
        radioButtonMode:    {get: function(){return radioButtonMode;}, set: function(_){radioButtonMode=_;}},
        expanded:   {get: function(){return expanded;}, set: function(_){expanded=_;}},
        vers:   {get: function(){return vers;}, set: function(_){vers=_;}},

        // options that require extra logic in the setter
        margin: {get: function(){return margin;}, set: function(_){
            margin.top    = _.top    !== undefined ? _.top    : margin.top;
            margin.right  = _.right  !== undefined ? _.right  : margin.right;
            margin.bottom = _.bottom !== undefined ? _.bottom : margin.bottom;
            margin.left   = _.left   !== undefined ? _.left   : margin.left;
        }},
        color:  {get: function(){return color;}, set: function(_){
            color = nv.utils.getColor(_);
        }}
    });

    nv.utils.initOptions(chart);

    return chart;
};
nv.version = "1.8.3";
})();