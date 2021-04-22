const puppeteer = require("puppeteer");
const { Cluster } = require("puppeteer-cluster");
const { performance } = require("perf_hooks");
const $ = require("cheerio");
const readline = require("readline");
const csv = require("fast-csv");
const nodemailer = require('nodemailer');
const MapCategories = require('./mapCategories');

const posts = [];

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const processListing = async (page, url) => {
	console.log("🚀   Navigating to link");
	const resps = await page.goto(url, {
		timeout: 0,
		waitUntil: "domcontentloaded",
	});

	console.log("🚀   Scraping link");
	const bodys = await resps.text();
	const name = $(".seller-profile__name", bodys);
	const breadcrumbs = $(".breadcrumbs__separator", bodys);
	const price = $(".user-ad-price__price", bodys);
	const location = breadcrumbs.next();
	const category = breadcrumbs.last().prev();

	posts.push({
		name: name.text(),
		location: location.text(),
		category: category.text(),
		category_mapped: "",
		price: price.text(),
		url: url,
	});
};

const startSmall = async (cluster) => {
	const listings = [];
	const t0 = performance.now();
	const browser = await puppeteer.launch({ headless: true });

	const [page] = await browser.pages();

	//for logging in to gumtree
	//pass webdriver test to hide that were bot
	/*await page.evaluateOnNewDocument(() => {
          Object.defineProperty(navigator, 'webdriver',recursiveAsyncReadLine(); {
              get: () => false
          });
      });
  
      console.log('🚀   Navigating to gumtree login   🚀');
      const loginResp = await page.goto('https://www.gumtree.com.au/t-login-form.html', {waitUntil: 'domcontentloaded'});
      
      console.log('🚀   Entering email   🚀');
      await page.waitForSelector('#login-email');
      await page.type('#login-email', 'moleno6930@zevars.com');
  
      console.log('🚀   Entering password   🚀');
      await page.type('#login-password', 'moleno111!');
  
      console.log('🚀   Logging in   🚀');
  
      await Promise.all([
          page.click('#btn-submit-login'),
          page.waitForNavigation(),
      ]);
      console.log('🚀   Logged In to gumtree as Moleno   🚀');*/

	console.log("🚀   Navigating to gumtree with search restrictions   ");
	const searchResp = await page.goto("https://www.gumtree.com.au/s-furniture/waterloo-sydney/furniture/k0c20073l3003798r10?ad=offering", { waitUntil: "domcontentloaded" });

	console.log("🚀   Scraping links   ");
	const body = await searchResp.text();
	const result = $(".user-ad-row-new-design", body);
	for (let i = 0; i < result.length; i++) {
		listings.push(`https://www.gumtree.com.au${result[i].attribs.href}`);
	}
	console.log(`🚀   Scraped ${listings.length} links   `);

	console.log("🚀   Scraping data from individual links   ");

	if (cluster === true) {
		console.log("🚀   Starting with max concurrency 3   ");
		const cluster = await Cluster.launch({
			concurrency: Cluster.CONCURRENCY_CONTEXT,
			maxConcurrency: 3,
		});

		await cluster.task(async ({ page, data: url }) => {
			await processListing(page, url);
		});

		for (let i = 0; i < listings.length; i++) {
			cluster.queue(listings[i]);
		}

		await cluster.idle();
		await cluster.close();
	} else {
		for (let i = 0; i < listings.length; i++) {
			await processListing(page, listings[i]);
		}
	}

	//map categories
	console.log("🚀   Mapping category names");
	MapCategories.mapCategories(posts);

	await browser.close();
	const t1 = performance.now();
	console.log("small scrape took " + (t1 - t0) + " milliseconds.");
	console.log("Use view command to view scraped data");
};

const extractData = () => {
  if(posts.length === 0) {
    console.log("Empty. Scrape data first, '?' for more commands");
    recursiveAsyncReadLine();
  } else {
      recursiveAsyncReadEmail();
  }
}

