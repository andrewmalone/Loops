module.exports = function(grunt) {
  grunt.registerTask('build', ['clean', 'sass', 'copy', 'concat'])
};