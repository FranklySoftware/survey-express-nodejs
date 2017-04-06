var _ = require('underscore');
var CSV = require('nodecsv');

module.exports = function( callback ) {
	CSV.readCSV(__dirname+'/i18n-translation-data.csv', function(error, data){
		//data is a array of array
//		console.log(data);

		var langs = {};
		var i18n = {};
		var i18nTrans = {};

		var header = data[0];
		var records = _.rest(data, 1)

		_.each (header,function(lang,i){
			console.log('DATA=',lang,i);
			if (lang) {
				langs[lang] = i;
				i18n[lang] = {}
				i18nTrans[lang] = {}
			}
		});

		var section = '';
		_.each (records,function(row,r){
			var enValue = row[langs['en']];
			if (row[0] && !enValue) {
				section = row[0].toUpperCase();
			} else if (enValue) {
		        var key = enValue.toLowerCase().replace(/[^a-zA-Z0-9]+/g,'-').replace(/[-]+/g,'-').replace(/^-/,'').replace(/-$/,'');

				var subSection = row[0];
				if (!subSection)
					subSection = key;

				_.each (langs,function(i,lang){
//					console.log('lang=',lang,i);

					i18n[lang][section+'_'+subSection] = row[i];

					i18nTrans[lang][key] = row[i];

				});
			}
		});
		
		callback( i18n, i18nTrans )
	});
};
