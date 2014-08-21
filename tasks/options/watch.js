module.exports = {
	dev: {
		files: ['dev/*.html', 'dev/css/*.scss', 'dev/js/*.js'],
		tasks: 'build',
		options: {
			livereload: true
		}
	}
}