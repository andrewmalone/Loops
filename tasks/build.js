module.exports = function(grunt) {
  grunt.registerTask('build', ['clean', 'sass', 'copy', 'concat', 'autoprefixer']);
  grunt.registerTask('dev', ['build', 'connect', 'watch'])
};