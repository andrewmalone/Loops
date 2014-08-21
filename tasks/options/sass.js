module.exports = {
		    dist: {
		      options: {
			    style: 'nested'
		      },
		      files: [{
		        expand: true,
		        cwd: 'dev/css',
		        src: ['*.scss'],
		        dest: 'build/css',
		        ext: '.css'
		      }]
		    }
		}