const recursiveAsyncReadEmail = () => {
  rl.question("Which email do you want to send it to?\n", (input) => {

    if(input !== '') {
        const stream = csv.write(posts, { headers: true });
        const transporter = nodemailer.createTransport({
          service: 'hotmail',
          auth: {
            user: 'notabot419@outlook.com',
            pass: 'imabot1!'
          }
        });
        
        const mailOptions = {
          from: 'notabot419@outlook.com',
          to: input,
          subject: 'Sending data using Node.js',
          text: 'Going to the moon! 🚀',
          attachments: [
            {
              filename: 'raw.csv',
              content: stream
            }
          ]
        };
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log("==================================================================================");
            console.log("🚀              Error sending email, try different address                       🚀");
            console.log("==================================================================================");
            recursiveAsyncReadEmail();
          } else {
            console.log('Email sent to :' + input);
            console.log("==================================================================================");
            console.log("🚀                    Successfully extracted and sent raw.csv                    🚀");
            console.log("==================================================================================");
            recursiveAsyncReadLine();
          }
        });         
    } else {
      recursiveAsyncReadEmail();
    }
  });

}

const recursiveAsyncReadLine = () => {
	rl.question("🚀                            🚀  Enter Command  🚀                              🚀\n~~ ", (cmd) => {
		if (cmd === "exit")
			//base case for recursion
			return rl.close();
		//closing RL and returning from function.
		else if (cmd === "?") {
			console.log("🚀                         🚀 List  Of  Commands 🚀                              🚀");
			console.log("==================================================================================");
			console.log("🚀        start_small                starts a small instance (30 links)          🚀");
			console.log("🚀        start_small_cluster        starts a small instance w/ cluster          🚀");
			console.log("🚀        start_full                 starts a full scrape                        🚀");
			//console.log('🚀   login                           logs in to gumtree with given credentials   🚀');
			console.log("🚀        extract                    extracts data to csv and sends to email     🚀");
			console.log("🚀        view                       displays extracted data in table form       🚀");
			console.log("🚀        reset                      deletes current data                        🚀");
			console.log("🚀        ?                          lists all the commands                      🚀");
			console.log("🚀        exit                       shutsdown program                           🚀\n");
			recursiveAsyncReadLine();
		} else if (cmd === "start_small") {
			console.log("==================================================================================");
			console.log("🚀                      starting small instance ~ 30 links                       🚀");
			console.log("==================================================================================");

			startSmall(false).then(() => {
				recursiveAsyncReadLine();
			});
		} else if (cmd === "start_small_cluster") {
			console.log("==================================================================================");
			console.log("🚀                 starting small instance w/ cluster ~ 30 links                 🚀");
			console.log("==================================================================================");
			startSmall(true).then(() => {
				recursiveAsyncReadLine();
			});
		}  else if (cmd === "extract") {
			console.log("==================================================================================");
			console.log("🚀                            extract data and email                             🚀");
			console.log("==================================================================================");
			extractData();
		} else if (cmd === "view") {
			console.log("==================================================================================");
			console.log("🚀                            starting view command                              🚀");
			console.log("==================================================================================");
			console.table(posts);

			if (posts.length === 0) {
				console.log("🚀  Scrape data first to populate table");
			}

			recursiveAsyncReadLine();
		} else if (cmd === "reset") {
			if (posts.length === 0) {
				console.log("==================================================================================");
				console.log("🚀                        Nothing to delete, scrape data first                   🚀");
				console.log("==================================================================================");
			} else {
				console.log("==================================================================================");
				console.log("🚀                         deleted current instance of data                      🚀");
				console.log("==================================================================================");
				posts.length = 0;
			}
			recursiveAsyncReadLine();
		} else {
			console.log(`🚀                      🚀 Unknown command, '?' for help 🚀                      🚀`);
			recursiveAsyncReadLine();
		}
	});
};

module.exports = {
	displayIntro: () => {
		console.log("==================================================================================");
		console.log("🚀                    Starting Gum-Scraper for HookItNow                         🚀");
		console.log("🚀                            We going to the moon 🚀                            🚀");
		console.log("🚀                  Enter command or '?' for a list of commands                  🚀");
		console.log("==================================================================================");
	},

	//80 words in line
	//recursion in place of while loop
	startCommands: () => {
		recursiveAsyncReadLine();
	},
};
