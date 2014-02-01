module("HumanModel.Speed");

test("initialize 100000 bare models", function () {
  var Model = HumanModel.define();
  var Collection = Backbone.Collection.extend({
    model: Model
  });
  var coll = new Collection();
  var i = 100000;
  var data = [];
  while (i--) {
    data.push({});
  }

  console.time('add')
  coll.add(data);
  console.timeEnd('add');
  console.log(coll.length);
  ok(true);
});

test("initialize 100000 models with basic props", function () {
  var Model = HumanModel.define({
    props: {
      firstName: 'string',
      lastName: 'string'
    }
  });
  var Collection = Backbone.Collection.extend({
    model: Model
  });
  var coll = new Collection();
  var i = 100000;
  var data = [];
  while (i--) {
    data.push({
      firstName: 'first' + i,
      lastName: 'last' + i
    });
  }
  console.log('built');

  console.time('add')
  coll.add(data);
  console.timeEnd('add');
  console.log(coll.length);
  ok(true);
});


