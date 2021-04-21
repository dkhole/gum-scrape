"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var puppeteer = require("puppeteer");

var _require = require("puppeteer-cluster"),
    Cluster = _require.Cluster;

var _require2 = require("perf_hooks"),
    performance = _require2.performance;

var $ = require("cheerio");

var readline = require("readline");

var posts = [];
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var processListing = function processListing(page, url) {
  var resps, bodys, name, breadcrumbs, price, location, category;
  return regeneratorRuntime.async(function processListing$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("🚀   Navigating to link");
          _context.next = 3;
          return regeneratorRuntime.awrap(page["goto"](url, {
            timeout: 0,
            waitUntil: "domcontentloaded"
          }));

        case 3:
          resps = _context.sent;
          console.log("🚀   Scraping link");
          _context.next = 7;
          return regeneratorRuntime.awrap(resps.text());

        case 7:
          bodys = _context.sent;
          name = $(".seller-profile__name", bodys);
          breadcrumbs = $(".breadcrumbs__separator", bodys);
          price = $(".user-ad-price__price", bodys);
          location = breadcrumbs.next();
          category = breadcrumbs.last().prev();
          posts.push({
            name: name.text(),
            location: location.text(),
            category: category.text(),
            category_mapped: "",
            price: price.text(),
            url: url
          });

        case 14:
        case "end":
          return _context.stop();
      }
    }
  });
};

var mapCategories = function mapCategories() {
  posts.map(function (post) {
    switch (post.category) {
      case "Beds":
        post.category_mapped = "beds";
        break;

      case "Sofas":
        post.category_mapped = "sofas";
        break;

      case "Dining Tables":
        post.category_mapped = "dining tables";
        break;

      case "Other Furniture":
        post.category_mapped = "similar items";
        break;

      case "Coffee Tables":
        post.category_mapped = "coffee tables";
        break;

      case "Cabinets":
        post.category_mapped = "cabinets";
        break;

      case "Desks":
        post.category_mapped = "desks";
        break;

      case "Entertainment & TV Units":
        post.category_mapped = "TV Units";
        break;

      case "Dining Chairs":
        post.category_mapped = "dining chairs";
        break;

      case "Bookcases & Shelves":
        post.category_mapped = "bookcases & shelves";
        break;

      case "Armchairs":
        post.category_mapped = "armchairs";
        break;

      case "Dresses & Drawers":
        post.category_mapped = "dressers & drawers";
        break;

      case "Buffets & Side Tables":
        post.category_mapped = "buffets & side tables";
        break;

      case "Stools & Bar stools":
        post.category_mapped = "stools & bar stools";
        break;

      case "Mirrors":
        post.category_mapped = "mirrors";
        break;

      case "Bedside Tables":
        post.category_mapped = "bedside tables";
        break;

      case "Office Chairs":
        post.category_mapped = "office chairs";
        break;

      case "Wardrobes":
        post.category_mapped = "wardrobes";
        break;
    }
  });
};

