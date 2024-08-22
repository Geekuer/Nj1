const fs = require('fs');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const template = require('./template');
const url = require('url');
const qs = require('querystring');

module.exports = {
	home: function (request, response) {
		fs.readdir('./data', (error, filelist) => {
			if (error) {
				throw error;
			}

			const title = 'Welcome';
			const description = 'Hello, Node.js';
			const list = template.list(filelist);
			const html = template.html(title, list,
				`<a href="/create">Create</a>`,
				`<h2>${title}</h2>${description}`
			);

			response.writeHead(200);
			response.end(html);
		});
	},

	page: function (request, response) {
		fs.readdir('./data', (error, filelist) => {
			if (error) {
				throw error;
			}

			const { query } = url.parse(request.url, true);
			const filteredOld_title = path.parse(query.id).base;

			fs.readFile(`data/${filteredOld_title}`, 'utf-8', (error2, description) => {
				if (error2) {
					response.writeHead(404);
					response.end('Not Found');
					
				} else {
					const title = query.id;
					const sanitizeTitle = sanitizeHtml(title);
					
					const sanitizeDescription = sanitizeHtml(description);
					const list = template.list(filelist);
					const html = template.html(sanitizeTitle, list,
						`<a href="/create">Create</a>
						<a href="/update?id=${sanitizeTitle}" onclick="return confirmUpdate()">Update</a>
						<form action="/delete_process" method="post" onsubmit="return confirmDelete()">
							<input type="hidden" name="title" value="${sanitizeTitle}">
							<input type="submit" value="Delete">
						</form>`,
						`<h2>${sanitizeTitle}</h2>${sanitizeDescription}`
					);
	
					response.writeHead(200);
					response.end(html);
				}
			});
		});
	},

	create: function (request, response) {
		fs.readdir('./data', (error, filelist) => {
			if (error) {
				throw error;
			}

			const title = 'Create';
			const list = template.list(filelist);
			const html = template.html(title, list, '',
				`<h2>${title}</h2>
				<form action="/create_process" method="post">
					<p><input type="text" id='title' name="title" placeholder="title" pattern="[A-Za-z0-9\s]+" title="The title can only contain English and numbers." required></p>
					<p><textarea name="description" placeholder="description"></textarea></p>
					<p><input type="submit"></p>
				</form>`,
			);

			response.writeHead(200);
			response.end(html);
		});
	},

	create_process: function (request, response) {
		let body = '';
		request.on('data', data => {
			body += data;
		});
		
		request.on('end', () => {
			const { title, description } = qs.parse(body);
			const filteredTitle = path.parse(title).base;

			fs.readdir('./data', (error, filelist) => {
				if (error) {
					throw error;
				}
	
				if (filelist.includes(filteredTitle)) {
					response.writeHead(200, { 'Content-Type': 'text/html' });
					response.end(`
						<script>
							alert("Title already exists. Choose a different title.");
							window.location.href = '/';
						</script>
					`);

					console.log('Title already exists. Choose a different title.');

				} else {
					fs.writeFile(`data/${filteredTitle}`, description, 'utf-8', (error2) => {
						if (error2) {
							throw error2;
						}
			
						response.writeHead(302, {Location: `/?id=${filteredTitle}`});
						response.end();
						console.log(`Created : ${filteredTitle}`);
					});
				}
			});
		});

	},

	update: function (request, response) {
		fs.readdir('./data', (error, filelist) => {
			if (error) {
				throw error;
			}

			const { query } = url.parse(request.url, true);
			const filteredId = path.parse(query.id).base;

			fs.readFile(`data/${filteredId}`, 'utf-8', (error2, description) => {
				if (error2) {
					throw error2;
				}
	
				const title = query.id;
				const list = template.list(filelist);
				const html = template.html(`Update ${title}`, list,
					`<h2>Update ${title}</h2>
					<form action="/update_process" method="post">
						<p><input type="hidden" name="old_title" value="${title}"></p>
						<p><input type="text" name="title" placeholder="title" pattern="[A-Za-z0-9\s]+" title="The title can only contain English and numbers." value="${title}" required></p>
						<p><textarea name="description" placeholder="description">${description}</textarea></p>
						<p><input type="submit"></p>
					</form>`,
				'');
				
				response.writeHead(200);
				response.end(html);
			});
		});
	},

	update_process: function (request, response) {
		let body = '';
		request.on('data', data => {
			body += data;
		});

		request.on('end', () => {
			const { old_title, title, description } = qs.parse(body);
			const filteredOld_title = path.parse(old_title).base;
			const filteredTitle = path.parse(title).base;
			
			fs.readdir('./data', (error, filelist) => {
				if (error) {
					throw error;
				}
	
				if (['CSS', 'HTML', 'JavaScript'].includes(filteredOld_title)) {
					response.writeHead(200, { 'Content-Type': 'text/html' });
					response.end(`
						<script>
							alert("This file cannot be updated.");
							window.location.href = '/?id=${filteredOld_title}';
						</script>
					`);

					console.log('This file cannot be updated.');

				} else if (filelist.includes(filteredTitle) && (filteredOld_title != filteredTitle)) {
					response.writeHead(200, { 'Content-Type': 'text/html' });
					response.end(`
						<script>
							alert("Title already exists. Choose a different title.");
							window.location.href = '/?id=${filteredOld_title}';
						</script>
					`);

					console.log('Title already exists. Choose a different title.');

				} else {
					fs.rename(`data/${filteredOld_title}`, `data/${filteredTitle}`, error2 => {
						if (error2) {
							throw error2;
						}
			
						
						fs.writeFile(`data/${filteredTitle}`, description, 'utf-8', (error3) => {
							if (error3) {
								throw error3;
							}
				
							response.writeHead(302, {Location: `/?id=${filteredTitle}`});
							response.end();
							console.log(`Updated : ${filteredOld_title} -> ${filteredTitle}`);
						});
					});
				}
			});
		});
	},

	delete_process: function (request, response) {
		let body = '';
		request.on('data', data => {
			body += data;
		});

		request.on('end', () => {
			const { title } = qs.parse(body);
			const filteredTitle = path.parse(title).base;

			if (['CSS', 'HTML', 'JavaScript'].includes(filteredTitle)) {
				response.writeHead(200, { 'Content-Type': 'text/html' });
				response.end(`
					<script>
						alert("This file cannot be deleted.");
						window.location.href = '/?id=${filteredTitle}';
					</script>
				`);

				console.log('This file cannot be deleted.');
				
			} else {
				fs.unlink(`data/${filteredTitle}`, error => {
					if (error) {
						throw error;
					}
		
					response.writeHead(302, {Location: `/`});
					response.end();
					console.log(`Deleted : ${filteredTitle}`);
				});
			}
		});
	}
}