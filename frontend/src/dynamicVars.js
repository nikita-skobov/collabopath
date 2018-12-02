const DEV = false
const DEV_START_STAGE = 5
const Filter = require('bad-words')

exports.filter = new Filter({ emptyList: true })

module.exports.DEV = DEV
module.exports.WebsiteName = 'CollaboPath'
module.exports.startingStage = DEV ? DEV_START_STAGE : 0

module.exports.randomBetween = (a, b) => {
  return Math.floor(Math.random() * (b - a + 1) + a)
}

module.exports.StatAllocate = {
  totalPoints: 150,
}

module.exports.maxSuggestionLength = 1000

module.exports.HowItWorks = [
  'How it works',
  'At every path you have two choices, left or right. At first these choices are included as part of the game, but as you go further down the path tree, you will see choices that other users have created. Eventually you will reach a path that does not have any more choices and you can upload your own.',
  'When you upload your own you can refresh your current path page via this icon which will appear at the top of the page',
  { type: 'sync' },
  'After you upload your path object, it will be in a non-finalized state. During this time, anybody can view your path object, and if they like it they can vote on it. They can also upload their own path object for everyone to see. After about 15-20 minutes the path object with the most amount of votes wins, and becomes finalized.',
  'While a path object is not finalized, you will see a dropdown menu like this at the top of the page',
  { type: 'dropdown' },
  'Where every option in the dropdown represents a different path object that somebody submitted. You can click through the different options to see the different path objects, and vote for the one you like. When you click on one of the dropdown options it also refreshes the path object list in case other people have uploaded objects recently.',
]

module.exports.Concepts = {
  gameover: {
    title: 'You Died!',
    body: [
      'Since this game is still in beta, there is no consequence for dieing',
    ],
  },
  effect: {
    title: 'You found your first effect!',
    body: [
      'Some path choices have effects that users can specify. These effects can change your stats, give you items and gold, or let you trade with a merchant',
      'Some effects are conditional meaning they have a PASS and a FAIL condition. For example, do you have food? If you do nothing happens, but if you dont then you lose some health.',
      'There are many different types of effect combinations. Eventually youll reach the end of a path and you can create your own path objects and make your own effects!',
    ],
  },
  merchant: {
    title: `You${"'"}ve found a merchant!`,
    body: [
      'When a merchant effect happens you can buy items from the merchant, as well as sell items from your inventory',
      'Note that you can also kill the merchant and steal the items, but then other merchants wont want to trade with you...',
    ],
  },
  applyStep: {
    title: `You${"'"}ve made your first step!`,
    body: [
      'Every choice you make counts as a "step". Every step your stamina goes down by 1. If your stamina reaches 0, your health will start to go down by 1 too!',
      'If your sanity is at 0, then your intelligence will go down by 1 as well. And if your intelligence is at 0, your health will go down even more, so be careful.',
      'You can drink water to increase your stamina, eat food to give you a health boost, and read books to increase your intelligence.',
    ],
  },
  userObjectBasic: {
    title: `You${"'"}ve reached a user submitted path!`,
    body: [
      'You have reached the end of the main paths. The choices below were created by a user like you. Every path after this one is also created by users.',
      'Eventually you will reach the end of the path, and then you can submit your own to continue the story!',
    ],
  },
  userObjectNF: {
    title: `You${"'"}ve reached a non-finalized path!`,
    body: [
      {
        text: 'When you reach a path object with a dropdown menu, then the object is not finalized yet. That means that you, and other users can submit their own path objects.',
        image: 'guide_dropdown.jpg',
      },
      {
        text: 'You can click on the dropdown menu to see path objects from different users.',
        image: 'guide_see_others.jpg',
      },
      {
        text: 'Every time you click on one of the items, it refreshes the list to see if there are any new additions',
        image: 'guide_dropdown_refresh.gif',
      },
      {
        text: 'If you like somebodys path object, you can vote on it. After 15-20 minutes the path object with the most votes becomes finalized',
        image: 'guide_vote.gif',
      },
      {
        top: true,
        text: 'When that happens, the next time you refresh, the dropdown goes away and youll see the winning path object.',
        image: 'guide_dropdown_goes_away.gif',
      },
    ],
  },
  userObjectNoExist: {
    title: `You${"'"}ve reached the end of this path!`,
    body: [
      {
        text: 'When you reach a path object that doesnt have any more choices, then you will see this icon at the top. You can click it to refresh this path page, and see if any new path objects have been submitted.',
        image: 'guide_refresh.gif',
      },
      {
        text: 'Or, you can submit your own!',
        image: 'guide_your_own.gif',
      },
    ],
  },
  transitionDuration: 400,
}

module.exports.LandingPage = {
  title: `Welcome to ${exports.WebsiteName}`,
  body: `${exports.WebsiteName} is a user-created choose your own adventure game. It is a game where anybody can add paths, and choices which makes the game potentially infinite. It starts with a single path, and from there users can upload their own paths, vote on other path submissions, and eventually the one with the most votes wins, and becomes part of the official path tree. Come on in, and explore the paths!`,
}

module.exports.minimumRefreshDelay = 10000 // 10 seconds
module.exports.MakePath = {
  maxQuestionLength: 38,
  maxTextLength: 1000,
  effects: [
    { name: 'NONE', text: 'No effect' },
    { name: 'GOLD', text: 'User finds gold' },
    { name: 'HEALTH_U', text: 'Health goes up' },
    { name: 'HEALTH_D', text: 'Health goes down' },
    { name: 'INTELLIGENCE_U', text: 'Intelligence goes up' },
    { name: 'INTELLIGENCE_D', text: 'Intelligence goes down' },
    { name: 'SANITY_U', text: 'Sanity goes up' },
    { name: 'SANITY_D', text: 'Sanity goes down' },
    { name: 'STAMINA_U', text: 'Stamina goes up' },
    { name: 'STAMINA_D', text: 'Stamina goes down' },
    { name: 'MERCHANT', text: 'User gets to trade with a merchant' },
    { name: 'FOUND_ITEM', text: 'User finds a random item' },
  ],
  getTextFromName: (name) => {
    let text = ''
    exports.MakePath.effects.forEach((item) => {
      text = (item.name === name) ? item.text : text
      return null
    })
    return text
  },
  stats: [
    { name: 'HEALTH', text: 'Health' },
    { name: 'STAMINA', text: 'Stamina' },
    { name: 'INTELLIGENCE', text: 'Intelligence' },
    { name: 'SANITY', text: 'Sanity' },
  ],
}

