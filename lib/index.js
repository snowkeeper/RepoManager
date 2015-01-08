var jf = require('jsonfile');
var util = require('util');
var _ = require('lodash');
var EventEmitter = require("events").EventEmitter;
var debug = require('debug')('repoman');
var nodegit = require("nodegit");
var Promise = require('nodegit-promise');
var Repo = require('./repo');


var _defaultRepoJSON = {
	name: false,
	path: false,
	branches: {
		locals: [],
		remotes: [],
		tags: []
	},
	status: {}
}
/**
 * RepoManager Class
 *
 * @api public
 */

var RepoManager = function() {
	
	this.pkg = process.env.HOME + '/repomanager.json';
	
	this._pkg = {};
	
	this._defaultFile = this.pkg;
	
	this.repo = {};
	
	EventEmitter.call(this);
	
	return this;

}

/**
 * attach the event system to RepoManager 
 * */
util.inherits(RepoManager, EventEmitter);

/**
 * The exports object is an instance of RepoManager.
 *
 * @api public
 */
var repoman = module.exports = exports = new RepoManager();

/**
 * get the list of repos.  creates a new file if there is not one
 *
 * @api private
 */

RepoManager.prototype.__pkg = function(file,callback) {
	
	var repoMan = this;
	
	repoMan.addingPkg = true;
	
	repoMan.repos = {};
	
	repoMan.pkg = file || this.pkg || this._defaultFile;
	
	if(!_.isFunction(callback)) {
		callback = function(){};
	}
	
	return jf.readFile(repoMan.pkg,{throws:false}, function(err, obj) {
		if(err)repoMan.emit('pkg get file error',{type:'read',err:err,quit:false});
		if(!obj) {
			return jf.writeFile(repoMan.pkg, {repos:{}}, function(err) {
				if(err)return repoMan.emit('pkg get file error',{type:'write',err:err,quit:true});
				return repoMan.__pkg(repoMan.pkg,callback);
			});
		} else {
			repoMan.addingPkg = false;
			repoMan.repos = obj.repos;
			repoMan._pkg = obj;
			repoMan.emit('repo list',obj.repos);
			return callback(obj.repos);
		}
	});
}

/**
 * grab RepoManager package and set any options 
 *
 * ####Example:
 *
 *     RepoManager.init({pkg:'./repoman.json'});
 *
 * @method init
 * @api public
 */ 
RepoManager.prototype.init = function(config) {
	if(_.isString(config))config = { use:config };
	
	if(!_.isObject(config))config = {};
	
	if(!config.pkg)config.pkg = this._defaultFile;
	
	this.__pkg(config.pkg, function(repos) {
		if(config.use) {
			this.use(config.use);
		}
		this.emit('ready');	
	}.bind(this));
	
	return;
}

/**
 * use repo
 *
 * ####Example:
 *
 *     RepoManager.use('keystone');
 *
 * @method use
 * @api public
 */ 
RepoManager.prototype.use = function(repo) {
	if(!repo || !_.isString(repo)) {
		debug('must add repo name');
		return false;
	}
	if(!_.isObject(this.repos[repo])) {
		debug('repo ' + repo + ' not managed');
		return false;
	}
	
	var repoMan = this;
	
	this.active = repo;
	
	this.repo[repo] = new Repo(this.repos[repo]);
	
	return this.repo[repo];
}



/**
 * add a repo to the library.  
 * Takes the full folder path to the repo directory 
 *
 * ####Example:
 *
 *     RepoManager.add('keystone','/home/snow/projects/github/keystone',callback);
 *
 * @method add
 * @api public
 */ 
RepoManager.prototype.add = function(name,path,callback) {
	var repoMan = this;
	
	if(!_.isFunction(callback)) {
		callback = function(){};
	}
	if(!_.isObject(this.repos)) {
		this.emit('repo add error','Please initiate RepoManager first');
		return callback('Please initiate RepoManager first');
	}
	if(!name || !path) {
		this.emit('repo add error','Please provide a name and path');
		return callback('Please provide a name and path');
	}
	if(_.isObject(this.repos[name])) {
		this.emit('repo add error','Repo ' + name + ' exists.  Please use .update');
		return callback('Repo ' + name + ' exists.  Please use .update');
	}
	var add = function() {
		debug('add new repo');
		this.repos[name] = _.clone(_defaultRepoJSON);
		_.merge(repoMan.repos[name],{
			name: name,
			path: path
		});
		jf.writeFile(this.pkg, {repos:this.repos}, function(err) {
			if(err)return repoMan.emit('repo add error',{type:'write',err:err,quit:true});
			callback(null,'Added repo ' + name + ' to the manager.');
			repoMan.emit('repo add','Added repo ' + name + ' to the manager.');
			return repoMan.__pkg();
		});
	}.bind(this);
	if(this.addingPkg) {
		this.on('repo list',function(repos) {
			add();
		});
	} else {
		add();
	}
	return this;
}


