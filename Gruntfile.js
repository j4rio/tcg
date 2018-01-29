/* eslint-env node */

"use strict";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    env: {
      test: {
        API_SWAGGER_FILE: "./api/tcg.yaml"
      },
      coverage: {
        API_SWAGGER_FILE: "./api/tcg.yaml"
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: "spec",
          quiet: false
        },
        src: "test/*.js"
      }
    },
    mocha_istanbul: {
      coverage: {
        src: 'test', // a folder works nicely 
        options: {
          coverageFolder: "test/coverage",
          mochaOptions: ["--exit"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-mocha-test");
  grunt.loadNpmTasks("grunt-mocha-istanbul");
  grunt.loadNpmTasks("grunt-env");

  // Run tests
  grunt.registerTask("test", ["env:test", "mochaTest"]);
  grunt.registerTask("coverage", ["env:coverage", "mocha_istanbul:coverage"]);

};
