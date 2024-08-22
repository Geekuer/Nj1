module.exports = {
	html: function (title, list, control, body) {
		return `
			<!doctype html>
			<html>

			<head>
				<title>${title}</title>
				<meta charset="utf-8">
				<script>
					const id = new URLSearchParams(window.location.search).get('id');
					
					function confirmAction(action) {
						const forbiddenFiles = ['CSS', 'HTML', 'JavaScript'];
						let message;

						if (action === 'update') {
							message = "This file cannot be updated.";

						} else if (action === 'delete') {
							message = "This file cannot be deleted.";
						}

						if (forbiddenFiles.includes(id)) {
							alert(message);
							return false;

						} else {
							return action === 'delete' ? confirm('Do you really want to delete it?') : true;
						}
					}
					
					function confirmUpdate() {
						return confirmAction('update');
					}

					function confirmDelete() {
						return confirmAction('delete');
					}
				</script>
			</head>

			<body>
				<h1><a href="/">WEB</a></h1>
				<ul>
					${list}
				</ul>
				${control}
				${body}
			</body>
			
			</html>
		`;
	},

	list: function (filelist) {
		let list = '';
		for (let file of filelist) {
			list += `<li><a href="/?id=${file}">${file}</a></li>`;
		}
		
		return list;
	}
};