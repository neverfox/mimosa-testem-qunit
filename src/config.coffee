"use strict"

path = require "path"
fs = require "fs"

testemSimple = require "mimosa-testem-simple"

exports.defaults = ->
  defaults = testemSimple.defaults()

  defaults.testemQUnit =
    executeDuringBuild: true
    executeDuringWatch: true
    safeAssets: []
    specConvention: /[_-](spec|test)\.js$/
    assetFolder:".mimosa/testemQUnit"
    testemConfig:
      "launch_in_dev": ["Firefox", "Chrome"]
      "launch_in_ci": ["PhantomJS"]
    requireConfig: null

  defaults

exports.placeholder = ->
  testemSimple.placeholder().replace("testem.json", ".mimosa/testemQUnit/testem.json") +
  """
  \t

    testemQUnit:                  # Configuration for the testem-qunit module
      executeDuringBuild            # If true the tests will get executed during build.
      executeDuringWatch            # If true the tests will get executed during watch with each file change.
      specConvention: /[_-](spec|test)\.js$/ # Convention for how test specs are named
      assetFolder: ".mimosa/testemQUnit"        # Path from the root of the project to the folder that will
                                    # contain all the testing assets that the testemQUnit
                                    # module maintains and writes. If the folder does not exist
                                    # it will be created.
      safeAssets: []                # An array of file names testem-qunit will not overwrite.
                                    # By default testem-qunit overwrites any file it outputs.
                                    # So, for instance, if you have a specific version of
                                    # "mocha.js" you need to use, this setting should be ["mocha.js"]
      testemConfig:                 # Pass through values for the testem.json configuration.
                                    # The module will write the testem.json for you
        "launch_in_dev": ["Firefox", "Chrome"] # In dev mode launches in Firefox and Chrome
        "launch_in_ci": ["PhantomJS"]          # In CI mode uses PhantomJS (must be installed)
      requireConfig: {}             # RequireJS configuration. By default the mimosa-require
                                    # module is used by mimosa-testem-qunit to derive a
                                    # requirejs config.  But if that derived config isn't right
                                    # a config can be pasted here.

  """

exports.validate = (config, validators) ->

  errors = []

  # testem-qunit wraps testem-simple, need to validate both
  # can't just call testemsimple validate because config file
  # might not exist and that is ok
  if validators.ifExistsIsObject(errors, "testemSimple config", config.testemSimple)
    validators.ifExistsIsNumber(errors, "testemSimple.port", config.testemSimple.port)
    validators.ifExistsIsString(errors, "testemSimple.configFile", config.testemSimple.configFile)

    if config.testemSimple.watch?
      if Array.isArray(config.testemSimple.watch)
        newFolders = []
        for folder in config.testemSimple.watch
          if typeof folder is "string"
            newFolderPath = validators.determinePath folder, config.root
            if fs.existsSync newFolderPath
              newFolders.push newFolderPath
          else
            errors.push "testemSimple.watch must be an array of strings."
        config.testemSimple.watch =  newFolders
      else
        errors.push "testemSimple.watch must be an array."

    validators.ifExistsFileExcludeWithRegexAndString(errors, "testemSimple.exclude", config.testemSimple, config.root)


  if validators.ifExistsIsObject(errors, "testemQUnit config", config.testemQUnit)
    validators.ifExistsIsBoolean(errors, "testemQUnit.executeDuringBuild", config.testemQUnit.executeDuringBuild)
    validators.ifExistsIsBoolean(errors, "testemQUnit.executeDuringWatch", config.testemQUnit.executeDuringWatch)
    if validators.ifExistsIsString(errors, "testemQUnit.assetFolder", config.testemQUnit.assetFolder)
      config.testemQUnit.assetFolderFull = path.join config.root, config.testemQUnit.assetFolder
    validators.ifExistsIsObject(errors, "testemQUnit.testemConfig", config.testemQUnit.testemConfig)
    validators.ifExistsIsObject(errors, "testemQUnit.requireConfig", config.testemQUnit.requireConfig)
    validators.ifExistsIsArrayOfStrings(errors, "testemQUnit.safeAssets", config.testemQUnit.safeAssets)

    config.testemSimple.configFile = path.join config.testemQUnit.assetFolderFull, "testem.json"

  errors
