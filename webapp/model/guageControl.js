sap.ui.core.Control.extend('com.nkch.chart.model.guageControl', {
    metadata: {
        properties: {
            id: {
                type: 'string',
                defaultValue: ""
            },
        }
    },
    init: function () {
        this.treeData = {};
    },
    setData: function (d) {
        this.treeData = d;
    },
    renderer: function (oRm, oControl) {
        oRm.write("<div");
        oRm.writeControlData(oControl);
        oRm.addClass("svgBoxBorder");
        oRm.writeClasses();
        oRm.write(">");
        oRm.write("</div>");
    },

    noData: function () {
        var text = d3v4.select("#" + this.getId())
            .append('div')
            .attr('class', 'noData')
            .html("No Data");
    },

    onAfterRendering: function () {
        this.renderGuage(100);
    },

    renderGuage: function (newValue) {
        var config = {
            size: 200,
            clipWidth: 200,
            clipHeight: 110,
            ringInset: 20,
            ringWidth: 20,

            pointerWidth: 10,
            pointerTailLength: 5,
            pointerHeadLengthPercent: 0.9,

            minValue: 0,
            maxValue: 10,

            minAngle: -90,
            maxAngle: 90,

            transitionMs: 750,

            majorTicks: 5,
            labelFormat: d3.format(',g'),
            labelInset: 10,

            arcColorFn: d3.interpolateHsl(d3.rgb('#000000'), d3.rgb('#ffffff'))
        };
        var that = this;

        var range = undefined;
        var r = undefined;
        var pointerHeadLength = undefined;
        var value = 0;

        var svg = undefined;
        var arc = undefined;
        var scale = undefined;
        var ticks = undefined;
        var tickData = undefined;
        var pointer = undefined;

        var donut = d3.layout.pie();
        svg = d3.select(container)
            .append('svg:svg')
            .attr('class', 'gauge')
            .attr('width', config.clipWidth)
            .attr('height', config.clipHeight);

        var centerTx = this.centerTranslation();

        var arcs = svg.append('g')
            .attr('class', 'arc')
            .attr('transform', centerTx);

        range = config.maxAngle - config.minAngle;
        r = config.size / 2;
        pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

        // a linear scale that maps domain values to a percent from 0..1
        scale = d3.scale.linear()
            .range([0, 1])
            .domain([config.minValue, config.maxValue]);
        ticks = scale.ticks(config.majorTicks);
        tickData = d3.range(config.majorTicks).map(function () { return 1 / config.majorTicks; });
        arc = d3.svg.arc()
            .innerRadius(r - config.ringWidth - config.ringInset)
            .outerRadius(r - config.ringInset)
            .startAngle(function (d, i) {
                var ratio = d * i;
                return that.deg2rad(config.minAngle + (ratio * range));
            })
            .endAngle(function (d, i) {
                var ratio = d * (i + 1);
                return that.deg2rad(config.minAngle + (ratio * range));
            });

        arcs.selectAll('path')
            .data(tickData)
            .enter().append('path')
            .attr('fill', function (d, i) {
                return config.arcColorFn(d * i);
            })
            .attr('d', arc);

        var lg = svg.append('g')
            .attr('class', 'label')
            .attr('transform', centerTx);
        lg.selectAll('text')
            .data(ticks)
            .enter().append('text')
            .attr('transform', function (d) {
                var ratio = scale(d);
                var newAngle = config.minAngle + (ratio * range);
                return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - r) + ')';
            })
            .text(config.labelFormat);

        var lineData = [[config.pointerWidth / 2, 0],
        [0, -pointerHeadLength],
        [-(config.pointerWidth / 2), 0],
        [0, config.pointerTailLength],
        [config.pointerWidth / 2, 0]];
        var pointerLine = d3.svg.line().interpolate('monotone');
        var pg = svg.append('g').data([lineData])
            .attr('class', 'pointer')
            .attr('transform', centerTx);

        pointer = pg.append('path')
            .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';} */)
            .attr('transform', 'rotate(' + config.minAngle + ')');

        update(newValue === undefined ? 0 : newValue);
    },

    centerTranslation: function() {
        return 'translate(' + 100 + ',' + 100 + ')';
    },

    deg2rad: function(deg) {
        return deg * Math.PI / 180;
    },

    newAngle: function(d) {
        var ratio = scale(d);
        var newAngle = config.minAngle + (ratio * range);
        return newAngle;
    },

    configure: function (configuration) {
        var prop = undefined;
        for (prop in configuration) {
            config[prop] = configuration[prop];
        }

        range = config.maxAngle - config.minAngle;
        r = config.size / 2;
        pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

        // a linear scale that maps domain values to a percent from 0..1
        scale = d3.scale.linear()
            .range([0, 1])
            .domain([config.minValue, config.maxValue]);

        ticks = scale.ticks(config.majorTicks);
        tickData = d3.range(config.majorTicks).map(function () { return 1 / config.majorTicks; });

        arc = d3.svg.arc()
            .innerRadius(r - config.ringWidth - config.ringInset)
            .outerRadius(r - config.ringInset)
            .startAngle(function (d, i) {
                var ratio = d * i;
                return deg2rad(config.minAngle + (ratio * range));
            })
            .endAngle(function (d, i) {
                var ratio = d * (i + 1);
                return deg2rad(config.minAngle + (ratio * range));
            });
    },

    isRendered: function () {
        return (svg !== undefined);
    }

});