module.exports.Changelog = [
  {
    version: '1.0.0',
    notdone: 1,
    changes: [
      'Add a way for users to explore paths without having to start from the beginning',
      'This list is still in progress... If you have any more suggestions for 1.0.0 features, please let me know via the suggestion form, by email, or by twitter.',
    ],
  },
  {
    version: '0.9.2',
    changes: [
      'This is a hotfix update',
      'Fixed bug where you couldn\'t select the last image in a list if you were using Firefox',
      'Added a button to the "What is your name?" form, so mobile users have a way of proceding',
      'Fixed the issue where the path creation modal was not preserving user input when going back',
      'Added discord, and github links to the front page',
      'Added a back button when viewing non-finalized objects (the back button has the same functionality as clicking on the dropdown menu, but having a button that says "Back" is more intuitive',
    ],
  },
  {
    version: '0.9.1',
    changes: [
      'Added concept modals to explain new parts of the site in small steps',
      'Fixed bug where you couldn\'t sell items to the merchant',
      'Fixed bug with the modal having it\'s own scrollbar which made scrolling very difficult on mobile.',
      'Added steps to the concept modals, so the user knows how many parts there are to it (these appear as numbers at the top of the concept modal).',
      'Made font size more appropriate for both mobile, and desktop viewing',
      'Allows user to allocate their own stats (previously stats were randomly generated).',
      'Fixed scroll bar issue where it would cut into the page.',
      'Added categories to image selection when creating a path object. (previously it was just one long list).',
      'Fixed word wrap issues on modals',
      'Added option to not show concept modals via a checkbox',
      'Added a popup modal upon death (It doesn\'t do anything at the moment though).',
      'Added more item usage messages, and effects (previously they all had a default generic message).',
      'Added a suggestion form',
      'Added links to website, and twitter on about page.',
      'Added a (very) basic support page',
      'Added a shitty profanity filter (pun intended... is that a pun actually? I\'m not sure).',
      'Added a changelog page',
    ],
  },
  {
    version: '0.9.0',
    changes: [
      'First stable version',
      'Added voting timer on path objects so that users have about 15 minutes to vote on paths before they get finalized',
      'Added basic path object submission form',
    ],
  },
]

module.exports.Support = {
  patreon: 'https://www.patreon.com/equilateral/overview',
  body: `To me, free means that not only do users not have to pay to use the site, \
  but they also shouldn${"'"}t have to deal with intrusive ads, data harvesting, or \
  be forced to make an account just to use the site. \n\n\
  So, instead, I decided to open a patreon page for people who enjoy this game, and want \
  to support further development of ${exports.WebsiteName}. \n\n\
  In addition to helping me afford to run this website, you also get the following benefits: \n\n\
  Basic ($1 a month): \n\
  You get to submit images (I approve all images manually to make sure they are reasonably appropriate). \
  to the site for users to put in their path objects. By default I have included some images I have made myself, \
  but I think it would be fun for users to add their own images, which would make the site more interesting because it won${"'"}t \
  be the same images over and over. The reason this is a Patreon benefit, and not just part of the site \
  is that images are big files, and it can get expensive pretty quickly if I allow anyone to upload images. \n\n\
  Premium ($5 a month): \n\
  In addition to being able to submit images, you will also get to submit new items to be added to the game (Once again, \
  I approve all additions manually to make sure they are appropriate). The items you submit would then become \
  part of the game, and anyone can find them, or buy them from the merchant. Also, as part of the premium perks, \
  I${"'"}ll add you on snapchat, and send you annoying snaps throughout the day.`,
}

module.exports.About = {
  title: `About ${exports.WebsiteName}`,
  imgUrl: 'RESIZE_tree.png',
  text: `${exports.WebsiteName} is a user-created choose your own adventure game. The \
game starts with an initial path with two choices. Each choice has a different effect, \
and outcome, as well as another set of choices from there. If you reach a path that doesn't \
have any more choices that means nobody has made that path yet, and you have the option \
of creating your own! When you create a path it starts a timer for voting. Anybody can vote \
on the path that you created, or they can submit their own. After the timer runs out the \
server picks the path with the most votes and that one becomes the 'official' path at that \
specific location.\n\n\
This website is still in beta, so if you have any suggestions, or ideas, please let me know either \
through twitter, email, or the suggestion form on the front page. \n\n\
This website was created by Equilateral LLC \n\n\
Email: equilateralllc@gmail.com`,
  socialLinks: [
    {
      type: 'twitter',
      link: 'https://twitter.com/equLLC',
    },
    {
      type: 'website',
      link: 'https://equllc.com',
    },
  ],
}

