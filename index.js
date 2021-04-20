const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const {  performance } = require('perf_hooks');
const $ = require('cheerio');
const listings = [];
const names = [];

const processListing = async (page, url) => {
    console.log('>   Navigating to link');
    const resps = await page.goto(url, {timeout: 0, waitUntil: 'domcontentloaded'});


    console.log('>   Scraping link');
    const bodys = await resps.text();
    const name = $('.seller-profile__name', bodys);
    const breadcrumbs = $('.breadcrumbs__separator', bodys);
    const category = breadcrumbs.last().prev();

    names.push({
        name: name.text(),
        category: category.text(),
        url: url
    });
}

const start = async (t0) => {
    console.log('>   Starting Gum-Scraper');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log('>   Navigating to gumtree with search restrictions');
    const resp = await page.goto('https://www.gumtree.com.au/s-furniture/waterloo-sydney/furniture/k0c20073l3003798r10?ad=offering', {waitUntil: 'domcontentloaded'});

    console.log('>   Scraping links');
    const body = await resp.text();
    const result = $('.user-ad-row-new-design', body);
    for(let i = 0; i < result.length; i++) {
        listings.push(`https://www.gumtree.com.au${result[i].attribs.href}`);
    }

    console.log('>   Scraping data from individual links');
    //await processListing(page, listings[0]);
    //await processListing(page, listings[1]);

    //10 sec slower then concurrent workers
    /*for(let i = 0; i < listings.length; i++) {
        await processListing(page, listings[i]);
    }*/
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 3,
    });

    await cluster.task(async ({ page, data: url }) => {
        await processListing(page, url);
    });

    for(let i = 0; i < listings.length; i++) {
        cluster.queue(listings[i]);
    }

    await cluster.idle();
    await cluster.close();
    //end time

    await browser.close();
    const t1 = performance.now();
    console.log("program took " + (t1 - t0) + " milliseconds.");

    console.table(names);
}
//start time
const t0 = performance.now();

start(t0);