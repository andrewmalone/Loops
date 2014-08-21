module.exports = function(grunt) {
  grunt.registerTask('build', ['clean', 'sass', 'copy', 'concat', 'autoprefixer', 'cssmin']);
  grunt.registerTask('dev', ['build', 'connect', 'watch'])
};