module.exports.badWords = ['5h1t', '5hit', 'a55', 'anal', 'anus', 'ar5e', 'arrse', 'arse', 'ass', 'ass-fucker', 'asses', 'assfucker', 'assfukka', 'asshole', 'assholes', 'asswhole', 'a_s_s', 'b!tch', 'b00bs', 'b17ch', 'b1tch', 'balls', 'ballsack', 'bastard', 'beastial', 'beastiality', 'bellend', 'bestial', 'bestiality', 'bi+ch', 'biatch', 'bitch', 'bitcher', 'bitchers', 'bitches', 'bitchin', 'bitching', 'bloody', 'blow job', 'blowjob', 'blowjobs', 'boiolas', 'bollock', 'bollok', 'boner', 'boob', 'boobs', 'booobs', 'boooobs', 'booooobs', 'booooooobs', 'breasts', 'buceta', 'bugger', 'bum', 'bunny fucker', 'butt', 'butthole', 'buttmuch', 'buttplug', 'c0ck', 'c0cksucker', 'carpet muncher', 'cawk', 'chink', 'cipa', 'cl1t', 'clit', 'clitoris', 'clits', 'cnut', 'cock', 'cock-sucker', 'cockface', 'cockhead', 'cockmunch', 'cockmuncher', 'cocks', 'cocksuck', 'cocksucked', 'cocksucker', 'cocksucking', 'cocksucks', 'cocksuka', 'cocksukka', 'cok', 'cokmuncher', 'coksucka', 'coon', 'cox', 'cum', 'cummer', 'cumming', 'cums', 'cumshot', 'cunilingus', 'cunillingus', 'cunnilingus', 'cunt', 'cuntlick', 'cuntlicker', 'cuntlicking', 'cunts', 'cyberfuc', 'cyberfuck', 'cyberfucked', 'cyberfucker', 'cyberfuckers', 'cyberfucking', 'd1ck', 'dick', 'dickhead', 'dildo', 'dildos', 'dirsa', 'dlck', 'dog-fucker', 'doggin', 'dogging', 'donkeyribber', 'doosh', 'duche', 'dyke', 'ejaculate', 'ejaculated', 'ejaculates', 'ejaculating', 'ejaculatings', 'ejaculation', 'ejakulate', 'f u c k', 'f u c k e r', 'fag', 'fagging', 'faggitt', 'faggot', 'faggs', 'fagot', 'fagots', 'fags', 'fanny', 'fannyflaps', 'fannyfucker', 'fanyy', 'fatass', 'fcuk', 'fcuker', 'fcuking', 'felching', 'fellate', 'fellatio', 'fingerfuck', 'fingerfucked', 'fingerfucker', 'fingerfuckers', 'fingerfucking', 'fingerfucks', 'fistfuck', 'fistfucked', 'fistfucker', 'fistfuckers', 'fistfucking', 'fistfuckings', 'fistfucks', 'flange', 'fook', 'fooker', 'fuck', 'fucka', 'fucked', 'fucker', 'fuckers', 'fuckhead', 'fuckheads', 'fuckin', 'fucking', 'fuckings', 'fuckingshitmotherfucker', 'fuckme', 'fucks', 'fuckwhit', 'fuckwit', 'fudge packer', 'fudgepacker', 'fuk', 'fuker', 'fukker', 'fukkin', 'fuks', 'fukwhit', 'fukwit', 'fux', 'fux0r', 'f_u_c_k', 'gangbang', 'gangbanged', 'gangbangs', 'gaylord', 'gaysex', 'goatse', 'hardcoresex', 'heshe', 'hoar', 'hoare', 'hoer', 'homo', 'hore', 'horniest', 'horny', 'hotsex', 'jack-off', 'jackoff', 'jap', 'jerk-off', 'jism', 'jiz', 'jizm', 'jizz', 'kawk', 'knob', 'knobead', 'knobed', 'knobend', 'knobhead', 'knobjocky', 'knobjokey', 'kock', 'kondum', 'kondums', 'kum', 'kummer', 'kumming', 'kums', 'kunilingus', 'l3i+ch', 'l3itch', 'labia', 'lust', 'lusting', 'm0f0', 'm0fo', 'm45terbate', 'ma5terb8', 'ma5terbate', 'masochist', 'master-bate', 'masterb8', 'masterbat*', 'masterbat3', 'masterbate', 'masterbation', 'masterbations', 'masturbate', 'mo-fo', 'mof0', 'mofo', 'mothafuck', 'mothafucka', 'mothafuckas', 'mothafuckaz', 'mothafucked', 'mothafucker', 'mothafuckers', 'mothafuckin', 'mothafucking', 'mothafuckings', 'mothafucks', 'mother fucker', 'motherfuck', 'motherfucked', 'motherfucker', 'motherfuckers', 'motherfuckin', 'motherfucking', 'motherfuckings', 'motherfuckka', 'motherfucks', 'muff', 'mutha', 'muthafecker', 'muthafuckker', 'muther', 'mutherfucker', 'n1gga', 'n1gger', 'nazi', 'nigg3r', 'nigg4h', 'nigga', 'niggah', 'niggas', 'niggaz', 'nigger', 'niggers', 'nob', 'nob jokey', 'nobhead', 'nobjocky', 'nobjokey', 'numbnuts', 'nutsack', 'orgasim', 'orgasims', 'orgasm', 'orgasms', 'p0rn', 'pawn', 'pecker', 'penis', 'penisfucker', 'phonesex', 'phuck', 'phuk', 'phuked', 'phuking', 'phukked', 'phukking', 'phuks', 'phuq', 'pigfucker', 'pimpis', 'piss', 'pissed', 'pisser', 'pissers', 'pisses', 'pissflaps', 'pissin', 'pissing', 'pissoff', 'porn', 'porno', 'pornography', 'pornos', 'prick', 'pricks', 'pron', 'pube', 'pusse', 'pussi', 'pussies', 'pussy', 'pussys', 'rectum', 'retard', 'rimjaw', 'rimming', 's hit', 's.o.b.', 'sadist', 'schlong', 'screwing', 'scroat', 'scrote', 'scrotum', 'semen', 'sex', 'sh!+', 'sh!t', 'sh1t', 'shag', 'shagger', 'shaggin', 'shagging', 'shemale', 'shi+', 'shit', 'shitdick', 'shite', 'shited', 'shitey', 'shitfuck', 'shitfull', 'shithead', 'shiting', 'shitings', 'shits', 'shitted', 'shitter', 'shitters', 'shitting', 'shittings', 'shitty', 'skank', 'slut', 'sluts', 'smegma', 'smut', 'snatch', 'son-of-a-bitch', 'spac', 'spunk', 's_h_i_t', 't1tt1e5', 't1tties', 'teets', 'teez', 'testical', 'testicle', 'tit', 'titfuck', 'tits', 'titt', 'tittie5', 'tittiefucker', 'titties', 'tittyfuck', 'tittywank', 'titwank', 'tosser', 'turd', 'tw4t', 'twat', 'twathead', 'twatty', 'twunt', 'twunter', 'v14gra', 'v1gra', 'vagina', 'viagra', 'vulva', 'w00se', 'wang', 'wank', 'wanker', 'wanky', 'whoar', 'whore', 'willies', 'xxx']
exports.filter.addWords(...exports.badWords)
module.exports.containsBadWords = function a(text) {
  return exports.filter.isProfane(text)
}

const utility = [
  'FLASHLIGHT',
  'NICE_SWEATER',
  'PEPE_MEME',
  'GASOLINE',
  'RED_KEY',
  'GREEN_KEY',
  'BLUE_KEY',
  'TOOLBOX',
  'MAP',
  'TRACK_SUIT',
  'UMBRELLA',
  'FOOD',
  'WATER',
  'BOOK',
]

const weapons = [
  'KNIFE',
  'SLINGSHOT',
  'LIGHTER',
  'TREBUCHET',
]

module.exports.utility = utility
module.exports.weapons = weapons

const allowedItems = [...utility, ...weapons]

module.exports.itemFoundWeights = {
  FLASHLIGHT: 20,
  NICE_SWEATER: 20,
  PEPE_MEME: 5,
  GASOLINE: 10,
  RED_KEY: 2,
  GREEN_KEY: 3,
  BLUE_KEY: 4,
  TOOLBOX: 15,
  MAP: 20,
  TRACK_SUIT: 20,
  UMBRELLA: 10,
  FOOD: 25,
  WATER: 25,
  BOOK: 15,
  KNIFE: 4,
  SLINGSHOT: 5,
  LIGHTER: 7,
  TREBUCHET: 1,
}

module.exports.foundItemWeightsTotal = Object.keys(exports.itemFoundWeights).reduce((total, n) => {
  if (typeof total === 'string') {
    return exports.itemFoundWeights[total] + exports.itemFoundWeights[n]
  }
  return total + exports.itemFoundWeights[n]
})

function makeDistribution(weights) {
  const dist = {}
  let index = 1
  Object.keys(weights).forEach((key) => {
    const currentMax = weights[key]
    dist[key] = [index, index + currentMax - 1]
    index += currentMax
  })
  return dist
}
module.exports.foundItemDistribution = makeDistribution(exports.itemFoundWeights)

