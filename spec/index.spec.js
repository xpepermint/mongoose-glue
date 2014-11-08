var odm = require('..');
var config = require(__dirname+'/app/config/mongoose.js').default;

describe('mongoose', function() {
  describe('model', function() {

    beforeEach(function(done) {
      odm.connect({
        configPath: __dirname+'/app/config/mongoose.js',
        modelsPath: __dirname+'/app/models'
      });
      odm.model('bird').remove({}, done);
    });

    afterEach(function() {
      odm.disconnect();
    });

    it('should handle `discriminators`', function(done) {
      odm.model('bird').create({ name: 'x' }, function(err, data) {
        expect(data.name).toBe('x');
        done();
      });
    });

    it('should handle `instance methods`', function(done) {
      odm.model('bird').create({ name: 'x' }, function(err, data) {
        expect(data.testMethod()).toBe('im');
        done();
      });
    });

    it('should handle `class methods`', function() {
      expect(odm.model('bird').testMethod()).toBe('cm');
    });

    it('should handle `virtuals`', function(done) {
      odm.model('bird').create({ name: 'x',color:'y' }, function(err, data) {
        expect(data.nameAndColor).toBe('x is green'); //green because of middlewares
        done();
      });
    });

    it('should handle `middlewares`', function(done) {
      odm.model('bird').create({ name: 'x' }, function(err, data) {
        expect(data.color).toBe('green');
        done();
      });
    });

  });
});
