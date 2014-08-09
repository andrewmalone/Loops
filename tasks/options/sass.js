module.exports = {
		    dist: {
		      options: {
			    style: 'compressed',
			    loadPath: require('node-bourbon').includePaths 
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
