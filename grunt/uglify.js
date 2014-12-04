module.exports = {
	options:
	{
		mangle: true,
		compress: true,
		banner: "/*! yeep <%= grunt.template.today( 'yyyy-mm-dd' ) %> */",
		sourceMap: true,
		sourceMapName: "build/yeep.js.map"
	},
	project:
	{
		files:
		{
			"build/yeep.min.js": [
				"build/yeep.js"
			]
		}
	}
};
