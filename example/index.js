var odm = require('..');
odm.connect();

odm.model('bird').create({ name: "Flappy" }, function(err, data) {
  console.log('Flappy bird created:', data);

  // list all birds
  odm.model('bird').find().exec(function(err, data) {
    console.log('All birds count:', data.length);
  });
});
