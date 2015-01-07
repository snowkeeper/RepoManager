var RepoMan = require('./lib');



RepoMan.init({
	//pkg: './repoman.json'
});

RepoMan.on('pkg file',function(obj) {
	console.log('package',obj);
});
RepoMan.on('pkg file error',function(error) {
	console.log('pkg error',error);
});

