QUnit.config.autostart = false;

require.config(window.MIMOSA_TEST_REQUIRE_CONFIG);
require(['../testem'], function(){
  require(window.MIMOSA_TEST_SPECS, function(module){
    QUnit.start();
  });
});