module.exports.getFoundItem = () => {
  const randNumber = exports.randomBetween(1, exports.foundItemWeightsTotal)
  let item = null
  Object.keys(exports.foundItemDistribution).forEach((key) => {
    if (randNumber >= exports.foundItemDistribution[key][0] && randNumber <= exports.foundItemDistribution[key][1]) {
      item = key
    }
  })
  return item
}

module.exports.itemPrices = {
  FLASHLIGHT: 100,
  NICE_SWEATER: 50,
  PEPE_MEME: 50,
  GASOLINE: 100,
  RED_KEY: 1000,
  GREEN_KEY: 900,
  BLUE_KEY: 800,
  TOOLBOX: 400,
  MAP: 200,
  TRACK_SUIT: 300,
  UMBRELLA: 100,
  KNIFE: 500,
  SLINGSHOT: 100,
  LIGHTER: 50,
  TREBUCHET: 1000,
  FOOD: 25,
  WATER: 25,
  BOOK: 100,
}

module.exports.allowedItems = allowedItems.map(item => ({ name: item, src: `${item}_ICON.jpg` }))
module.exports.allowedItemsPlusGold = [...exports.allowedItems, { name: 'GOLD', src: 'GOLD_ICON.jpg' }]

module.exports.allowedImages = exports.allowedItemsPlusGold.map(item => (item.src))

module.exports.imageCategories = {
  scenery: ['RESIZE_tree.jpg', 'RESIZE_grass.jpg', 'RESIZE_table_plant.jpg', 'RESIZE_fastvan.jpg', 'RESIZE_minneapolis.jpg', 'RESIZE_tree.png', 'RESIZE_mystery.jpg'],
  items: exports.allowedImages,
  misc: ['RESIZE_foot.jpg', 'RESIZE_cereal.jpg', 'RESIZE_tire.jpg', 'RESIZE_creator_flash.jpg', 'RESIZE_clock.jpg', 'RESIZE_some_art.jpg', 'RESIZE_coffee.jpg', 'RESIZE_chocolate_thing.jpg', 'RESIZE_glasses.jpg', 'RESIZE_pupper.jpg', 'RESIZE_emergency.jpg', 'RESIZE_wallet.jpg', 'RESIZE_nowallet.jpg', 'RESIZE_fist.jpg'],
  user: ['thadude.jpg', 'RESIZE_weird_monkey.jpg'],
}

module.exports.allowedImages = [
  ...exports.imageCategories.scenery,
  ...exports.imageCategories.items,
  ...exports.imageCategories.misc,
  ...exports.imageCategories.user,
]

module.exports.Slot = {
  initialSpinSpeed: 2, // default 2
  spinFactor: 0.047, // default 0.047
  stopSpinThreshold: 90, // default 90
}

module.exports.PathViewer = {
  outerTransitionDuration: 1100, // default 1100
  innerTransitionDuration: 800, // default 800
  healthMax: 100, // default 100
  healthMin: 30, // default 30
  intelligenceMax: 100, // default 100
  intelligenceMin: 0, // default 0
  sanityMax: 100, // default 100
  sanityMin: 0, // default 0
  staminaMax: 100, // default 100
  staminaMin: 0, // default 0
  defaultName: 'Farts McGee',
}

module.exports.checkVal = {
  // example:
  // when check(HEALTH) is ran
  // it picks a random number between HEALTH[0] and HEALTH[1]
  // and if the users health is greater than that number
  // then the check succeeds.
  HEALTH: [10, 90],
  INTELLIGENCE: [10, 90],
  SANITY: [10, 90],
  STAMINA: [10, 90],
}

module.exports.eatFoodBonus = 15
module.exports.drinkWaterBonus = 15
module.exports.readBookBonus = 20