var start_small = function start_small(cluster) {
  var listings, t0, browser, _ref, _ref2, page, searchResp, body, result, i, _cluster, _i2, _i3, t1;

  return regeneratorRuntime.async(function start_small$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          listings = [];
          t0 = performance.now();
          _context3.next = 4;
          return regeneratorRuntime.awrap(puppeteer.launch({
            headless: true
          }));

        case 4:
          browser = _context3.sent;
          _context3.next = 7;
          return regeneratorRuntime.awrap(browser.pages());

        case 7:
          _ref = _context3.sent;
          _ref2 = _slicedToArray(_ref, 1);
          page = _ref2[0];
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
          _context3.next = 13;
          return regeneratorRuntime.awrap(page["goto"]("https://www.gumtree.com.au/s-furniture/waterloo-sydney/furniture/k0c20073l3003798r10?ad=offering", {
            waitUntil: "domcontentloaded"
          }));

        case 13:
          searchResp = _context3.sent;
          console.log("🚀   Scraping links   ");
          _context3.next = 17;
          return regeneratorRuntime.awrap(searchResp.text());

        case 17:
          body = _context3.sent;
          result = $(".user-ad-row-new-design", body);

          for (i = 0; i < result.length; i++) {
            listings.push("https://www.gumtree.com.au".concat(result[i].attribs.href));
          }

          console.log("\uD83D\uDE80   Scraped ".concat(listings.length, " links   "));
          console.log("🚀   Scraping data from individual links   ");

          if (!(cluster === true)) {
            _context3.next = 36;
            break;
          }

          console.log("🚀   Starting with max concurrency 3   ");
          _context3.next = 26;
          return regeneratorRuntime.awrap(Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: 3
          }));

        case 26:
          _cluster = _context3.sent;
          _context3.next = 29;
          return regeneratorRuntime.awrap(_cluster.task(function _callee(_ref3) {
            var page, url;
            return regeneratorRuntime.async(function _callee$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    page = _ref3.page, url = _ref3.data;
                    _context2.next = 3;
                    return regeneratorRuntime.awrap(processListing(page, url));

                  case 3:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          }));

        case 29:
          for (_i2 = 0; _i2 < listings.length; _i2++) {
            _cluster.queue(listings[_i2]);
          }

          _context3.next = 32;
          return regeneratorRuntime.awrap(_cluster.idle());

        case 32:
          _context3.next = 34;
          return regeneratorRuntime.awrap(_cluster.close());

        case 34:
          _context3.next = 43;
          break;

        case 36:
          _i3 = 0;

        case 37:
          if (!(_i3 < listings.length)) {
            _context3.next = 43;
            break;
          }

          _context3.next = 40;
          return regeneratorRuntime.awrap(processListing(page, listings[_i3]));

        case 40:
          _i3++;
          _context3.next = 37;
          break;

        case 43:
          //map categories
          console.log("🚀   Mapping category names");
          mapCategories();
          _context3.next = 47;
          return regeneratorRuntime.awrap(browser.close());

        case 47:
          t1 = performance.now();
          console.log("small scrape took " + (t1 - t0) + " milliseconds.");
          console.log("Use view command to view scraped data");

        case 50:
        case "end":
          return _context3.stop();
      }
    }
  });
};

var recursiveAsyncReadLine = function recursiveAsyncReadLine() {
  rl.question("🚀                            🚀  Enter Command  🚀                              🚀\n~~ ", function (cmd) {
    if (cmd === "exit") //base case for recursion
      return rl.close(); //closing RL and returning from function.
    else if (cmd === "?") {
        console.log("🚀                         🚀 List  Of  Commands 🚀                              🚀");
        console.log("==================================================================================");
        console.log("🚀        start_small                starts a small instance (30 links)          🚀");
        console.log("🚀        start_small_cluster        starts a small instance w/ cluster          🚀");
        console.log("🚀        start_full                 starts a full scrape                        🚀"); //console.log('🚀   login                           logs in to gumtree with given credentials   🚀');

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
        start_small(false).then(function () {
          recursiveAsyncReadLine();
        });
      } else if (cmd === "start_small_cluster") {
        console.log("==================================================================================");
        console.log("🚀                starting small instance w/ cluster ~ 30 links                🚀");
        console.log("==================================================================================");
        start_small(true).then(function () {
          recursiveAsyncReadLine();
        });
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
        console.log("\uD83D\uDE80                      \uD83D\uDE80 Unknown command, '?' for help \uD83D\uDE80                      \uD83D\uDE80");
        recursiveAsyncReadLine();
      }
  });
};

module.exports = {
  displayIntro: function displayIntro() {
    console.log("==================================================================================");
    console.log("🚀                    Starting Gum-Scraper for HookItNow                         🚀");
    console.log("🚀                            We going to the moon 🚀                            🚀");
    console.log("🚀                  Enter command or '?' for a list of commands                  🚀");
    console.log("==================================================================================");
  },
  //80 words in line
  //recursion in place of while loop
  startCommands: function startCommands() {
    recursiveAsyncReadLine();
  }
};