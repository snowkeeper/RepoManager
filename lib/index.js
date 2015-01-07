var jf = require('jsonfile');
var util = require('util');
var _ = require('lodash');
var EventEmitter = require("events").EventEmitter;


/**
 * RepoManager Class
 *
 * @api public
 */

var RepoManager = function() {
	
	this.repos = {};
	
	this._defaultFile = './repomanager.json';
	
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

RepoManager.prototype.__pkg = function(file) {
	
	var repoMan = this;
	
	return jf.readFile(file,{throws:false}, function(err, obj) {
		if(err)repoMan.emit('pkg file error',{type:'read',err:err,quit:false});
		if(!obj) {
			return jf.writeFile(file, {repos:{}}, function(err) {
				if(err)return repoMan.emit('pkg file error',{type:'write',err:err,quit:true});
				return repoMan.__pkg(file);
			});
		} else {
			return repoMan.emit('pkg file',obj);
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
	if(!_.isObject(config))config = {};
	if(!config.pkg)config.pkg = this._defaultFile;
	
	this.__pkg(config.pkg);
	
}