module.exports.GameBar = {
  inventoryCellCount: 16,
  inventoryItems: exports.allowedItemsPlusGold,
  priceReduction: 0.2, // default 0.2 (20% reduction)
  useItemEffects: (name) => {
    switch (name) {
      case 'UMBRELLA':
        return (state, dataStore, that) => {
          const newState = state
          let isItemDropped = false
          newState.useItemMessage = 'You open the umbrella. If it was raining right now, you would be nice and dry!'
          if (newState.intelligence < (exports.PathViewer.intelligenceMax * 0.3)) {
            // if the user is dumb
            newState.useItemMessage = 'You try to open the umbrella, but your stupidity overwhelms you. You pull it way too hard, and it falls apart. Nice work.'
            isItemDropped = true
          }
          return { newState, isItemDropped }
        }
      case 'TRACK_SUIT':
        return (state, dataStore, that) => {
          const newState = state
          newState.useItemMessage = 'You put on the track suit. The will to squat overwhelms you. You wish there was some techno bass music playing right now.'
          return { newState, isItemDropped: false }
        }
      case 'MAP':
        return (state, dataStore, that) => {
          const newState = state
          newState.useItemMessage = `It${"'"}s a world map. Not very useful to you at the moment.`
          return { newState, isItemDropped: false }
        }
      case 'TOOLBOX':
        return (state, dataStore, that) => {
          const newState = state
          newState.useItemMessage = 'You open the toolbox and play with some of the tools. Maybe someday you will learn how to actually use them.'
          return { newState, isItemDropped: false }
        }
      case 'GREEN_KEY':
        return (state, dataStore, that) => {
          const newState = state
          newState.useItemMessage = 'The legends say that it is supposed to open something green...'
          return { newState, isItemDropped: false }
        }
      case 'BLUE_KEY':
        return (state, dataStore, that) => {
          const newState = state
          newState.useItemMessage = 'The legends say that it is supposed to open something blue...'
          return { newState, isItemDropped: false }
        }
      case 'RED_KEY':
        return (state, dataStore, that) => {
          const newState = state
          newState.useItemMessage = 'The legends say that it is supposed to open something red...'
          return { newState, isItemDropped: false }
        }
      case 'PEPE_MEME':
        return (state, dataStore, that) => {
          const newState = state
          newState.useItemMessage = 'You stare at Pepe. He stares back, and tells you everything will be ok.'
          return { newState, isItemDropped: false }
        }
      case 'FLASHLIGHT':
        return (state, dataStore, that) => {
          const newState = state
          newState.useItemMessage = 'You flick the flashlight on and off a couple times. "Neat", you think to yourself.'
          return { newState, isItemDropped: false }
        }
      case 'NICE_SWEATER':
        return (state, dataStore, that) => {
          const newState = state
          newState.useItemMessage = `You put on your sweater. It${"'"}s warm, and cozy, and makes you feel nice inside :)`
          return { newState, isItemDropped: false }
        }
      case 'GASOLINE':
        return (state, dataStore, that) => {
          const newState = state
          let isItemDropped = false
          if (dataStore.merchantIsActive() && dataStore.merchantIsAlive()) {
            newState.useItemMessage = 'You pour the gasoline all over the merchant.'
            isItemDropped = true
            dataStore.setMerchantInGasoline(true)
          } else if (newState.intelligence < (exports.PathViewer.intelligenceMax * 0.3)) {
            dataStore.setCoveredInGasoline(true)
            isItemDropped = true
            newState.useItemMessage = 'You pour the gasoline all over yourself. Now if only you had a lighter...'
          } else {
            newState.useItemMessage = 'You unscrew the cap on the gasoline container, and think about pouring it all over yourself, but then you decide that maybe thats not the best idea.'
          }
          return { newState, isItemDropped }
        }
      case 'SLINGSHOT':
        return (state, dataStore, that) => {
          const newState = state
          const isItemDropped = false
          if (dataStore.merchantIsActive() && dataStore.merchantIsAlive()) {
            newState.useItemMessage = 'You draw back the slingshot, and aim at the merchant. You release, and watch as the projectile pierces the merchants skull, knocking him to the ground. You laugh as you pick up all of the goods that fell to the ground.'
            const merchantItems = dataStore.getMerchantItems()
            merchantItems.forEach((item) => {
              that.buyItem(item.name, 0)
            })
            dataStore.killMerchant()
          } else {
            newState.useItemMessage = 'You play around with the slingshot. What an interesting weapon!'
          }
          return { newState, isItemDropped }
        }
      case 'TREBUCHET':
        return (state, dataStore, that) => {
          const newState = state
          const isItemDropped = false
          if (dataStore.merchantIsActive() && dataStore.merchantIsAlive()) {
            newState.useItemMessage = 'You take all of the trebuchet parts out of your backpack. The merchant watches you carefully as you assemble it about 300 meters away. It takes you an hour, but you finally assemble it. You attach yourself onto the throwing arm, and drop the counterweight. It launches you at 30 feet per second, and upon impact you kill the merchant instantly. You got a bit scraped up in the process, but as you look at all the cool items on the ground, you start to think it might have been worth it.'
            newState.health -= (exports.PathViewer.healthMax * 0.1)
            if (newState.health <= 0) {
              newState.health = 0
            }
            const merchantItems = dataStore.getMerchantItems()
            merchantItems.forEach((item) => {
              that.buyItem(item.name, 0)
            })
            dataStore.setHealth(newState.health)
            dataStore.killMerchant()
          } else {
            newState.useItemMessage = 'You take all of the trebuchet parts out of your backpack. Hours pass as you carefully assemble. You finally assemble it, and attach yourself onto the throwing arm, and drop the counterweight. It launches you and you soar into the air like a bird. But unlike a bird, you cannot fly, so you fall to the ground at 30 feet per second. It hurt quite a bit.'
            newState.health -= (exports.PathViewer.healthMax * 0.2)
            if (newState.health <= 0) {
              newState.health = 0
            }
            dataStore.setHealth(newState.health)
          }
          return { newState, isItemDropped }
        }
      case 'LIGHTER':
        return (state, dataStore, that) => {
          const newState = state
          const isItemDropped = false
          if (dataStore.merchantIsActive() && dataStore.merchantIsAlive() && dataStore.isMerchantCoveredInGasoline()) {
            newState.useItemMessage = 'You hold the lighter to the merchant, who is covered in gasoline. Quickly, the merchant bursts into flames. You watch, excitedly, as the merchant falls to the ground, dropping all of the items.'
            const merchantItems = dataStore.getMerchantItems()
            merchantItems.forEach((item) => {
              that.buyItem(item.name, 0)
            })
            dataStore.killMerchant()
          } else if (dataStore.isCoveredInGasoline()) {
            newState.useItemMessage = 'Apparently you forgot that you poured gasoline over yourself earlier... You turn on the lighter and get engulfed in a beautiful flame. After a minute, your body lies lifeless on the ground. A hundred years later, historians still argue about whether or not you intended to immolate yourself, but either way they agree that it was a pretty badass way to go.'
            newState.health = 0
            dataStore.setHealth(0)
          } else {
            newState.useItemMessage = 'You flick the lighter on and off a couple times. You think to yourself: Thats pretty neat!'
          }
          return { newState, isItemDropped }
        }
      case 'FOOD':
        return (state, dataStore, that) => {
          const newState = state
          const isItemDropped = true
          newState.health += exports.eatFoodBonus
          if (newState.health > exports.PathViewer.healthMax) {
            newState.health = exports.PathViewer.healthMax
          }
          newState.useItemMessage = 'You eat the food. It tastes good, and makes you feel better.'
          dataStore.setHealth(newState.health)
          return { newState, isItemDropped }
        }
      case 'WATER':
        return (state, dataStore, that) => {
          const newState = state
          const isItemDropped = true
          newState.stamina += exports.drinkWaterBonus
          if (newState.stamina > exports.PathViewer.staminaMax) {
            newState.stamina = exports.PathViewer.staminaMax
          }
          newState.useItemMessage = 'You drink the water. Its refreshing, and gives you a boost of energy.'
          dataStore.setStamina(newState.stamina)
          return { newState, isItemDropped }
        }
      case 'BOOK':
        return (state, dataStore, that) => {
          const newState = state
          const isItemDropped = true
          newState.intelligence += exports.readBookBonus
          if (newState.intelligence > exports.PathViewer.intelligenceMax) {
            newState.intelligence = exports.PathViewer.intelligenceMax
          }
          newState.useItemMessage = 'You read the book. You feel smarter already!'
          dataStore.setIntelligence(newState.intelligence)
          return { newState, isItemDropped }
        }
      case 'KNIFE':
        return (state, dataStore, that) => {
          const newState = state
          let isItemDropped = false
          if (dataStore.merchantIsActive()) {
            if (dataStore.merchantIsAlive()) {
              newState.useItemMessage = 'You swing the knife at the merchant and kill him.'
              const merchantItems = dataStore.getMerchantItems()
              merchantItems.forEach((item) => {
                that.buyItem(item.name, 0)
              })
              dataStore.killMerchant()
            } else {
              newState.useItemMessage = 'You wish the merchant was here so you could kill him again.'
            }
          } else {
            newState.useItemMessage = 'You think about stabbing yourself with the knife but you decide not to.'
          }
          return { newState, isItemDropped }
        }
      default:
        return (state, dataStore, that) => {
          const newState = state
          if (exports.weapons.includes(name)) {
            // if it is a weapon item treat it specially
            if (dataStore.merchantIsActive()) {
              if (dataStore.merchantIsAlive()) {
                newState.useItemMessage = 'You use the weapon to kill the merchant.'
                const merchantItems = dataStore.getMerchantItems()
                merchantItems.forEach((item) => {
                  that.buyItem(item.name, 0)
                })
                dataStore.killMerchant()
              } else {
                newState.useItemMessage = 'You wish the merchant was here so you could kill him again.'
              }
            } else {
              newState.useItemMessage = 'You stare at this weapon. What a dangerous item you posess!'
              if (newState.intelligence < (exports.PathViewer.intelligenceMax * 0.3)) {
                // if the user is dumb, accidentally hurts self with weapon
                newState.useItemMessage = 'You stare at this weapon. Its power overwhelms you, and you use it against yourself!'
                newState.health -= (exports.PathViewer.healthMax * 0.2)
                if (newState.health <= 0) {
                  newState.health = 0
                }
                dataStore.setHealth(newState.health)
              }
            }
          } else {
            // otherwise its just a regular item...
            newState.useItemMessage = 'You arent exactly sure how youre supposed to use this item...'
          }
          return { newState, isItemDropped: false }
        }
    }
  },
}

