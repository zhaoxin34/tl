'use strict';
module.exports = function (grunt) {
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);
    // Show elapsed time at the end
    require('time-grunt')(grunt);
    var webPath = '/Users/xinzhao/working/python/tl/web';
    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/* test tl */\n',
        // Task configuration.
        // clean: {
        //     files: ['dist']
        // },
        concat: {
            options: {
                banner: '<%= banner %>',
                separator: '\n'
            },
            basic: {
              src: ['main/js/**/*.js'],
              dest: webPath + '/static/js/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: webPath + '/static/js/<%= pkg.name %>.js',
                dest: webPath + '/static/js/<%= pkg.name %>.min.js'
            }
        },
        // cssmin: {
        //     target: {
        //         files: [{
        //           expand: true,
        //           cwd: 'src/css',
        //           src: ['*.css', '!*.min.css'],
        //           dest: 'dist/css',
        //           ext: '.min.css'
        //         }]
        //     }
        // },
        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            // gruntfile: {
            //     options: {
            //         jshintrc: '.jshintrc'
            //     },
            //     src: 'Gruntfile.js'
            // },
            src: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['main/js/*.js']
            }
            // test: {
            //     options: {
            //         jshintrc: '.jshintrc'
            //     },
            //     src: ['test/**/*.js']
            // }
        },
        /*sass: {
            dist: {
                options: { // Target options
                    style: 'expanded'
                },
                files: {
                    'src/css/lightgallery.css': 'src/sass/lightgallery.scss'
                }
            }
        },*/
        watch: {
            options: {
                spawn: false // add spawn option in watch task
            },
            src: {
                files: '<%= concat.basic.src %>',
                tasks: ['jshint:src', 'concat:basic']
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
    // grunt.registerTask('concat', ['jshint', 'concat']);
};
