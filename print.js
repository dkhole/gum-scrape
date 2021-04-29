module.exports = {
	displayIntro: () => {
		console.log('==================================================================================');
		console.log('🚀                    Starting Gum-Scraper for HookItNow                         🚀');
		console.log('🚀                            We going to the moon 🚀                            🚀');
		console.log("🚀                  Enter command or '?' for a list of commands                  🚀");
		console.log('==================================================================================');
	},

	help: () => {
		console.log('🚀                             🚀 List  Of  Commands 🚀                           🚀');
		console.log('==================================================================================');
		console.log('🚀        start_small                starts a small instance (30 links)           🚀');
		console.log('🚀        start_today                starts a scrape of all listings posted today 🚀');
		console.log('🚀        start_full                 starts a full scrape                         🚀');
		console.log('🚀        start_*_cluster            starts * (small, today or full) w/ cluster   🚀');
		//console.log('🚀   login                           logs in to gumtree with given credentials   🚀');
		console.log('🚀        extract                    extracts data to csv and sends to email      🚀');
		console.log('🚀        view                       displays extracted data in table form        🚀');
		console.log('🚀        reset                      deletes current data                         🚀');
		console.log('🚀        ?                          lists all the commands                       🚀');
		console.log('🚀        exit                       shutsdown program                            🚀\n');
	},

	startingSmall: () => {
		console.log('==================================================================================');
		console.log('🚀                      starting small instance ~ 30 links                       🚀');
		console.log('==================================================================================');
	},

	startingSmallCluster: () => {
		console.log('==================================================================================');
		console.log('🚀                 starting small instance w/ cluster ~ 30 links                 🚀');
		console.log('==================================================================================');
	},

	startingFull: () => {
		console.log('==================================================================================');
		console.log('🚀                            starting full instance                             🚀');
		console.log('==================================================================================');
	},

	startingFullCluster: () => {
		console.log('==================================================================================');
		console.log('🚀                         starting full instance w/ cluster                     🚀');
		console.log('==================================================================================');
	},

	startingToday: () => {
		console.log('==================================================================================');
		console.log('🚀                            starting today instance                            🚀');
		console.log('==================================================================================');
	},

	startingTodayCluster: () => {
		console.log('==================================================================================');
		console.log('🚀                       starting today instance w/ cluster                      🚀');
		console.log('==================================================================================');
	},

	startingExtract: () => {
		console.log('==================================================================================');
		console.log('🚀                            extract data and email                             🚀');
		console.log('==================================================================================');
	},

	startingView: () => {
		console.log('==================================================================================');
		console.log('🚀                            starting view command                              🚀');
		console.log('==================================================================================');
	},

	noToDelete: () => {
		console.log('==================================================================================');
		console.log('🚀                        Nothing to delete, scrape data first                   🚀');
		console.log('==================================================================================');
	},

	deleted: () => {
		console.log('==================================================================================');
		console.log('🚀                         deleted current instance of data                      🚀');
		console.log('==================================================================================');
	},

	errorEmail: () => {
		console.log('==================================================================================');
		console.log('🚀              Error sending email, try different address                       🚀');
		console.log('==================================================================================');
	},

	successExtract: () => {
		console.log('==================================================================================');
		console.log('🚀                    Successfully extracted and sent raw.csv                    🚀');
		console.log('==================================================================================');
	},
};