module.exports.ChooseStartingItem = {
  allowedItems: exports.allowedItems,
  transitionDuration: exports.PathViewer.innerTransitionDuration,
  howManyToPick: 4,
}

module.exports.Path = {
  transitionDuration: exports.PathViewer.outerTransitionDuration,
}

module.exports.PathEffect = {
  numberOfMerchantItems: 6, // default 6
  getFoundItem: () => {
    return exports.getFoundItem()
  },
  isConditionalEffect: (effect) => {
    return (effect.includes('has(') || effect.includes('check('))
  },
  getAttribute: (effect) => {
    return effect.substring(effect.indexOf('(') + 1, effect.indexOf(')'))
  },
  chooseMerchantItems: (n) => {
    const indices = []
    const items = []
    while (indices.length < n) {
      const rand = Math.floor(Math.random() * exports.allowedItems.length)
      if (indices.indexOf(rand) === -1) indices.push(rand)
    }
    indices.forEach((ind) => {
      const item = exports.allowedItems[ind]
      item.price = exports.itemPrices[item.name]
      items.push(item)
    })
    return items
  },
  didEffectPass: (effect, dataStore) => {
    if (effect.includes('has')) {
      const itemName = exports.PathEffect.getAttribute(effect)
      const inventory = dataStore.getInventory()
      let pass = false
      inventory.forEach((item) => {
        if (item.name === itemName) pass = true
      })
      return pass
    }
    if (effect.includes('check')) {
      const statName = exports.PathEffect.getAttribute(effect)
      let statValue = 0
      let statValThreshold = 0
      if (statName === 'HEALTH') {
        statValue = dataStore.getHealth()
      } else if (statName === 'INTELLIGENCE') {
        statValue = dataStore.getIntelligence()
      } else if (statName === 'SANITY') {
        statValue = dataStore.getSanity()
      } else if (statName === 'STAMINA') {
        statValue = dataStore.getStamina()
      }

      const [min, max] = exports.checkVal[statName]
      statValThreshold = exports.randomBetween(min, max)
      // console.log(`CHECKING IF ${statName} is greater than ${statValThreshold}`)
      return (statValue > statValThreshold)
    }
    return false
  },
  getEffectHeader: (effect) => {
    switch (effect) {
      case 'NONE':
        return 'No Effect'
      case 'HEALTH_U':
        return 'Health Increasing'
      case 'HEALTH_D':
        return 'Health Decreasing'
      case 'INTELLIGENCE_U':
        return 'Intelligence Increasing'
      case 'INTELLIGENCE_D':
        return 'Intelligence Decreasing'
      case 'SANITY_U':
        return 'Sanity Increasing'
      case 'SANITY_D':
        return 'Sanity Decreasing'
      case 'STAMINA_U':
        return 'Stamina Increasing'
      case 'STAMINA_D':
        return 'Stamina Decreasing'
      case 'GOLD':
        return 'Found Gold'
      case 'MERCHANT':
        return 'A wild merchant appears'
      case 'FOUND_ITEM':
        return 'You found an item'
      default:
        let attribute = exports.PathEffect.getAttribute(effect)
        let type = `Do you have ${attribute}?`
        if (effect.includes('check(')) type = `Is your ${attribute} high enough?`
        return `Conditional effect : ${type}`
    }
  },
  getEffectOutcome: (passed, effect) => {
    if (passed) {
      return effect.substring(effect.indexOf(')') + 1, effect.indexOf(':'))
    }
    return effect.substring(effect.indexOf(':') + 1, effect.length)
  },
  getStatAndDir: (effect) => {
    switch (effect) {
      case 'NONE':
        return { statName: 'None', dir: '' }
      case 'HEALTH_U':
        return { statName: 'Health', dir: 'up' }
      case 'HEALTH_D':
        return { statName: 'Health', dir: 'down' }
      case 'INTELLIGENCE_U':
        return { statName: 'Intelligence', dir: 'up' }
      case 'INTELLIGENCE_D':
        return { statName: 'Intelligence', dir: 'down' }
      case 'SANITY_U':
        return { statName: 'Sanity', dir: 'up' }
      case 'SANITY_D':
        return { statName: 'Sanity', dir: 'down' }
      case 'STAMINA_U':
        return { statName: 'Stamina', dir: 'up' }
      case 'STAMINA_D':
        return { statName: 'Stamina', dir: 'down' }
      case 'GOLD':
        return { statName: 'Gold', dir: 'up' }
      case 'MERCHANT':
        return { statName: 'Merchant', dir: '' }
      case 'FOUND_ITEM':
        return { statName: 'FoundItem', dir: '' }
      default:
        return null
    }
  },
  getMaxMin: (statName) => {
    // determins the maximum or minimum change in
    // a certain stat when an effect happens
    // eg: when effect is HEALTH_D, how much should
    // health go down by? maximum decrease is 10 (default)
    // and minimum decrease is 1 (default) same applies
    // for HEALTH_U
    switch (statName) {
      case 'Health':
        return { max: 10, min: 1 } // default 10, 1
      case 'Intelligence':
        return { max: 10, min: 3 } // default 10, 3
      case 'Sanity':
        return { max: 15, min: 2 } // default 15, 2
      case 'Stamina':
        return { max: 10, min: 3 } // default 10, 3
      case 'Gold':
        return { max: 100, min: 20 } // default 100, 20
      case 'Merchant':
        return { max: null, min: null }
      case 'FoundItem':
        return { max: null, min: null }
      case 'None':
        return { max: null, min: null }
      default:
        return null
    }
  },
}

module.exports.isValidImage = (image) => {
  return exports.allowedImages.includes(image)
}

