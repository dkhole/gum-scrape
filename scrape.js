const fetch = require('node-fetch');
const { performance } = require('perf_hooks');
const $ = require('cheerio');
const MapCategories = require('./mapCategories');

const processListing = async (searchResp, posts) => {
	console.log('🚀   Scraping link');
	const bodys = await searchResp.text();
	const name = $('.seller-profile__name', bodys);
	const breadcrumbs = $('.breadcrumbs__separator', bodys);
	const price = $('.user-ad-price__price', bodys);
	const profile = $('.seller-profile', bodys);
	const profileUrl = `https://www.gumtree.com.au${profile[0].attribs.href}`;

	if (profileUrl === undefined) {
		console.log(profile);
		console.log(searchResp.url);
	}
	const number = $('.reveal-phone-number', bodys);
	let hasNumber;

	number.length > 0 ? (hasNumber = true) : (hasNumber = false);

	const location = breadcrumbs.next();
	const category = breadcrumbs.last().prev();

	posts.push({
		name: name.text(),
		location: location.text(),
		category: category.text(),
		category_mapped: '',
		price: price.text(),
		url: searchResp.url,
		profile_url: profileUrl,
		has_number: hasNumber,
	});
};

const scrapeLinks = async (listings, url, getPages) => {
	console.log('🚀   Navigating to gumtree with search restrictions   ');
	const searchResp = await fetch(url);
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
		console.log(`🚀   A total of ${numPages} pages to scrape`);
		return numPages;
	}
};

const scrapeLinksToday = async (listings, url) => {
	console.log('🚀   Navigating to gumtree with search restrictions   ');
	const searchResp = await fetch(url);
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

const startScrape = async (mode, posts) => {
	const listings = [];
	const t0 = performance.now();

	if (mode === 'small') {
		await scrapeLinks(listings, 'https://www.gumtree.com.au/s-furniture/waterloo-sydney/c20073l3003798r10?ad=offering', false);
	}

	if (mode === 'today') {
		//get first page
		await scrapeLinks(listings, 'https://www.gumtree.com.au/s-furniture/waterloo-sydney/c20073l3003798r10?ad=offering', false);

		let isToday = true;
		let i = 2;

		while (isToday) {
			isToday = await scrapeLinksToday(listings, `https://www.gumtree.com.au/s-furniture/waterloo-sydney/page-${i}/c20073l3003798r10?ad=offering`);
			i++;
		}

		console.log(`🚀   Scraped ${listings.length} links   `);
		console.log('🚀   Scraping data from individual links   ');
	}

	if (mode === 'full') {
		//get first page
		await scrapeLinks(listings, 'https://www.gumtree.com.au/s-furniture/waterloo-sydney/c20073l3003798r10?ad=offering', false);
		//get second page and number of pages
		const numPages = await scrapeLinks(listings, 'https://www.gumtree.com.au/s-furniture/waterloo-sydney/page-2/c20073l3003798r10?ad=offering', true);
		//loop through from third page until end of pages
		for (let i = 3; i < numPages + 1; i++) {
			await scrapeLinks(listings, `https://www.gumtree.com.au/s-furniture/waterloo-sydney/page-${i}/c20073l3003798r10?ad=offering`, false);
		}
	}

	let promises = [];
	for (let i = 0; i < listings.length; i++) {
		promises.push(fetch(listings[i]));
	}

	const results = await Promise.all(promises);

	//reuse array
	promises = [];

	for (let i = 0; i < results.length; i++) {
		promises.push(processListing(results[i], posts));
	}

	await Promise.all(promises);

	//map categories
	console.log('🚀   Mapping category names');
	MapCategories.mapCategories(posts);

	const t1 = performance.now();
	console.log('scrape took ' + (t1 - t0) + ' milliseconds.');
	console.log('Use view command to view scraped data');
};

module.exports = {
	startScrape: async (mode, posts) => {
		await startScrape(mode, posts);
	},
};
