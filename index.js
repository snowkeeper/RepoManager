var RepoMan = require('repoman');


RepoMan.init('keystone');



RepoMan.on('repo list',function(obj) {
	console.log('repo list loaded');
});
RepoMan.on('pkg get file error',function(error) {
	console.log('pkg error',error);
});
RepoMan.on('repo add',function(msg) {
	console.log('repo add',msg);
});
RepoMan.on('repo add error',function(error) {
	console.log('repo add error',error);
});

RepoMan.on('ready',function() {
	console.log('ready');
	//RepoMan.add('keystone','/home/snow/projects/github/keystone');
	//RepoMan.add('keystone2','/home/snow/projects/github/keystone2');
	//RepoMan.use('test');
});

RepoMan.on('use repo',function(repo) {
	console.log('use repo',repo);
});

