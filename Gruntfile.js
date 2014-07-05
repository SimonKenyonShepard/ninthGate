module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      build: {
        src: ["build"]
      }
    },
    copy: {
      main: {
        files: [
          // includes files within path
          {expand: true, cwd: 'public/js', src: '**/*.js', dest: 'build/js/'},
          {expand: true, cwd: 'views', src: ['index.html'], dest: 'build/'}

        ]
      }
    }
    
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('build-gh-pages', ['clean', 'copy:main']);

};