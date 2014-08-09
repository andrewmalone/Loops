module.exports = function(grunt) {
	// Utility to load the different option files
	// based on their names
	function loadConfig(path) {
		var glob = require('glob');
		var object = {};
		var key;
		
		glob.sync('*', {cwd: path}).forEach(function(option) {
			key = option.replace(/\.js$/,'');
			object[key] = require(path + option);
		});
	
		return object;
	}
	grunt.loadTasks('tasks');
    var config = {
    	pkg: grunt.file.readJSON('package.json')
	}
	
	grunt.util._.extend(config, loadConfig('./tasks/options/'));
	grunt.initConfig(config);

    require('load-grunt-tasks')(grunt);
	grunt.registerTask('default', ['copy']);
};