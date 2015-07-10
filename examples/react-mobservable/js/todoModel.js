/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global mobservable */

var app = app || {};

(function () {
	'use strict';

	var Utils = app.Utils;

	// This is the model of our data
	// Also we put derived data in here, for easier re-use,
	// These kind of calculations should not be done in components
	// Note that all data in the model is reactive
	// So changes in the todo's array automatically propage to
	// computed properties like activeTodoCount
	app.TodoModel = function(key) {
		mobservable.props(this, {
			key: key,
			todos: [],
			activeTodoCount: function() {
				return this.todos.reduce(function (accum, todo) {
					return todo.completed ? accum : accum + 1;
				}, 0);
			},
			completedCount: function() {
				return this.todos.length - this.activeTodoCount;
			}
		});
		this.readFromLocalStorage();
		this.subscribeLocalStorageToModel();
	};

	app.TodoModel.prototype.readFromLocalStorage = function(model) {
		Utils.getDataFromStore(this.key).map(function(data) {
			this.todos.push(new app.Todo(data.id, data.title, data.completed));
		}, this);
	}

	app.TodoModel.prototype.subscribeLocalStorageToModel = function(model) {
		// store the model whenever the key or todos (or something inside that) changes
		// localStorage itself isn't an observing thing, so that is why we rely
		// on sideEffect to observe and pass on the data to the storage
		mobservable.sideEffect(function() {
			Utils.storeData(this.key, this.todos);
		}, this);
	};

	app.TodoModel.prototype.addTodo = function (title) {
		this.todos.push(new app.Todo(Utils.uuid(), title, false));
		// Note: no inform() calls anymore! All changes in the model
		// are automatically propagated to the proper components
	};

	app.TodoModel.prototype.toggleAll = function (checked) {
		this.todos.forEach(function (todo) {
			todo.completed = checked;
		});
	};

	app.TodoModel.prototype.toggle = function (todoToToggle) {
		todoToToggle.completed = !todoToToggle.completed;
	};

	app.TodoModel.prototype.destroy = function (todo) {
		this.todos.remove(todo);
	};

	app.TodoModel.prototype.save = function (todoToSave, text) {
		todoToSave.title = text;
	};

	app.TodoModel.prototype.clearCompleted = function () {
		this.todos = this.todos.filter(function (todo) {
			return !todo.completed;
		});
	};

	// Class representing a Todo item (it is not necessary to use a class, but it is nice)
	app.Todo = function(id, title, completed) {
		mobservable.props(this, {
			id: id,
			title: title,
			completed: completed
		});
	};

})();
