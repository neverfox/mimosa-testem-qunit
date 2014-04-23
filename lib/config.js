"use strict";
var fs, path, testemSimple;

path = require("path");

fs = require("fs");

testemSimple = require("mimosa-testem-simple");

exports.defaults = function() {
  var defaults;
  defaults = testemSimple.defaults();
  defaults.testemQUnit = {
    executeDuringBuild: true,
    executeDuringWatch: true,
    safeAssets: [],
    specConvention: /[_-](spec|test)\.js$/,
    assetFolder: ".mimosa/testemQUnit",
    testemConfig: {
      "launch_in_dev": ["Firefox", "Chrome"],
      "launch_in_ci": ["PhantomJS"]
    },
    requireConfig: null
  };
  return defaults;
};

exports.placeholder = function() {
  return testemSimple.placeholder().replace("testem.json", ".mimosa/testemQUnit/testem.json") + "\t\n\n  testemQUnit:                  # Configuration for the testem-qunit module\n    executeDuringBuild            # If true the tests will get executed during build.\n    executeDuringWatch            # If true the tests will get executed during watch with each file change.\n    specConvention: /[_-](spec|test)\.js$/ # Convention for how test specs are named\n    assetFolder: \".mimosa/testemQUnit\"        # Path from the root of the project to the folder that will\n                                  # contain all the testing assets that the testemQUnit\n                                  # module maintains and writes. If the folder does not exist\n                                  # it will be created.\n    safeAssets: []                # An array of file names testem-qunit will not overwrite.\n                                  # By default testem-qunit overwrites any file it outputs.\n                                  # So, for instance, if you have a specific version of\n                                  # \"mocha.js\" you need to use, this setting should be [\"mocha.js\"]\n    testemConfig:                 # Pass through values for the testem.json configuration.\n                                  # The module will write the testem.json for you\n      \"launch_in_dev\": [\"Firefox\", \"Chrome\"] # In dev mode launches in Firefox and Chrome\n      \"launch_in_ci\": [\"PhantomJS\"]          # In CI mode uses PhantomJS (must be installed)\n    requireConfig: {}             # RequireJS configuration. By default the mimosa-require\n                                  # module is used by mimosa-testem-qunit to derive a\n                                  # requirejs config.  But if that derived config isn't right\n                                  # a config can be pasted here.\n";
};

exports.validate = function(config, validators) {
  var errors, folder, newFolderPath, newFolders, _i, _len, _ref;
  errors = [];
  if (validators.ifExistsIsObject(errors, "testemSimple config", config.testemSimple)) {
    validators.ifExistsIsNumber(errors, "testemSimple.port", config.testemSimple.port);
    validators.ifExistsIsString(errors, "testemSimple.configFile", config.testemSimple.configFile);
    if (config.testemSimple.watch != null) {
      if (Array.isArray(config.testemSimple.watch)) {
        newFolders = [];
        _ref = config.testemSimple.watch;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          folder = _ref[_i];
          if (typeof folder === "string") {
            newFolderPath = validators.determinePath(folder, config.root);
            if (fs.existsSync(newFolderPath)) {
              newFolders.push(newFolderPath);
            }
          } else {
            errors.push("testemSimple.watch must be an array of strings.");
          }
        }
        config.testemSimple.watch = newFolders;
      } else {
        errors.push("testemSimple.watch must be an array.");
      }
    }
    validators.ifExistsFileExcludeWithRegexAndString(errors, "testemSimple.exclude", config.testemSimple, config.root);
  }
  if (validators.ifExistsIsObject(errors, "testemQUnit config", config.testemQUnit)) {
    validators.ifExistsIsBoolean(errors, "testemQUnit.executeDuringBuild", config.testemQUnit.executeDuringBuild);
    validators.ifExistsIsBoolean(errors, "testemQUnit.executeDuringWatch", config.testemQUnit.executeDuringWatch);
    if (validators.ifExistsIsString(errors, "testemQUnit.assetFolder", config.testemQUnit.assetFolder)) {
      config.testemQUnit.assetFolderFull = path.join(config.root, config.testemQUnit.assetFolder);
    }
    validators.ifExistsIsObject(errors, "testemQUnit.testemConfig", config.testemQUnit.testemConfig);
    validators.ifExistsIsObject(errors, "testemQUnit.requireConfig", config.testemQUnit.requireConfig);
    validators.ifExistsIsArrayOfStrings(errors, "testemQUnit.safeAssets", config.testemQUnit.safeAssets);
    config.testemSimple.configFile = path.join(config.testemQUnit.assetFolderFull, "testem.json");
  }
  return errors;
};
