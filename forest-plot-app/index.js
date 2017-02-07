import d3_save_svg from 'd3-save-svg';
import * as d3 from 'd3';


var plotConfig = {
  mountNode: '#svg',
  effectLabel: 'Odds Ratio',
  vBar: 1,
  nTicks: 6
};


var data = [
  {
    description: 'PCSK9 score above median',
    effect: {effect: 0.92, low: 0.88, high: 0.95},
    markerSize: 0.5
  },
  {
    description: 'Quartile of PCSK9 scores',
  },
  {
    description: '4',
    descriptionOffset: 1,
    effect: {effect: 0.89, low: 0.84, high: 0.94},
    markerSize: 0.5
  },
  {
    description: '3',
    descriptionOffset: 1,
    effect: {effect: 0.93, low: 0.88, high: 0.98},
    markerSize: 0.5
  },
  {
    description: '2',
    descriptionOffset: 1,
    effect: {effect: 0.97, low: 0.91, high: 1.03},
    markerSize: 0.5
  },
  {
    description: '1',
    descriptionOffset: 1,
    effect: {effect: 1, low: 1, high: 1},
    markerSize: 0.5,
    overrideLabel: 'Reference'
  },
];


function forestPlot(config, data) {

  var config = {
    mountNode: config.mountNode || '#svg',
    width: config.width || 800,
    margin: config.margin || { left: 20, top: 20 },
    effectLabel: config.effectLabel || 'Effect',
    fontSize: config.fontSize || 12,
    fontFamily: config.fontFamily || 'Helvetica',
    nTicks: config.nTicks || 5,
    vBar: (config.vBar !== undefined) ? config.vBar: null
  };

  var layout = {
    tabWidth: 12,  // In pixels
    tableWidth: 0.3,
    plotWidth: 0.4,
    labelWidth: 0.3,
    rowHeight: 26,
    padding: { left: 5, top: 10 },
    squareFullSize: 24
  };

  config.height = (data.length + 3) * layout.rowHeight;

  function translate(x, y) {
    return 'translate(' + x + ', ' + y + ')';
  };

  var svg = d3.select('#svg').append('svg')
    .attr('width', config.width)
    .attr('height', config.height)
    .append('g')
    .attr('transform', translate(config.margin.left, config.margin.top))

  /**
   * Create the table.
   **/
  var table = svg.append('g')
    .attr('width', layout.tableWidth * config.width)

  var rows = table.selectAll('.row').data(data).enter()
    .append('g')
      .classed('row', true)
      .attr('transform', function(d, i) {
        return translate(
          0,
          layout.rowHeight * i
        );
      });

  rows
    .append('rect')
      .attr('height', layout.rowHeight)
      .attr('width', '100%')
      .attr('fill', (d, i) => { return (i % 2 === 0)? '#f2f1f1': '#fff' })
      .attr('x', 0)
      .attr('y', 0)

  rows
    .append('text')
      .text(function(d) { return d.description; })
      .style('font-size', config.fontSize)
      .style('font-family', config.fontFamily)
      .attr('dy', (layout.rowHeight - config.fontSize) / 2 + 10)
      .attr('dx', function(d) {
        return (
          layout.padding.left +
          (d.descriptionOffset || 0) * layout.tabWidth
        );
      })

  /**
   * Create the plot.
   **/
  var plot = svg.append('g')
    .attr('width', layout.plotWidth * config.width)
    .attr('transform', translate(layout.tableWidth * config.width, 0))
    .classed('plot', true)

  // Define scale and axis.
  var lowX = d3.min(data, function(d) {
    try { return d.effect.low; }
    catch (e) { return Infinity; }
  });

  var highX = d3.max(data, function(d) {
    try { return d.effect.high; }
    catch (e) { return -Infinity; }
  });

  var x = d3.scaleLinear()
    .domain([lowX - Math.abs(0.1 * lowX), highX + Math.abs(0.1 * highX)])
    .range([0, config.width * layout.plotWidth])

  var xAxis = d3.axisBottom(x)
    .ticks(config.nTicks);

  plot.append('g')
    .attr('transform', function() {
      return translate(0, data.length * layout.rowHeight + 5);
    })
    .call(xAxis)
    .append('g')
      .attr('transform', translate(0, layout.rowHeight + layout.padding.top))
      .append('text')
      .text(config.effectLabel)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .attr('x', layout.plotWidth * config.width / 2)
      .style('font-weight', 'bold')
      .style('font-size', config.fontSize)

  // Add the effect bars.
  var trees = plot.selectAll('.tree').data(data).enter()
    .append('g')
    .classed('tree', true)
    .attr('transform', function(d, i) {
      if (!d.effect) return;

      return translate(0, i * layout.rowHeight);
    })

  trees.append('line')
    .attr('x1', function(d) {
      try {
        return x(d.effect.low);
      } catch(e) { return 0; }
    })
    .attr('x2', function(d) {
      try {
        return x(d.effect.high);
      } catch(e) { return 0; }
    })
    .attr('y1', layout.rowHeight / 2)
    .attr('y2', layout.rowHeight / 2)
    .attr('stroke-width', 1)
    .attr('stroke', '#000')

  trees.append('rect')
    .filter(function(d) {
      try {
        d.effect.effect;
        d.effect.low;
        d.effect.high;
        return true;
      } catch (e) { return false; }
    })
    .datum(function(d) {
      d.r = (d.markerSize || 1) * layout.squareFullSize;
      return d;
    })
    .attr('x', function(d) {
      return x(d.effect.effect) - d.r / 2;
    })
    .attr('y', function(d) { return layout.rowHeight / 2 - d.r / 2; })
    .attr('width', function(d) { return d.r; })
    .attr('height', function(d) { return d.r; })

  if (config.vBar !== null) {
    plot.append('line')
      .attr('x1', x(config.vBar))
      .attr('x2', x(config.vBar))
      .attr('y1', 0)
      .attr('y2', data.length * layout.rowHeight)
      .attr('stroke-width', 1)
      .attr('stroke', '#444')
      .attr('stroke-dasharray', '5, 5')
      .classed('vbar', true)
  }

  /**
   * Add the effect labels.
   **/
  var effectLabels = svg.append('g')
    .attr('width', layout.labelWidth * config.width)

  var labels = table.selectAll('.label').data(data).enter()
    .append('g')
      .classed('label', true)
      .attr('transform', function(d, i) {
        return translate(
          (layout.tableWidth + layout.plotWidth) * config.width + 15,
          layout.rowHeight * i
        );
      });

  labels
    .filter(function(d) {
      try {
        // We display label if it is overriden or if all the values are
        // available.
        if (d.overrideLabel) return true;

        d.effect.effect;
        d.effect.low;
        d.effect.high;
        return true;
      } catch (e) { return false; }
    })
    .append('text')
      .text(function(d) {
        if (d.overrideLabel) return d.overrideLabel

        return (`${d.effect.effect.toFixed(2)} ` +
                `(${d.effect.low.toFixed(2)}, ${d.effect.high.toFixed(2)})`);
      })
      .style('font-size', config.fontSize)
      .style('font-family', config.fontFamily)
      .attr('dy', (layout.rowHeight - config.fontSize) / 2 + 10)
      .attr('dx', layout.padding.left)

  document.getElementById('save').addEventListener('click', (evnt) => {
    d3_save_svg.save(d3.select('svg').node(), { filename: 'forestplot' })
  });

}


// First plot with default values.
forestPlot(plotConfig, data);
