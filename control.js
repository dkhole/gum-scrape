const readline = require('readline');
const csv = require('fast-csv');
const nodemailer = require('nodemailer');
const scrape = require('./scrape');
const print = require('./print');

const posts = [];

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const extractData = () => {
	if (posts.length === 0) {
		console.log("Empty. Scrape data first, '?' for more commands");
		recursiveAsyncReadLine();
	} else {
		recursiveAsyncReadEmail();
	}
};

const recursiveAsyncReadEmail = () => {
	rl.question('Which email do you want to send it to?\n', (input) => {
		if (input !== '') {
			const stream = csv.write(posts, { headers: true });
			const transporter = nodemailer.createTransport({
				service: 'hotmail',
				auth: {
					user: 'notabot419@outlook.com',
					pass: 'imabot1!',
				},
			});

			const mailOptions = {
				from: 'notabot419@outlook.com',
				to: input,
				subject: 'Data scraped using gum scraper',
				attachments: [
					{
						filename: 'raw.csv',
						content: stream,
					},
				],
			};

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					print.errorEmail();
					recursiveAsyncReadEmail();
				} else {
					console.log('Email sent to : ' + input);
					print.successExtract();
					recursiveAsyncReadLine();
				}
			});
		} else {
			recursiveAsyncReadEmail();
		}
	});
};

const recursiveAsyncReadLine = () => {
	rl.question('🚀                            🚀  Enter Command  🚀                              🚀\n~~ ', (cmd) => {
		if (cmd === 'exit')
			//base case for recursion
			return rl.close();

		else if (cmd === '?') {
			print.help();
			recursiveAsyncReadLine();
		} else if (cmd === 'start_small') {
			print.startingSmall();
			scrape.startScrape('small', posts).then(() => {
				recursiveAsyncReadLine();
			});
		} else if (cmd === 'start_full') {
			print.startingFull();
			scrape.startScrape('full', posts).then(() => {
				recursiveAsyncReadLine();
			});
		} else if (cmd === 'start_today') {
			print.startingToday();
			scrape.startScrape('today', posts).then(() => {
				recursiveAsyncReadLine();
			});
		} else if (cmd === 'extract') {
			print.startingExtract();
			extractData();
		} else if (cmd === 'view') {
			print.startingView();
			console.table(posts);
			if (posts.length === 0) {
				console.log('🚀  Scrape data first to populate table');
			}
			recursiveAsyncReadLine();
		} else if (cmd === 'reset') {
			if (posts.length === 0) {
				print.noToDelete();
			} else {
				print.deleted();
				posts.length = 0;
			}
			recursiveAsyncReadLine();
		}  else {
			console.log(`🚀                      🚀 Unknown command, '?' for help 🚀                      🚀`);
			recursiveAsyncReadLine();
		}
	});
};

module.exports = {
	//recursion in place of while loop
	startCommands: () => {
		recursiveAsyncReadLine();
	},
};
