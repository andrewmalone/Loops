module.exports = {
		    dist: {
		      options: {
			    style: 'nested'
		      },
		      files: [{
		        expand: true,
		        cwd: 'css',
		        src: ['*.scss'],
		        dest: 'build/css',
		        ext: '.css'
		      }]
		    }
		}
