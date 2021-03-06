'use strict';

var chai         = require('chai'),
    cap          = require('chai-as-promised'),
    Promise      = require('bluebird'),
    exported     = require('../'),
    NStrap       = exported.NStrap,
    NStrapModule = exported.NStrapModule;

chai.use(cap);
chai.should();

describe('module', function () {
  it('returns a function which returns an instance of NStrap', function () {
    exported().should.be.an.instanceof(NStrap);
  });
});

describe('NStrap', function () {
  var current;

  beforeEach(function () {
    current = new NStrap();
  });

  afterEach(function () {
    current = undefined;
  });

  describe('addModule', function () {
    it('throws an error if the obtained argument is not an instance of NStrapModule', function () {
      (function () {
        current.addModule(1337);
      }).should.throw(Error);
    });
  });

  describe('add', function () {
    it('appends the supplied modules', function (next) {
      current.add('example', [], function (done) { done(1337); }, function () {
        current.add('example:config', function () {});
      });

      process.nextTick(function () {
        current.registry.should.have.length(2);
        next();
      });
    });

    it('accepts two arguments (name and task)', function () {
      function example() {}
      current.add('example', example);

      current.get('example').getName().should.equal('example');
      current.get('example').getTask().should.equal(example);
    });

    it('accepts three arguments (name, deps and task)', function () {
      var dependencies = ['a'];

      function example() {}
      current.add('example', dependencies, example);

      current.get('example').getName().should.equal('example');
      current.get('example').getDependencies()[0].should.equal('a');
      current.get('example').getTask().should.equal(example);
    });

    it('stores the necessary information on registry and registryMap', function () {
      current.add('example', function () {});

      current.registry.should.have.length(1);
      current.registryMap.should.have.property('example');
    });
  });

  describe('get', function () {
    it('returns an instance of NStrapModule', function () {
      current.add('example', function () {});
      current.get('example').should.be.an.instanceof(NStrapModule);
    });
  });

  describe('logical tract', function () {
    it('rejects if an interface is not valid', function (next) {
      var example = new NStrapModule();

      example.setName(1337);
      current.add(example);

      current.run().should.be.rejected.and.notify(next);
    });

    it('resolves correctly', function (next) {
      current.add('l', function (done) {
        done(1);
      });

      current.add('e', function (done) {
        done(3);
      });

      current.add('t', function () {
        return new Promise(function (resolve) {
          resolve(7);
        });
      });

      current.add('leet', ['l', 'e', 'e', 't'], function (l, e1, e2, t, done) {
        done([l, e1, e2, t].join(''));
      });

      process.nextTick(function () {
        current.get('leet').getResult().should.eventually.equal('1337').and.notify(next);
      });

      current.run();
    });

    it('returns the same runner instance', function () {
      current.add('test', function (done) {
        done('test');
      });

      current.run().should.equal(current.run());
    });

    describe('rejects if one task fails...', function () {
      it('using the callback', function (next) {
        current.add('fail', function (done) {
          done(new Error('Something went wrong'));
        });

        current.run().should.be.rejected.and.notify(next);
      });
    });
  });
});