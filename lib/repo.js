var _ = require('lodash');
var debug = require('debug')('repoman-class');
var nodegit = require("nodegit");
var Promise = require('nodegit-promise');
var util = require('util');
var repoman = require('./index');

/**
 * Repo Class
 *
 * @param {String} key
 * @param {Object} options
 * @api public
 */

function Repo(repo) {
	if (!(this instanceof Repo)) return new Repo(repo);
	
	/**
	 * attach the repo 
	 * */
	_.each(repo,function(v,k) {
		this[k] = v;
		//debug(k,v);
	},this);
	
	/* add the branches */
	this.getBranches(function() {
		repoman.emit('use repo');
	}.bind(this));
	
	
}

Repo.prototype.getBranches = function(callback) {
	
	if(!_.isFunction(callback)) {
		callback = function(){};
	} 
	var _this = this;

	var gitRepo;
	var list = nodegit.Repository.open(_this.path + '/.git');
	list.then(function(repoResult) {
		gitRepo = repoResult;
		_this.repo = repoResult;
		
		debug("Opened repository.");
	})
	.then(function() {
		// ### References

		// The [reference API][ref] allows you to list, resolve, create and update
		// references such as branches, tags and remote references (everything in
		// the .git/refs directory).

		return gitRepo.getReferenceNames(nodegit.Reference.TYPE.ALL);
	})
	.then(function(referenceNames) {
		var promises = [];

		referenceNames.forEach(function(referenceName) {
			promises.push(gitRepo.getReference(referenceName).then(function(reference) {
				if (reference.isConcrete()) {
					_this._addRefs.call(_this,referenceName);
				} else if (reference.isSymbolic()) {
					//console.log("Reference:", referenceName, reference.symbolicTarget());
				}
			}));
		});

		return Promise.all(promises);
	})
	.done(function() {
		repoman.emit('branches update',_this);
		callback()
	});
}

/**
 * add a branch
 *
 * @method _addRefs
 * @api private
 */ 
Repo.prototype.addBranch = function(branch) {
	
	var repo = this;
	debug('add',repo)
	return nodegit.Branch.create(repo.repo, branch);
	
}


/**
 * populate the branch and tag objects
 *
 * @method _addRefs
 * @api private
 */ 
Repo.prototype._addRefs = function(ref) {
	var s = ref.split('/');
	var repo = this;
	
	if(s[1] === 'heads') {
		repo.branches.locals.push(s[2]);
	} else if(s[1] === 'remotes') {
		repo.branches.remotes.push(s[2]+ '/' + s[3]);
	} else if(s[1] === 'tags') {
		repo.branches.tags.push(s[2]);
	}
}

exports = module.exports = Repo;
