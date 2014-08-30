module.exports = {
  connection: 'main',
  attributes: {
    name: 'string'
  },
  classMethods: {
    imethod: function() {}
  },
  instanceMethods: {},
  plugins: [
    { fn: require('mongoose-timestamp'), options: { index:true } }
  ],
  middleware: {
    pre: [
      { event: 'save', fn: function(next) { next() }}
    ],
    post: [
      { event: 'save', fn: function(model) { }}
    ]
  },
  options: {}
};
