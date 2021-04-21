const puppeteer = require('puppeteer');
const { Cluster } = require('puppeteer-cluster');
const { performance } = require('perf_hooks');
const $ = require('cheerio');
const readline = require('readline');

const posts = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const processListing = async (page, url) => {
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

const mapCategories = () => {
  posts.map((post) => {
    switch (post.category) {
      case 'Beds':
        post.category_mapped = 'beds';
        break;
      case 'Sofas':
        post.category_mapped = 'sofas';
        break;
      case 'Dining Tables':
        post.category_mapped = 'dining tables';
        break;
      case 'Other Furniture':
        post.category_mapped = 'similar items';
        break;
      case 'Coffee Tables':
        post.category_mapped = 'coffee tables';
        break;
      case 'Cabinets':
        post.category_mapped = 'cabinets';
        break;
      case 'Desks':
        post.category_mapped = 'desks';
        break;
      case 'Entertainment & TV Units':
        post.category_mapped = 'TV Units';
        break;
      case 'Dining Chairs':
        post.category_mapped = 'dining chairs';
        break;
      case 'Bookcases & Shelves':
        post.category_mapped = 'bookcases & shelves';
        break;
      case 'Armchairs':
        post.category_mapped = 'armchairs';
        break;
      case 'Dresses & Drawers':
        post.category_mapped = 'dressers & drawers';
        break;
      case 'Buffets & Side Tables':
        post.category_mapped = 'buffets & side tables';
        break;
      case 'Stools & Bar stools':
        post.category_mapped = 'stools & bar stools';
        break;
      case 'Mirrors':
        post.category_mapped = 'mirrors';
        break;
      case 'Bedside Tables':
        post.category_mapped = 'bedside tables';
        break;
      case 'Office Chairs':
        post.category_mapped = 'office chairs';
        break;
      case 'Wardrobes':
        post.category_mapped = 'wardrobes';
        break;
    }
  });
};

const start_small = async (cluster) => {
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

  console.log('🚀   Navigating to gumtree with search restrictions   ');
  const searchResp = await page.goto(
    'https://www.gumtree.com.au/s-furniture/waterloo-sydney/furniture/k0c20073l3003798r10?ad=offering',
    { waitUntil: 'domcontentloaded' }
  );

  console.log('🚀   Scraping links   ');
  const body = await searchResp.text();
  const result = $('.user-ad-row-new-design', body);
  for (let i = 0; i < result.length; i++) {
    listings.push(`https://www.gumtree.com.au${result[i].attribs.href}`);
  }
  console.log(`🚀   Scraped ${listings.length} links   `);

  console.log('🚀   Scraping data from individual links   ');

  if (cluster === true) {
    console.log('🚀   Starting with max concurrency 3   ');
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
  console.log('🚀   Mapping category names');
  mapCategories();

  await browser.close();
  const t1 = performance.now();
  console.log('small scrape took ' + (t1 - t0) + ' milliseconds.');
  console.log('Use view command to view scraped data');
};

const recursiveAsyncReadLine = () => {
  rl.question(
    '🚀                            🚀  Enter Command  🚀                              🚀\n~~ ',
    (cmd) => {
      if (cmd === 'exit')
        //base case for recursion
        return rl.close();
      //closing RL and returning from function.
      else if (cmd === '?') {
        console.log(
          '🚀                         🚀 List  Of  Commands 🚀                              🚀'
        );
        console.log(
          '=================================================================================='
        );
        console.log(
          '🚀        start_small                starts a small instance (30 links)          🚀'
        );
        console.log(
          '🚀        start_small_cluster        starts a small instance w/ cluster          🚀'
        );
        console.log(
          '🚀        start_full                 starts a full scrape                        🚀'
        );
        //console.log('🚀   login                           logs in to gumtree with given credentials   🚀');
        console.log(
          '🚀        extract                    extracts data to csv and sends to email     🚀'
        );
        console.log(
          '🚀        view                       displays extracted data in table form       🚀'
        );
        console.log(
          '🚀        reset                      deletes current data                        🚀'
        );
        console.log(
          '🚀        ?                          lists all the commands                      🚀'
        );
        console.log(
          '🚀        exit                       shutsdown program                           🚀\n'
        );
        recursiveAsyncReadLine();
      } else if (cmd === 'start_small') {
        console.log(
          '=================================================================================='
        );
        console.log(
          '🚀                      starting small instance ~ 30 links                       🚀'
        );
        console.log(
          '=================================================================================='
        );

        start_small(false).then(() => {
          recursiveAsyncReadLine();
        });
      } else if (cmd === 'start_small_cluster') {
        console.log(
          '=================================================================================='
        );
        console.log(
          '🚀                starting small instance w/ cluster ~ 30 links                🚀'
        );
        console.log(
          '=================================================================================='
        );
        start_small(true).then(() => {
          recursiveAsyncReadLine();
        });
      } else if (cmd === 'view') {
        console.log(
          '=================================================================================='
        );
        console.log(
          '🚀                            starting view command                              🚀'
        );
        console.log(
          '=================================================================================='
        );

        if (posts.length === 0) {
          console.log('🚀  Scrape data first to populate table');
        }
        console.table(posts);
        recursiveAsyncReadLine();
      } else if (cmd === 'reset') {
        if (posts.length === 0) {
          console.log(
            '=================================================================================='
          );
          console.log(
            '🚀                        Nothing to delete, scrape data first                   🚀'
          );
          console.log(
            '=================================================================================='
          );
        } else {
          console.log(
            '=================================================================================='
          );
          console.log(
            '🚀                         deleted current instance of data                      🚀'
          );
          console.log(
            '=================================================================================='
          );
          posts.length = 0;
        }
        recursiveAsyncReadLine();
      } else {
        console.log(
          `🚀                      🚀 Unknown command, '?' for help 🚀                      🚀`
        );
        recursiveAsyncReadLine();
      }
    }
  );
};

module.exports = {
  displayIntro: () => {
    console.log(
      '=================================================================================='
    );
    console.log(
      '🚀                    Starting Gum-Scraper for HookItNow                         🚀'
    );
    console.log(
      '🚀                            We going to the moon 🚀                            🚀'
    );
    console.log(
      "🚀                  Enter command or '?' for a list of commands                  🚀"
    );
    console.log(
      '=================================================================================='
    );
  },

  //80 words in line
  //recursion in place of while loop
  startCommands: () => {
    recursiveAsyncReadLine();
  },
};
