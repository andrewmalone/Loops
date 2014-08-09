module.exports = function(grunt) {

    // 1. All configuration goes here
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
		    dist: {
		      options: {
			    style: 'compressed'  
		      },
		      files: [{
		        expand: true,
		        cwd: 'css',
		        src: ['*.scss'],
		        dest: 'dest/',
		        ext: '.css'
		      }]
		    }
		},
        copy: {
	        main: {
		        src: ['*.html', '!_*'],
		        dest: 'dest/'
	        }
        }
		/*
shell: {
            jekyllBuild: {
                command: 'jekyll build --drafts'
            },
            jekyllPublish: {
	            command: 'jekyll build'
            }
        },
		connect: {
            server: {
                options: {
                    port: 8080,
                    base: '_site'
                }
            }
        },
		watch: {
          livereload: {
            files: [
                '_config.yml',
                'index.html',
                '_layouts/**',
                '_posts/**',
                '_drafts/**',
                '_includes/**',
                'css/**'
            ],
            tasks: ['sass', 'autoprefixer', 'shell:jekyllBuild'],
            options: {
              livereload: true
            },
          },
        },
        sass: {
		    dist: {
		      options: {
			    style: 'compressed'  
		      },
		      files: {
		        'css/main.css': 'css/main.scss'
		      }
		    }
		},
		autoprefixer: {
			options: {
				browsers: ['last 2 version']
			},
			single_file: {
				src: 'css/main.css',
				dest: 'css/main_prefixed.css'
			}
		}
*/
    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    //grunt.loadNpmTasks('grunt-contrib-concat');
    //grunt.loadNpmTasks('grunt-contrib-uglify');
/*
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-autoprefixer');
*/
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-sass');    

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
   // grunt.registerTask('default', ['sass', 'autoprefixer', 'shell:jekyllBuild', 'connect', 'watch']);
	//grunt.registerTask('publish', ['sass', 'autoprefixer', 'shell:jekyllPublish']);

};