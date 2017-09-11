/* eslint-env node */

"use strict";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    env: {
      test: {
      },
      coverage: {
        // schema used in tests
        APP_DIR_FOR_CODE_COVERAGE: "./test/coverage/instrument/"
      }
    },
    todo: {
      options: {
        marks: [{
          name: "FIX",
          pattern: /FIXME/,
          color: "red"
        }, {
          name: "TODO",
          pattern: /TODO/,
          color: "yellow"
        }, {
          name: "HACK",
          pattern: /HACK/,
          color: "blue"
        }, {
          name: "NOTE",
          pattern: /NOTE/,
          color: "blue"
        }],
        file: "test/output/report.md",
        githubBoxes: true,
        colophon: true,
        usePackage: true
      },
      src: [
        "./*.js"
      ]
    },
    clean: {
      doc: [
        "doc"
      ],
      output: [
        "test/output"
      ],
      build: [
        "build"
      ],
      coverage: [
        "test/coverage"
      ]
    },
    instrument: {
      files: [
        "app.js",
        "test/*.js"
      ],
      options: {
        lazy: false,
        basePath: "test/coverage/instrument/"
      }
    },
    jshint: {
      options: {
        // options here to override JSHint defaults
        "-W110": true, // disable mixed quotes warning
        node: true,
        force: true,
        reporter: require("jshint-junit-reporter"),
        reporterOutput: "output/jshint.xml"
      },
      src: [
        "lib/**/*.js"
      ]
    },
    jsdoc: {
      // NOTE: May require manual installation of grunt-jsdoc with command: npm install grunt-jsdoc --save-dev
      src: [
        "lib/**/*.js"
      ],
      options: {
        destination: "output/doc"
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: "spec",
          quiet: false
        },
        src: [
         "test/**/*.js"
        ]
      }
    },
    storeCoverage: {
      options: {
        "include-all-sources": true,
        dir: "test/coverage/reports"
      }
    },
    makeReport: {
      src: "test/coverage/reports/**/*.json",
      options: {
        type: ["lcov", "cobertura"],
        dir: "test/coverage/reports",
        print: "detail"
      }
    }
  });

  grunt.loadNpmTasks("grunt-todo");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jsdoc");
  grunt.loadNpmTasks("grunt-mocha-test");
  grunt.loadNpmTasks("grunt-istanbul");
  grunt.loadNpmTasks("grunt-env");

  // Default task(s).
  grunt.registerTask("default", ["jshint", "todo", "test"]);
  grunt.registerTask("build", ["clean:output", "jshint", "jsdoc"]);

  // Run tests
  grunt.registerTask("test", ["env:test", "clean:coverage", "mochaTest"]);
  grunt.registerTask("coverage", ["env:coverage", "clean:coverage", "instrument", "mochaTest", "storeCoverage", "makeReport"]);

};
