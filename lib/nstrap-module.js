'use strict';

var merge      = require('lodash.merge'),
    isString   = require('lodash.isstring'),
    isFunction = require('lodash.isfunction'),
    util       = require('util');

function NStrapInterface(config) {
  this.config = merge({
    name:         null,
    task:         null,
    dependencies: [],
    supplier:     null,
    result:       null
  }, config || {});
}

NStrapInterface.prototype.setName = function setName(name) {
  this.config.name = name;
  return this;
};

NStrapInterface.prototype.getName = function getName() {
  return this.config.name;
};

NStrapInterface.prototype.setTask = function setTask(task) {
  this.config.task = task;
  return this;
};

NStrapInterface.prototype.getTask = function getTask() {
  return this.config.task;
};

NStrapInterface.prototype.addDependency = function addDependency() {
  var args = Array.prototype.slice.call(arguments);

  this.config.dependencies.push.apply(this.config.dependencies, args);
  return this;
};

NStrapInterface.prototype.getDependencies = function getDependencies() {
  return this.config.dependencies;
};

NStrapInterface.prototype.setSupplier = function setSupplier(value) {
  this.config.supplier = value;
  return this;
};

NStrapInterface.prototype.getSupplier = function getSupplier() {
  return this.config.supplier;
};

NStrapInterface.prototype.setResult = function setResult(result) {
  this.config.result = result;
  return this;
};

NStrapInterface.prototype.getResult = function getResult() {
  return this.config.result;
};

NStrapInterface.prototype.isValid = function isValid() {
  var index, dependency;

  function generateError(message) {
    return new Error(util.format('%s: %s', 'NStrapInterface validation failed', message));
  }

  if (!isString(this.config.name)) {
    return generateError(util.format('The obtained name "%s" is not a string', this.config.name));
  }

  if (!isFunction(this.config.task)) {
    return generateError(util.format('The obtained task is not a function (got "%s")', typeof this.config.task));
  }

  for (index = 0; index < this.config.dependencies.length; index++) {
    dependency = this.config.dependencies[index];

    if (!isString(dependency)) {
      return generateError('The dependency at position %d is not valid (expect string, got: %s)', index, typeof dependency);
    }
  }

  if (null !== this.config.supplier && !isFunction(this.config.supplier)) {
    return generateError(util.format('The obtained supplier is not a function (got "%s")', typeof this.config.supplier));
  }

  return true;
};

module.exports = NStrapInterface;