module.exports.isValidEffect = (effect) => {
  let basicEffect = false
  exports.MakePath.effects.forEach((item) => {
    if (item.name === effect) {
      basicEffect = true
    }
  })
  if (basicEffect) return true

  try {
    let passIsValid = false
    let failIsValid = false
    if (exports.PathEffect.isConditionalEffect(effect)) {
      const pass = exports.PathEffect.getEffectOutcome(true, effect)
      const fail = exports.PathEffect.getEffectOutcome(false, effect)
      exports.MakePath.effects.forEach((item) => {
        if (item.name === pass) {
          passIsValid = true
        }
        if (item.name === fail) {
          failIsValid = true
        }
      })

      if (!passIsValid || !failIsValid) return false

      let attributeIsValid = false
      if (effect.includes('has(')) {
        const itemName = exports.PathEffect.getAttribute(effect)
        exports.allowedItems.forEach((item) => {
          if (item.name === itemName) {
            attributeIsValid = true
          }
        })
      }
      if (effect.includes('check(')) {
        const statName = exports.PathEffect.getAttribute(effect)
        exports.MakePath.stats.forEach((stat) => {
          if (stat.name === statName) {
            attributeIsValid = true
          }
        })
      }

      if (attributeIsValid && passIsValid && failIsValid) {
        return true
      }
    }
  } catch (e) {
    return false
  }
  return false
}

// idea:
// insteadd of picking random number for the nnon finalized array,
// it picks the one with teh most votes.  So if you receive an array of objects one should have
// an indicator that it should be played first. players can then vieew other ones.

module.exports.pathObjects = {
  '.': {
    text: 'You wake up to the sound of cars driving past. It\'s cold out, and you\'re in the middle of the street. How did you get here? What is this place? And most importantly, where is your wallet? You check all of your pockets, but no wallet can be found...',
    image: 'RESIZE_minneapolis.jpg',
    choiceL: {
      q: 'Scream in frustration that you can\'t find your wallet',
      image: 'RESIZE_nowallet.jpg',
      text: 'You scream at the top of your lungs: "MY WALLET!!!!!" You fall to your knees, clutching your fists and shaking them at the sky. What a cruel world to live in. First, you wake up in an unfamiliar place, and now you have no wallet? This is outrageous, it\'s unfair! You stay there on the ground shaking your fists for a few minutes before your arms get tired.',
      effect: DEV ? 'NONE' : 'NONE', // default NONE
    },
    choiceR: {
      q: 'Ask somebody where you are',
      image: 'RESIZE_minneapolis.jpg',
      text: 'You look around and spot a few pedestrians. Swiftly, you stand up, and rush towards one of them. They spot you running right towards them, and out of fear they start to quicken their pace. You speed up as well; they noticed, and began to sprint away from you. You scream at them: "No, you don\'t understand! I don\'t know where I am!" At this point, they are running faster than they\'ve ever ran before, and they certainly don\'t seem to want to slow down.',
      effect: DEV ? 'NONE' : 'NONE', // default GOLD
    },
  },
  // eslint you idiot! I want to use it as a string, not a number...
  // eslint-disable-next-line
  '1': {
    choiceL: {
      text: 'Hmm, probably just a crazy person. Better not to get involved. You decide to look for somebody else to ask, but alas, there is nobody in sight! How strange, at one moment there were plenty of people walking around, and suddenly no one... As you lament your recent misfortunes you walk up to a beautiful tree...',
      image: 'RESIZE_tree.jpg',
      q: 'Leave them alone. Try asking somebody else',
      effect: DEV ? 'NONE' : 'NONE', // default HEALTH_D
    },
    choiceR: {
      text: 'What an outrage! All you wanted was to ask them where you are, and they started to run away from you? This behavior cannot be tolerated. They look over their shoulder in fear, and spot that you\'re now running after them very quickly. They see the determination in your face, like a predator chasing its prey. After a few minutes, you caught up to them.',
      image: 'TRACK_SUIT_ICON.jpg',
      q: 'Run after them',
      effect: DEV ? 'NONE' : 'NONE', // default MERCHANT
    },
  },
  // eslint-disable-next-line
  '10': {
    choiceL: {
      q: 'Make love with the tree',
      image: 'RESIZE_tree.jpg',
      effect: DEV ? 'NONE' : 'INTELLIGENCE_D', // default INTELLIGENCE_U
      text: 'Ah yes, the only reasonable thing to do at a time like this. You approach the tree, and caress its tender bark. What a beautiful tree... After a few hours, you and the tree are both satisfied.',
    },
    choiceR: {
      q: 'Shake your fist at the tree',
      effect: DEV ? 'NONE' : 'SANITY_D',
      text: 'How dare this tree get in the way while you were feeling sorry for yourself. Unacceptable!',
      image: 'RESIZE_fist.jpg',
    },
  },
  // eslint-disable-next-line
  '100': {
    choiceL: {
      q: 'Leave the tree, and never come back...',
      effect: DEV ? 'NONE' : 'NONE', // default INTELLIGENCE_D
      text: 'You had your fun, but it\'s time to go. You\'re sure that the tree will forgive you... As you start to walk away, you check over your shoulder to see if the tree is looking at you. It is, and it\'s crying.',
      image: 'RESIZE_foot.jpg',
    },
    choiceR: {
      q: 'Decide you want to spend the rest of your life with this tree',
      effect: DEV ? 'NONE' : 'SANITY_D',
      image: 'RESIZE_tree.jpg',
      text: 'You stare at the tree lovingly. There is no better partner than a tree; so wise, so tall, so much bark. You decide to marry the tree. You fantasize about all the tree babies you will have together.',
    },
  },
  // eslint-disable-next-line
  '11': {
    choiceL: {
      q: 'Spare them',
      text: 'They trip and fall. You approach them slowly. As you are getting near them, they look up at you and say: "No, please! Don\'t hurt me. Please, maybe we can make a deal!"',
      effect: DEV ? 'NONE' : 'MERCHANT', // default HEALTH_D
      image: 'RESIZE_mystery.jpg',
    },
    choiceR: {
      q: 'No mercy!',
      text: 'You push them, and they loose their balance, and fall over. You hover over them as they attempt to crawl away from you in fear. That\'s when it happens: In a fit of rage, you scream at the top of your lungs, while staring right into their eyes...',
      effect: DEV ? 'NONE' : 'SANITY_D', // default SANITY_D
      image: 'RESIZE_fist.jpg',
    },
  },
  // eslint-disable-next-line
  '0': {
    choiceL: {
      text: 'It\'s decided then: You will devote yourself to pursue your missing wallet. There is nothing else on your mind besides finding that wallet. You stand up, and start walking east. You have no idea where you\'re going, but you\'re determined, and that\'s all that matters.',
      image: 'RESIZE_wallet.jpg',
      q: 'Decide to spend the rest of your life in search of your wallet',
      effect: DEV ? 'NONE' : 'NONE', // default NONE
    },
    choiceR: {
      text: 'You decide that a few minutes of shaking your fists is not enough! You sit there for another few minutes and keep shaking your fists. Now, your shoulders ache, and you can barely keep your arms up.',
      image: 'RESIZE_fist.jpg',
      q: 'Keep shaking your fists',
      effect: DEV ? 'NONE' : 'SANITY_D', // default SANITY_D
    },
  },
  // eslint-disable-next-line
  '01': {
    choiceL: {
      q: 'That\'s enough. Time to go find my wallet!',
      text: 'Exhausted from shaking your fists for so long, you stand up and decide to start looking for your wallet. You have no idea where to even look, though, because you still don\'t know where you are. ',
      effect: DEV ? 'NONE' : 'INTELLIGENCE_U', // default INTELLIGENCE_D
      image: 'RESIZE_tire.jpg',
    },
    choiceR: {
      q: 'Keep shaking your fists',
      text: 'You don\'t even care that your arms are sore. You don\'t care that you no longer feel your fists from the cold. You don\'t care that people have gathered around to watch this lunatic who\'s been shaking fists at the sky for the last 10 minutes now. You don\'t care because you are filled with rage at the fact that your wallet is missing. Nothing can ease your pain, so you release your frustration the only way you know how: by shaking your fists in the sky for an uncomfortably long period of time.',
      image: 'RESIZE_fist.jpg',
      effect: DEV ? 'NONE' : 'HEALTH_D', // default HEALTH_D
    },
  },
  // eslint-disable-next-line
  '00': {
    choiceL: {
      q: 'Ask somebody where you are',
      effect: DEV ? 'NONE' : 'MERCHANT', // default HEALTH_D
      image: 'RESIZE_fastvan.jpg',
      text: 'You look around for somebody who might be able to help you on your quest, and you spot a strange looking man a few blocks away. You jog up to this man, and ask: "Excuse me, good sir. Would you happen to know where we are exactly?" The man stares at you for a few moments, and then responds: "Yes, this is Minneapolis. You look lost, and hungry. Please, take a look at my wares, I might have something of use to you if you have some coin." You tell the strange man: "Actually, I lost my wallet, I can\'t afford to buy anything right now". "Well maybe you can sell me something of yours, and then you\'ll have enough to buy something from me!"',
    },
    choiceR: {
      q: 'You don\'t need directions! Keep going east',
      effect: DEV ? 'NONE' : 'FOUND_ITEM', // default HEALTH_D
      image: 'RESIZE_mystery.jpg',
      text: 'You know exactly where you\'re going! You\'re going to find you wallet! It doesn\'t matter that you are in a foreign place, with absolutely no idea how you got here. All that matters is that you\'re on a quest to find your wallet. While you were thinking about what a glorious adventure you are going to have, you find something interesting laying on the ground...',
    },
  },
}

