const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const { performance } = require('perf_hooks');
const $ = require('cheerio');
const MapCategories = require('./mapCategories');

const processListing = async (page, url, posts) => {
	console.log('🚀   Navigating to link');
	const resps = await page.goto(url, {
		timeout: 0,
		waitUntil: 'domcontentloaded',
	});

	console.log('🚀   Scraping link');
	const bodys = await resps.text();
	const name = $('.seller-profile__name', bodys);
	const breadcrumbs = $('.breadcrumbs__separator', bodys);
	const price = $('.user-ad-price__price', bodys);
	const location = breadcrumbs.next();
	const category = breadcrumbs.last().prev();

	posts.push({
		name: name.text(),
		location: location.text(),
		category: category.text(),
		category_mapped: '',
		price: price.text(),
		url: url,
	});
};

const scrapeLinks = async (listings, page, url, getPages) => {
	console.log('🚀   Navigating to gumtree with search restrictions   ');
	const searchResp = await page.goto(url, { waitUntil: 'domcontentloaded' });
	const body = await searchResp.text();

	console.log('🚀   Scraping links   ');

	const result = $('.user-ad-row-new-design', body);

	for (let i = 0; i < result.length; i++) {
		listings.push(`https://www.gumtree.com.au${result[i].attribs.href}`);
	}
	console.log(`🚀   Scraped ${listings.length} links   `);

	console.log('🚀   Scraping data from individual links   ');

	if (getPages) {
		const summary = $('.breadcrumbs__summary--enhanced', body).text();
		const numPages = parseInt(summary.substring(summary.length - 3, summary.length - 1));
		console.log(`🚀   A total of ${numPages} number of pages to scrape`);
		return numPages;
	}
};

const scrapeLinksToday = async (listings, page, url) => {
	console.log('🚀   Navigating to gumtree with search restrictions   ');
	const searchResp = await page.goto(url, { waitUntil: 'domcontentloaded' });
	const body = await searchResp.text();

	console.log('🚀   Scraping links   ');

	const result = $('.user-ad-row-new-design', body);
	const times = $('.user-ad-row-new-design__age', body);

	for (let i = 0; i < result.length; i++) {
		listings.push(`https://www.gumtree.com.au${result[i].attribs.href}`);
		if (!result[i].attribs['aria-describedby'].includes('TOP')) {
			if (!times[i].children[0].data.includes('ago')) {
				console.log(`🚀   Scraped ${listings.length} links   `);
				console.log('🚀   Scraping data from individual links   ');
				return false;
			}
		}
	}
	console.log(`🚀   Scraped ${listings.length} links   `);
	console.log('🚀   Scraping data from individual links   ');
	return true;
};

const startScrape = async (cluster, mode, posts) => {
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

	if (mode === 'small') {
		await scrapeLinks(listings, page, 'https://www.gumtree.com.au/s-furniture/waterloo-sydney/c20073l3003798r10?ad=offering');
	}

	if (mode === 'today') {
		//get first page
		await scrapeLinks(listings, page, 'https://www.gumtree.com.au/s-furniture/waterloo-sydney/c20073l3003798r10?ad=offering', false);

		let isToday = true;
		let i = 2;

		while (isToday) {
			isToday = await scrapeLinksToday(
				listings,
				page,
				`https://www.gumtree.com.au/s-furniture/waterloo-sydney/page-${i}/c20073l3003798r10?ad=offering`
			);
			i++;
		}

		console.log(`🚀   Scraped ${listings.length} links   `);

		console.log('🚀   Scraping data from individual links   ');
	}

	if (mode === 'full') {
		//get first page
		await scrapeLinks(listings, page, 'https://www.gumtree.com.au/s-furniture/waterloo-sydney/c20073l3003798r10?ad=offering', false);
		//get second page and number of pages
		const numPages = await scrapeLinks(
			listings,
			page,
			'https://www.gumtree.com.au/s-furniture/waterloo-sydney/page-2/c20073l3003798r10?ad=offering',
			true
		);
		//loop through from third page until end of pages
		for (let i = 3; i < numPages + 1; i++) {
			await scrapeLinks(listings, page, `https://www.gumtree.com.au/s-furniture/waterloo-sydney/page-${i}/c20073l3003798r10?ad=offering`, false);
		}

		console.log(listings);
	}

	if (cluster === true) {
		console.log('🚀   Starting with max concurrency 3   ');
		const cluster = await Cluster.launch({
			concurrency: Cluster.CONCURRENCY_CONTEXT,
			maxConcurrency: 3,
		});

		await cluster.task(async ({ page, data: url }) => {
			await processListing(page, url, posts);
		});

		for (let i = 0; i < listings.length; i++) {
			cluster.queue(listings[i]);
		}

		await cluster.idle();
		await cluster.close();
	} else {
		for (let i = 0; i < listings.length; i++) {
			await processListing(page, listings[i], posts);
		}
	}

	//map categories
	console.log('🚀   Mapping category names');
	MapCategories.mapCategories(posts);

	await browser.close();
	const t1 = performance.now();
	console.log('small scrape took ' + (t1 - t0) + ' milliseconds.');
	console.log('Use view command to view scraped data');
};

module.exports = {
    startScrape: async (cluster, mode, posts) => {
        await startScrape(cluster, mode, posts);
    }
}