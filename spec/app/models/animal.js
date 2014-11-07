module.exports = {
  connection: 'main',
  attributes: {
    name: 'string',
    color: 'string'
  },
  classMethods: {
    testMethod: function() { return 'cm' }
  },
  instanceMethods: {
    testMethod: function() { return 'im' }
  },
  plugins: [
    { fn: require('mongoose-timestamp'), options: { index:true } }
  ],
  middleware: {
    pre: [
      { event: 'save', fn: function(next) { this.color = 'green'; next() }}
    ]
  },
  virtuals: {
    nameAndColor:{
      get:function(){
        return this.name + " is " + this.color;
      }
    }
  },
  options: {}
};