function encodePath(path) {
  if (!Array.isArray(path)) throw new Error('path must be an array')
  if (path.length === 0) throw new Error('path must have at least 1 element')
  if (path[0].length === 0) throw new Error('path cannot start with empty string')

  let encodedString = ''
  let prevString = ''
  path.forEach((item) => {
    if (typeof item !== 'string') throw new Error('each item in path must be a string')
    if (item.length > 4) throw new Error('each item strings length must be <= 4')

    if (prevString.length !== 0 && prevString.length < 4) {
      // only the last element of path can be less than a word
      throw new Error(`last string was less than a word, cannot have ${item} come afterwards`)
    }

    if (prevString.length === 4 && item.length < 4) {
      // we have reached the last element, and it happens to be
      // a less than a word (eg: '000' or '10'. A word would have 4 bits)
      encodedString += item
      prevString = item
      return null
    }

    if (prevString.length === 0 && item.length < 4) {
      // the first item is less than a word
      encodedString += item
      prevString = item
      return null
    }

    let n = 0
    let letterInd = 3
    item.split('').forEach((letter) => {
      const num = parseInt(letter, 10)
      if (Number.isNaN(num)) throw new Error('string must only contain 0s or 1s')
      if (num !== 0 && num !== 1) throw new Error('string must only contain 0s or 1s')

      n += num * (2 ** letterInd)
      letterInd -= 1
    })

    let letter = n.toString(16)
    if (letter === '0') letter = 'O'
    if (letter === '1') letter = 'L'

    encodedString += letter
    prevString = item
    return null
  })

  return encodedString
}

function decodePath(path) {
  if (!path) throw new Error('must provide a path argument')
  if (typeof path !== 'string') throw new Error('path must be a string')

  // only allow these characters, and case matters
  const reg = new RegExp('((?!(a|b|c|d|e|f|0|1|2|3|4|5|6|7|8|9|O|L)).)')
  if (reg.test(path)) throw new Error('illegal characters found in string')

  const list = []
  let lastWord = ''
  let zerosInARow = 0
  let onesInARow = 0
  const STOP = 4
  path.split('').forEach((char) => {
    if (zerosInARow > 3) throw new Error('illegal characters found in string')
    if (onesInARow > 3) throw new Error('illegal characters found in string')

    if (char !== '0') {
      zerosInARow = 0
    }
    if (char !== '1') {
      onesInARow = 0
    }

    switch (char) {
      case 'a':
        lastWord += '1010'
        break
      case 'b':
        lastWord += '1011'
        break
      case 'c':
        lastWord += '1100'
        break
      case 'd':
        lastWord += '1101'
        break
      case 'e':
        lastWord += '1110'
        break
      case 'f':
        lastWord += '1111'
        break
      case 'O':
        lastWord += '0000'
        break
      case 'L':
        lastWord += '0001'
        break
      case '2':
        lastWord += '0010'
        break
      case '3':
        lastWord += '0011'
        break
      case '4':
        lastWord += '0100'
        break
      case '5':
        lastWord += '0101'
        break
      case '6':
        lastWord += '0110'
        break
      case '7':
        lastWord += '0111'
        break
      case '8':
        lastWord += '1000'
        break
      case '9':
        lastWord += '1001'
        break
      case '0':
        zerosInARow += 1
        lastWord += '0'
        break
      case '1':
        onesInARow += 1
        lastWord += '1'
        break
      default:
        console.log('THERE IS NO DEFAULT HERE!')
    }
    if (lastWord.length === STOP) {
      list.push(lastWord)
      lastWord = ''
    }
  })

  if (lastWord.length > 0) list.push(lastWord)
  return list
}

module.exports.decodePath = decodePath
module.exports.encodePath = encodePath

// NOTE: if you are running this locally, any API action WILL NOT WORK
// because of CORS. If you want to use an api and see how it works
// take a look at the backend directory at the root of the repo
// and theres some instructions on how to deploy to AWS
// if you simply want to mess around with the frontend design, but want
// to add more path objects, just modify the module.exports.pathObjects object
// above, and add your own objects there.
module.exports.getPathObjEndpoint = 'https://api.collabopath.com/path/'
module.exports.votePathObjEndpoint = 'https://api.collabopath.com/path/vote'
module.exports.addPathObjEndpoint = 'https://api.collabopath.com/path/add'
module.exports.suggestionEndpoint = 'https://api.collabopath.com/suggestion'
