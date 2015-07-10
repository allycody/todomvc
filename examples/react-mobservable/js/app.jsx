/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, Router, mobservable*/
var app = app || {};

(function () {
	'use strict';

	app.ALL_TODOS = 'all';
	app.ACTIVE_TODOS = 'active';
	app.COMPLETED_TODOS = 'completed';

	// This is the model of the state of our view
	// For separation of concerns, we defined this separately
	// from the model of our data (see todoModel.js) and the components itself
	// because it is relevant for multiple components, but that is just a matter of taste.
	app.ViewModel = function() {
		mobservable.props(this, {
			nowShowing: app.ALL_TODOS
		});
	};

	var TodoFooter = app.TodoFooter;
	var TodoItem = app.TodoItem;

	var ENTER_KEY = 13;

	var TodoApp = mobservable.ObservingComponent(React.createClass({
		getInitialState: function () {
			return {
				editing: null
			};
		},

		componentDidMount: function () {
			var viewModel = this.props.viewModel;
			var router = Router({
				'/': function() { viewModel.nowShowing = app.ALL_TODOS; },
				'/active': function() { viewModel.nowShowing = app.ACTIVE_TODOS; },
				'/completed': function() { viewModel.nowShowing = app.COMPLETED_TODOS; }
			});
			router.init('/');
		},

		handleNewTodoKeyDown: function (event) {
			if (event.keyCode !== ENTER_KEY) {
				return;
			}

			event.preventDefault();

			var val = React.findDOMNode(this.refs.newField).value.trim();

			if (val) {
				this.props.model.addTodo(val);
				React.findDOMNode(this.refs.newField).value = '';
			}
		},

		toggleAll: function (event) {
			var checked = event.target.checked;
			this.props.model.toggleAll(checked);
		},

		toggle: function (todoToToggle) {
			this.props.model.toggle(todoToToggle);
		},

		destroy: function (todo) {
			this.props.model.destroy(todo);
		},

		edit: function (todo) {
			this.setState({editing: todo.id});
		},

		save: function (todoToSave, text) {
			this.props.model.save(todoToSave, text);
			this.setState({editing: null});
		},

		cancel: function () {
			this.setState({editing: null});
		},

		render: function () {
			var main;
			var todos = this.props.model.todos;
			var model = this.props.model;
			var viewModel = this.props.viewModel;

			var shownTodos = todos.filter(function (todo) {
				switch (viewModel.nowShowing) {
					case app.ACTIVE_TODOS:
						return !todo.completed;
					case app.COMPLETED_TODOS:
						return todo.completed;
					default:
						return true;
				}
			}, this);

			var todoItems = shownTodos.map(function (todo) {
				return (
					<TodoItem
						key={todo.id}
						todo={todo}
						onToggle={this.toggle.bind(this, todo)}
						onDestroy={this.destroy.bind(this, todo)}
						onEdit={this.edit.bind(this, todo)}
						editing={this.state.editing === todo.id}
						onSave={this.save.bind(this, todo)}
						onCancel={this.cancel}
					/>
				);
			}, this);

			// Footer logic was pushed into the footer widget
			// Calculations were pushed to the model itself
			if (todos.length) {
				main = (
					<section id="main">
						<input
							id="toggle-all"
							type="checkbox"
							onChange={this.toggleAll}
							checked={model.activeTodoCount === 0}
						/>
						<ul id="todo-list">
							{todoItems}
						</ul>
					</section>
				);
			}

			return (
				<div>
					<header id="header">
						<h1>todos</h1>
						<input
							ref="newField"
							id="new-todo"
							placeholder="What needs to be done?"
							onKeyDown={this.handleNewTodoKeyDown}
							autoFocus={true}
						/>
					</header>
					{main}
					<TodoFooter model={model} viewModel={viewModel} />
				</div>
			);
		}
	}));

	var model = new app.TodoModel('react-mobservable-todos');
	var viewModel = new app.ViewModel();

	// Render once, all subscriptions are managed automatically
	React.render(
		<TodoApp model={model} viewModel={viewModel}/>,
		document.getElementById('todoapp')
	);

})();