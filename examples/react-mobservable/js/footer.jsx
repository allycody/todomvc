/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global React, mobservable */
var app = app || {};

(function () {
	'use strict';

	app.TodoFooter = mobservable.ObservingComponent(React.createClass({
		render: function () {
			var model = this.props.model;
			var nowShowing = this.props.viewModel.nowShowing;

			if (!model.activeTodoCount && !model.completedCount)
				return null;

			var activeTodoWord = app.Utils.pluralize(model.activeTodoCount, 'item');
			var clearButton = null;

			if (model.completedCount > 0) {
				clearButton = (
					<button
						id="clear-completed"
						onClick={this.clearCompleted}>
						Clear completed
					</button>
				);
			}

			// React idiom for shortcutting to `classSet` since it'll be used often
			var cx = React.addons.classSet;
			return (
				<footer id="footer">
					<span id="todo-count">
						<strong>{model.activeTodoCount}</strong> {activeTodoWord} left
					</span>
					<ul id="filters">
						<li>
							<a
								href="#/"
								className={cx({selected: nowShowing === app.ALL_TODOS})}>
									All
							</a>
						</li>
						{' '}
						<li>
							<a
								href="#/active"
								className={cx({selected: nowShowing === app.ACTIVE_TODOS})}>
									Active
							</a>
						</li>
						{' '}
						<li>
							<a
								href="#/completed"
								className={cx({selected: nowShowing === app.COMPLETED_TODOS})}>
									Completed
							</a>
						</li>
					</ul>
					{clearButton}
				</footer>
			);
		},

		clearCompleted: function () {
			this.props.model.clearCompleted();
		}
	}));
})();
