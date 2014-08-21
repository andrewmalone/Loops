module.exports = {
	main: {
				cwd: 'dev/',
				expand: true,
		        src: ['*.html', '!_*', 'Ruffrider/**', 'save/**'],
		        dest: 'build/'
	        }
}