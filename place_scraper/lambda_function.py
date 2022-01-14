# Selenium Lambda setup: https://www.youtube.com/watch?v=jWqbYiHudt8

try:
    import re
    from selenium.webdriver import Chrome
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    import shutil
    import boto3
    from boto3.dynamodb.conditions import Key
    import datetime

    client = boto3.resource('dynamodb')
    table = client.Table('FeastItem-dbi6udtvrnb2pbuc2bfbuh4fhe-dev')

    print("All Modules are ok ...")

except Exception as e:

    print("Error in Imports ")


class WebDriver(object):

    def __init__(self):
        self.options = Options()

        self.options.binary_location = '/opt/headless-chromium'
        self.options.add_argument('--headless')
        self.options.add_argument('--no-sandbox')
        self.options.add_argument('--single-process')
        self.options.add_argument('--disable-dev-shm-usage')
        self.options.add_argument('--window-size=1280x1696')

    def get(self):
        driver = Chrome('/opt/chromedriver', options=self.options)
        return driver


chains = {
    "Another Broken Egg Cafe",
    "Applebee's Grill + Bar",
    "Biaggi's Ristorante Italiano",
    "BJ's Restaurant and Brewhouse",
    "Black Bear Diner",
    "Blaze Pizza",
    "Bob Evans",
    "Bonefish Grill",
    "Brio Tuscan Grille",
    "Buca di Beppo Italian Restaurant",
    "Buffalo Wild Wings",
    "Carrabba's Italian Grill",
    "The Cheesecake Factory",
    "Chili's",
    "Cooper's Hawk & Winery Restaurant",
    "Dave & Buster's",
    "Denny's",
    "Eddie V's Prime Seafood",
    "First Watch",
    "Fleming's Prime Steakhouse",
    "Fogo De Chao Brazilian Steakhouse",
    "Freddy's Frozen Custard & Steakburgers",
    "Fuzzy's Taco Shop",
    "Gordon Biersch Brewery Restaurant",
    "Hard Rock Cafe",
    "Honey Baked Ham Company",
    "Houlihan's",
    "Houston's",
    "IHOP",
    "Iron Age",
    "J. Alexander's",
    "J. Alexander's Redlands Grill",
    "Joe's Crab Shack",
    "LongHorn Steakhouse",
    "Maggiano's Little Italy",
    "Marco's Pizza",
    "McCormick & Schmick's Seafood & Steaks",
    "Mellow Mushroom",
    "MOD Pizza",
    "Morton's The Steakhouse",
    "Newk's Eatery",
    "Noodles & Company",
    "Old Spaghetti Factory",
    "Olive Garden Italian Restaurant",
    "On The Border Mexican Grill & Cantina",
    "Outback Steakhouse",
    "P.F. Chang's",
    "Perkins Restaurant and Bakery",
    "Planet Hollywood Restaurants",
    "Red Lobster",
    "Red Robin Gourmet Burgers and Brews",
    "Rock Bottom Restaurant & Brewery",
    "Ruby Tuesday",
    "Ruth's Chris Steak House",
    "Seasons 52",
    "Shakey's Pizza Parlor",
    "Sweet Tomatoes",
    "TGI Fridays",
    "Tacombi",
    "Texas De Brazil",
    "Texas Roadhouse",
    "The Capital Grille",
    "The Egg & I",
    "The Melting Pot",
    "Tropical Smoothie Cafe",
    "True Food Kitchen",
    "Yard House",
}

fastfood = {
    "A&W Restaurant",
    "Arby's",
    "Auntie Anne's",
    "Bojangles' Famous Chicken 'n Biscuits",
    "Boston Market",
    "Burger King",
    "California Pizza Kitchen",
    "Captain D's",
    "Caribou Coffee",
    "Carl's Jr.",
    "Carvel",
    "Checkers",
    "Chick-fil-A",
    "Chipotle Mexican Grill",
    "Chopt Creative Salad Co.",
    "Church's Chicken",
    "CiCi's Pizza",
    "Cinnabon",
    "The Coffee Bean & Tea Leaf",
    "Cold Stone Creamery",
    "Cookies by Design",
    "Corner Bakery Cafe",
    "Culver's",
    "Dairy Queen",
    "Dairy Queen Orange Julius",
    "Del Taco",
    "Domino's Pizza",
    "Dunkin'",
    "Earl of Sandwich",
    "Einstein Bros Bagels",
    "El Pollo Loco",
    "Five Guys",
    "Hardee's",
    "In-N-Out Burger",
    "Jack in the Box",
    "Jamba Juice",
    "Jason's Deli",
    "Jersey Mike's Subs",
    "Jimmy John's",
    "KFC",
    "Krispy Kreme",
    "Little Caesars Pizza",
    "McAlister's Deli",
    "McDonald's",
    "Moe's Southwest Grill",
    "Nestle Toll House Cafe by Chip",
    "Orange Julius",
    "Panda Express",
    "Panera Bread",
    "Papa John's Pizza",
    "Papa Murphy's",
    "Peet's Coffee & Tea",
    "Pei Wei Asian Diner",
    "Pizza Hut",
    "Pizza Patrón",
    "Popeyes Louisiana Kitchen",
    "Portillo's Hot Dogs",
    "Pret A Manger",
    "QDOBA Mexican Eats",
    "Quiznos",
    "Raising Cane's Chicken Fingers",
    "Rally's",
    "Schlotzsky's",
    "Shake Shack",
    "Smashburger",
    "Smoothie King",
    "Sonic Drive-In",
    "Starbucks",
    "Starbucks Reserve",
    "Steak 'n Shake",
    "Subway",
    "Sweetgreen",
    "Taco Bell",
    "Tiff's Treats",
    "Tim Hortons",
    "Wendy's",
    "Whataburger",
    "White Castle",
    "Wingstop",
    "Zaxby's Chicken Fingers & Buffalo Wings"
}

category_map = {
    'afghani': 'afghan',
    'african': 'african',
    'eastafrican': 'african',
    'northafrican': 'african',
    'westafrican': 'african',
    'american': 'american',
    'argentinian': 'argentinian',
    'asianfusion': 'asianfusion',
    'australian': 'australian',
    'austrian': 'austrian',
    'bagel': 'bagels',
    'bakery': 'bakery',
    'wholesalebakery': 'bakery',
    'bangladeshi': 'bangladeshi',
    'bar': 'bar',
    'bargrill': 'bar',
    'barbecue': 'bbq',
    'beergarden': 'beergarden',
    'belgian': 'belgian',
    'bistro': 'bistro',
    'brazilian': 'brazilian',
    'breakfast': 'breakfast',
    'british': 'british',
    'modernbritish': 'british',
    'bubbletea': 'bubbletea',
    'buffet': 'buffet',
    'bulgarian': 'bulgarian',
    'burmese': 'burmese',
    'burrito': 'burritos',
    'cafe': 'cafe',
    'cafeteria': 'cafeteria',
    'cajun': 'cajun',
    'cake': 'cakes',
    'cambodian': 'cambodian',
    'candy': 'candy',
    'cantonese': 'cantonese',
    'caribbean': 'caribbean',
    'conveyorbeltsushi': 'sushi',
    'cheese': 'cheese',
    'cheesesteak': 'cheesesteaks',
    'chicken': 'chicken',
    'chickenwings': 'wings',
    'chinese': 'chinese',
    'chinesenoodle': 'noodles',
    'chinesepastry': 'bakery',
    'chocolatecafe': 'chocolate',
    'chocolate': 'chocolate',
    'cocktailbar': 'cocktailbar',
    'coffee': 'coffee',
    'colombian': 'colombian',
    'cuban': 'cuban',
    'cupcake': 'cupcakes',
    'czech': 'czech',
    'deli': 'deli',
    'deliverychinese': 'chinese',
    'dessert': 'desserts',
    'dimsum': 'dimsum',
    'diner': 'diner',
    'dominican': 'dominican',
    'donut': 'donuts',
    'dumpling': 'dumplings',
    'dutch': 'dutch',
    'easterneuropean': 'easterneuropean',
    'egyptian': 'egyptian',
    'english': 'english',
    'ethiopian': 'ethiopian',
    'falafel': 'falafel',
    'fastfood': 'fastfood',
    'filipino': 'filipino',
    'fishchips': 'fishnchips',
    'fondue': 'fondue',
    'foodcourt': 'foodcourt',
    'french': 'french',
    'frenchsteakhouse': 'steak',
    'modernfrench': 'french',
    'frozenyogurt': 'froyo',
    'gastropub': 'gastropub',
    'gaybar': 'gaybar',
    'german': 'german',
    'greek': 'greek',
    'haitian': 'haitian',
    'halal': 'halal',
    'hamburger': 'burgers',
    'hawaiian': 'hawaiian',
    'hookahbar': 'hookahbar',
    'hotdog': 'hotdogs',
    'hotdogstand': 'hotdogs',
    'hotpot': 'hotpot',
    'hunan': 'hunan',
    'hungarian': 'hungarian',
    'icecream': 'icecream',
    'indian': 'indian',
    'indonesian': 'indonesian',
    'irishpub': 'irishpub',
    'irish': 'irish',
    'israeli': 'israeli',
    'italian': 'italian',
    'southernitalian': 'italian',
    'jamaican': 'jamaican',
    'japanese': 'japanese',
    'japanesesteakhouse': 'japanese',
    'seafooddonburi': 'japanese',
    'authenticjapanese': 'japanese',
    'japanesecurry': 'japanese',
    'japanesehotpot': 'japanese',
    'japaneseregional': 'japanese',
    'japanesesweets': 'japanese',
    'kyotostylejapanese': 'japanese',
    'jewish': 'jewish',
    'karaokebar': 'karaokebar',
    'kebab': 'kebab',
    'koreanbarbecue': 'kbbq',
    'korean': 'korean',
    'koreanbeef': 'korean',
    'koreanrib': 'korean',
    'kosher': 'kosher',
    'laotian': 'laotian',
    'latinamerican': 'latin',
    'southamerican': 'latin',
    'lebanese': 'lebanese',
    'lounge': 'lounge',
    'malaysian': 'malaysian',
    'meatdish': 'meat',
    'mediterranean': 'mediterranean',
    'mexican': 'mexican',
    'middleeastern': 'mideastern',
    'moderneuropean': 'moderneuropean',
    'mongolianbarbecue': 'mongolian',
    'moroccan': 'moroccan',
    'newamerican': 'newamerican',
    'noodle': 'noodles',
    'pakistani': 'pakistani',
    'pancake': 'pancakes',
    'pastry': 'pastries',
    'persian': 'persian',
    'peruvian': 'peruvian',
    'pho': 'pho',
    'pie': 'pies',
    'pizza': 'pizza',
    'pizzadelivery': 'pizza',
    'polish': 'polish',
    'popcorn': 'popcorn',
    'portuguese': 'portuguese',
    'pretzel': 'pretzels',
    'pub': 'pub',
    'puertorican': 'puertorican',
    'ramen': 'ramen',
    'romanian': 'romanian',
    'russian': 'russian',
    'salad': 'salad',
    'salvadoran': 'salvadoran',
    'sandwich': 'sandwiches',
    'scandinavian': 'scandinavian',
    'seafood': 'seafood',
    'shabushabu': 'shabushabu',
    'shanghainese': 'shanghai',
    'snackbar': 'snack',
    'sobanoodle': 'soba',
    'soup': 'soup',
    'southafrican': 'southafrican',
    'southernus': 'southernsoul',
    'spanish': 'spanish',
    'sportsbar': 'sportsbar',
    'srilankan': 'srilankan',
    'steakhouse': 'steak',
    'sushi': 'sushi',
    'swiss': 'swiss',
    'syrian': 'syrian',
    'taco': 'tacos',
    'taiwanese': 'taiwanese',
    'tapasbar': 'tapas',
    'tapas': 'tapas',
    'teahouse': 'tea',
    'teppanyaki': 'teppanyaki',
    'texmex': 'texmex',
    'thai': 'thai',
    'traditionalamerican': 'tradamerican',
    'truckstop': 'truckstop',
    'turkish': 'turkish',
    'udonnoodle': 'udon',
    'ukrainian': 'ukrainian',
    'vegan': 'vegan',
    'vegetarian': 'vegetarian',
    'venezuelan': 'venezuelan',
    'vietnamese': 'vietnamese',
    'winebar': 'winebar',
    'yemenite': 'yemen'
}

categories_all = {
    'afghan': {
        'title': 'Afghan Restaurant'
    },
    'african': {
        'title': 'African Restaurant',
    },
    'ethiopian': {
        'title': 'Ethiopian Restaurant'
    },
    'senegalese': {
        'title': 'Senegalese Restaurant'
    },
    'southafrican': {
        'title': 'South African Restaurant'
    },
    'american': {
        'title': 'American Restaurant',
    },
    'newamerican': {
        'title': 'New American Restaurant'
    },
    'newmexican': {
        'title': 'New Mexican Restaurant'
    },
    'southernsoul': {
        'title': 'Southern / Soul Restaurant'
    },
    'tradamerican': {
        'title': 'Traditional American Restaurant'
    },
    'asianfusion': {
        'title': 'Asian Fusion Restaurant'
    },
    'australian': {
        'title': 'Australian Restaurant'
    },
    'austrian': {
        'title': 'Austrian Restaurant'
    },
    'bar': {
        'title': 'Bar',
    },
    'beachbar': {'title': 'Beach Bar'},
    'beerbar': {'title': 'Beer Bar'},
    'beergarden': {'title': 'Beer Garden'},
    'champagnebar': {'title': 'Champagne Bar'},
    'cigarbar': {'title': 'Cigar Bar'},
    'cocktailbar': {'title': 'Cocktail Bar'},
    'divebar': {'title': 'Dive Bar'},
    'gaybar': {'title': 'Gay Bar'},
    'hookahbar': {'title': 'Hookah Bar'},
    'hotelbar': {'title': 'Hotel Bar'},
    'irishpub': {'title': 'Irish Pub'},
    'karaokebar': {'title': 'Karaoke Bar'},
    'lounge': {'title': 'Lounge'},
    'pub': {'title': 'Pub'},
    'speakeasy': {'title': 'Speakeasy'},
    'sportsbar': {'title': 'Sports Bar'},
    'tikibar': {'title': 'Tiki Bar'},
    'whiskeybar': {'title': 'Whiskey Bar'},
    'winebar': {'title': 'Wine Bar'},
    'bbq': {
        'title': 'BBQ Restaurant'
    },
    'bagels': {
        'title': 'Bagel Shop'
    },
    'bakery': {
        'title': 'Bakery'
    },
    'bangladeshi': {
        'title': 'Bangladeshi Restaurant'
    },
    'belgian': {
        'title': 'Belgian Restaurant'
    },
    'bistro': {
        'title': 'Bistro'
    },
    'breakfast': {
        'title': 'Breakfast Restaurant'
    },
    'british': {
        'title': 'British Restaurant'
    },
    'bubbletea': {
        'title': 'Bubble Tea Shop'
    },
    'buffet': {
        'title': 'Buffet Restaurant'
    },
    'burgers': {
        'title': 'Burger Restaurant'
    },
    'burmese': {
        'title': 'Burmese Restaurant'
    },
    'cafeteria': {
        'title': 'Cafeteria'
    },
    'cafe': {
        'title': 'Cafe'
    },
    'cambodian': {
        'title': 'Cambodian Restaurant'
    },
    'cajun': {
        'title': 'Cajun / Creole Restaurant'
    },
    'caribbean': {
        'title': 'Caribbean Restaurant',
    },
    'cuban': {
        'title': 'Cuban Restaurant'
    },
    'dominican': {
        'title': 'Dominican Restaurant'
    },
    'haitian': {
        'title': 'Haitian Restaurant'
    },
    'jamaican': {
        'title': 'Jamaican Restaurant'
    },
    'puertorican': {
        'title': 'Puerto Rican Restaurant'
    },
    'trinidadian': {
        'title': 'Trinidadian Restaurant'
    },
    'cheesesteaks': {
        'title': 'Cheesesteak Shop'
    },
    'chinese': {
        'title': 'Chinese Restaurant',
    },
    'cantonese': {
        'title': 'Cantonese Restaurant'
    },
    'dimsum': {
        'title': 'Dim Sum Restaurant'
    },
    'dongbei': {
        'title': 'Dongbei Restaurant'
    },
    'fujian': {
        'title': 'Fujian Restaurant'
    },
    'hainan': {
        'title': 'Hainan Restaurant'
    },
    'hunan': {
        'title': 'Hunan Restaurant'
    },
    'pekingduck': {
        'title': 'Peking Duck Shop'
    },
    'shanghai': {
        'title': 'Shanghai Restaurant'
    },
    'szechuan': {
        'title': 'Szechuan Restaurant'
    },
    'xinjiang': {
        'title': 'Xinjiang Restaurant'
    },
    'coffee': {
        'title': 'Coffee Shop'
    },
    'coffeeroastery': {
        'title': 'Coffee Roastery'
    },
    'comfortfood': {
        'title': 'Comfort Food Restaurant'
    },
    'creperie': {
        'title': 'Creperie'
    },
    'czech': {
        'title': 'Czech Restaurant'
    },
    'deli': {
        'title': 'Deli Shop'
    },
    'desserts': {
        'title': 'Dessert Shop',
    },
    'cakes': {
        'title': 'Cake Shop'
    },
    'cupcakes': {
        'title': 'Cupcake Shop'
    },
    'gelato': {
        'title': 'Gelato Shop'
    },
    'icecream': {
        'title': 'Ice Cream Shop'
    },
    'pastries': {
        'title': 'Pastry Shop'
    },
    'pies': {
        'title': 'Pie Shop'
    },
    'shavedice': {
        'title': 'Shaved Ice Shop'
    },
    'froyo': {
        'title': 'Frozen Yogurt Shop'
    },
    'diner': {
        'title': 'Diner'
    },
    'donuts': {
        'title': 'Donut Shop'
    },
    'dumplings': {
        'title': 'Dumpling Restaurant'
    },
    'dutch': {
        'title': 'Dutch Restaurant'
    },
    'easterneuropean': {
        'title': 'Eastern European Restaurant',
    },
    'bosnian': {
        'title': 'Bosnian Restaurant'
    },
    'bulgarian': {
        'title': 'Bulgarian Restaurant'
    },
    'romanian': {
        'title': 'Romanian Restaurant'
    },
    'english': {
        'title': 'English Restaurant'
    },
    'falafel': {
        'title': 'Falafel Restaurant'
    },
    'fastfood': {
        'title': 'Fast Food Restaurant'
    },
    'filipino': {
        'title': 'Filipino Restaurant'
    },
    'finedining': {
        'title': 'Fine Dining Restaurant'
    },
    'fishnchips': {
        'title': 'Fish & Chips Restaurant'
    },
    'fondue': {
        'title': 'Fondue Restaurant'
    },
    'foodcourt': {
        'title': 'Food Court'
    },
    'foodstand': {
        'title': 'Food Stand'
    },
    'foodtruck': {
        'title': 'Food Truck'
    },
    'french': {
        'title': 'French Restaurant',
    },
    'brasserie': {
        'title': 'Brasserie'
    },
    'chicken': {
        'title': 'Chicken Shop'
    },
    'gastropub': {
        'title': 'Gastropub'
    },
    'german': {
        'title': 'German Restaurant'
    },
    'glutenfree': {
        'title': 'Gluten-free Restaurant'
    },
    'greek': {
        'title': 'Greek Restaurant',
    },
    'souvlaki': {
        'title': 'Souvlaki Restaurant'
    },
    'halal': {
        'title': 'Halal Restaurant'
    },
    'hawaiian': {
        'title': 'Hawaiian Restaurant',
    },
    'pho': {
        'title': 'Pho Restaurant'
    },
    'poke': {
        'title': 'Poke Restaurant'
    },
    'himalayan': {
        'title': 'Himalayan Restaurant'
    },
    'hotdogs': {
        'title': 'Hot Dog Shop'
    },
    'hotpot': {
        'title': 'Hotpot Restaurant'
    },
    'hungarian': {
        'title': 'Hungarian Restaurant'
    },
    'indian': {
        'title': 'Indian Restaurant',
    },
    'chaat': {
        'title': 'Chaat Restaurant'
    },
    'dosa': {
        'title': 'Dosa Restaurant'
    },
    'indianchinese': {
        'title': 'Indian Chinese Restaurant'
    },
    'northindian': {
        'title': 'North Indian Restaurant'
    },
    'southindian': {
        'title': 'South Indian Restaurant'
    },
    'indonesian': {
        'title': 'Indonesian Restaurant',
    },
    'irish': {
        'title': 'Irish Restaurant'
    },
    'italian': {
        'title': 'Italian Restaurant'
    },
    'japanese': {
        'title': 'Japanese Restaurant',
    },
    'japacurry': {
        'title': 'Japanese Curry Restaurant'
    },
    'ramen': {
        'title': 'Ramen Restaurant'
    },
    'shabushabu': {
        'title': 'Shabu-Shabu Restaurant'
    },
    'soba': {
        'title': 'Soba Restaurant'
    },
    'sushi': {
        'title': 'Sushi Restaurant'
    },
    'teppanyaki': {
        'title': 'Teppanyaki Restaurant'
    },
    'udon': {
        'title': 'Udon Restaurant'
    },
    'jewish': {
        'title': 'Jewish Restaurant',
    },
    'kosher': {
        'title': 'Kosher Restaurant'
    },
    'juicebar': {
        'title': 'Juice Bar'
    },
    'kbbq': {
        'title': 'Korean BBQ Restaurant'
    },
    'korean': {
        'title': 'Korean Restaurant'
    },
    'kebab': {
        'title': 'Kebab Restaurant'
    },
    'laotian': {
        'title': 'Laotian Restaurant'
    },
    'latin': {
        'title': 'Latin American Restaurant',
    },
    'arepas': {
        'title': 'Arepas Restaurant'
    },
    'argentinian': {
        'title': 'Argentinian Restaurant'
    },
    'brazilian': {
        'title': 'Brazilian Restaurant'
    },
    'colombian': {
        'title': 'Colombian Restaurant'
    },
    'empanadas': {
        'title': 'Empanadas Restaurant'
    },
    'peruvian': {
        'title': 'Peruvian Restaurant'
    },
    'salvadoran': {
        'title': 'Salvadoran Restaurant'
    },
    'venezuelan': {
        'title': 'Venezuelan Restaurant'
    },
    'mac&cheese': {
        'title': 'Mac & Cheese Restaurant'
    },
    'malaysian': {
        'title': 'Malaysian Restaurant'
    },
    'meat': {
        'title': 'Meat Restaurant'
    },
    'mediterranean': {
        'title': 'Mediterranean Restaurant'
    },
    'moroccan': {
        'title': 'Moroccan Restaurant'
    },
    'mexican': {
        'title': 'Mexican Restaurant'
    },
    'burritos': {
        'title': 'Burrito Shop'
    },
    'tacos': {
        'title': 'Taco Shop'
    },
    'texmex': {
        'title': 'Tex-Mex Restaurant'
    },
    'mideastern': {
        'title': 'Middle Eastern Restaurant'
    },
    'arabian': {
        'title': 'Arabian Restaurant'
    },
    'egyptian': {
        'title': 'Egyptian Restaurant'
    },
    'iraqi': {
        'title': 'Iraqi Restaurant'
    },
    'israeli': {
        'title': 'Israeli Restaurant'
    },
    'kurdish': {
        'title': 'Kurdish Restaurant'
    },
    'lebanese': {
        'title': 'Lebanese Restaurant'
    },
    'persian': {
        'title': 'Persian Restaurant'
    },
    'shawarma': {
        'title': 'Shawarma Restaurant'
    },
    'syrian': {
        'title': 'Syrian Restaurant'
    },
    'yemen': {
        'title': 'Yemeni Restaurant'
    },
    'moderneuropean': {
        'title': 'Modern European Restaurant'
    },
    'moleculargastronomy': {
        'title': 'Molecular Gastronomy Restaurant'
    },
    'mongolian': {
        'title': 'Mongolian Restaurant'
    },
    'noodles': {
        'title': 'Noodle Shop'
    },
    'pakistani': {
        'title': 'Pakistani Restaurant'
    },
    'pancakes': {
        'title': 'Pancake Shop'
    },
    'petcafe': {
        'title': 'Pet Cafe'
    },
    'pizza': {
        'title': 'Pizza Shop'
    },
    'polish': {
        'title': 'Polish Restaurant'
    },
    'popuprest': {
        'title': 'Pop-up Restaurant'
    },
    'portuguese': {
        'title': 'Portuguese Restaurant'
    },
    'poutine': {
        'title': 'Poutine Shop'
    },
    'russian': {
        'title': 'Russian Restaurant'
    },
    'salad': {
        'title': 'Salad Shop'
    },
    'sandwiches': {
        'title': 'Sandwich Shop'
    },
    'satay': {
        'title': 'Satay Restaurant'
    },
    'scandinavian': {
        'title': 'Scandinavian Restaurant'
    },
    'scottish': {
        'title': 'Scottish Restaurant'
    },
    'seafood': {
        'title': 'Seafood Restaurant'
    },
    'slovakian': {
        'title': 'Slovakian Restaurant'
    },
    'snack': {
        'title': 'Snack Shop'
    },
    'soup': {
        'title': 'Soup Shop'
    },
    'spanish': {
        'title': 'Spanish Restaurant'
    },
    'paella': {
        'title': 'Paella Restaurant'
    },
    'tapas': {
        'title': 'Tapas Restaurant'
    },
    'specialty': {
        'title': 'Specialty Food Restaurant'
    },
    'candy': {
        'title': 'Candy Shop'
    },
    'cheese': {
        'title': 'Cheese Shop'
    },
    'chocolate': {
        'title': 'Chocolate Shop'
    },
    'macarons': {
        'title': 'Macaron Shop'
    },
    'popcorn': {
        'title': 'Popcorn Shop'
    },
    'pretzels': {
        'title': 'Pretzel Shop'
    },
    'srilankan': {
        'title': 'Sri Lankan Restaurant'
    },
    'steak': {
        'title': 'Steakhouse'
    },
    'streetvendor': {
        'title': 'Street Vendor'
    },
    'swiss': {
        'title': 'Swiss Restaurant'
    },
    'taiwanese': {
        'title': 'Taiwanese Restaurant'
    },
    'tea': {
        'title': 'Tea Shop'
    },
    'thai': {
        'title': 'Thai Restaurant'
    },
    'theme': {
        'title': 'Theme Restaurant'
    },
    'tibetan': {
        'title': 'Tibetan Restaurant'
    },
    'truckstop': {
        'title': 'Truck Stop'
    },
    'turkish': {
        'title': 'Turkish Restaurant',
    },
    'doner': {
        'title': 'Doner Restaurant'
    },
    'ukrainian': {
        'title': 'Ukrainian Restaurant'
    },
    'vegan': {
        'title': 'Vegan Restaurant'
    },
    'vegetarian': {
        'title': 'Vegetarian Restaurant'
    },
    'vietnamese': {
        'title': 'Vietnamese Restaurant'
    },
    'waffles': {
        'title': 'Waffle Shop'
    },
    'wings': {
        'title': 'Wings Shop'
    },
    'wraps': {
        'title': 'Wraps Shop'
    }
}


def remove_url_utm(curr_url):
    i = curr_url.find('?')
    if i > -1:
        return curr_url[:i]
    return curr_url


def remove_url_utm_delivery(curr_url):
    # i = curr_url.find('restaurantId')
    i = curr_url.find('fo_m')
    if i > -1:
        i = curr_url.find('&', i)
        if i > -1:
            return curr_url[:i]
        else:
            return curr_url
    return None


def get_img_url(url):
    start = url.find('https://lh5.googleusercontent.com/')
    end = url.find('%', start, len(url))
    curr_url = url[start:end]
    if not curr_url:
        start = url.find('y,')+2
        end = url.find('h', start, len(url))
        yaw = url[start:end]
        start = url.find('*211s', end, len(url))+5
        end = url.find('*212e', start, len(url))
        key = url[start:end]
        curr_url = f'geo3.ggpht.com/cbk?output=thumbnail&cb_client=unknown_client.imagery_viewer.gps&panoid={key}&yaw={yaw}'
    return curr_url


regex = re.compile('[^a-zA-Z]')


def format_category(cat):
    key = cat.lower()
    key = regex.sub('', key)
    key = key.replace('restaurant', '')
    key = key.replace('shop', '')
    key = key.replace('store', '')
    return key


def normalize(query):
    query_formatted = query.replace('&', 'and')
    query_formatted = query_formatted.replace('é', 'e')
    query_formatted = query_formatted.encode("ascii", "ignore")
    query_formatted = query_formatted.decode()
    query_formatted = query_formatted.strip()
    print(query_formatted)
    return query_formatted


def lambda_handler(*args, **kwargs):

    instance_ = WebDriver()
    driver = instance_.get()

    print(args[0])
    inp = args[0]
    _id = inp['placeId']
    _strippedName = inp['strippedName']
    _name = inp['name']
    _geohash = inp['geohash']
    _address = inp.get('address', '')
    _city = inp.get('city', '')
    _state = inp.get('region', '')
    _zip = inp.get('zip', '')
    _country = inp.get('country', '')
    _category = inp.get('category', '')
    _chain = inp.get('chain', '')

    query = f'{_name} {_address} {_city} {_state}' if re.search(
        '\d', _address) else f'{_name} {_city} {_state}'
    query_formatted = normalize(query)
    google_url = 'https://www.google.com/search?q='
    search_url = google_url + query_formatted
    print(search_url)
    driver.get(search_url)

    try:
        page = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, 'rcnt')))
        sideResult = page.find_element_by_id('rhs')
        header = sideResult.find_element_by_class_name('SPZz6b')
    except:
        try:
            if not _category:
                raise Exception
            query = f'{_name} {_category} {_address} {_city} {_state}' if re.search(
                '\d', _address) else f'{_name} {_category} {_city} {_state}'
            query_formatted = normalize(query)
            search_url = google_url + query_formatted
            driver.get(search_url)
            page = WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.ID, 'rcnt')))
            sideResult = page.find_element_by_id('rhs')
            header = sideResult.find_element_by_class_name('SPZz6b')
        except:
            element = driver.find_element_by_xpath('//*')
            element = element.get_attribute('innerHTML')
            print(element)
            print(search_url)
            raise Exception('COULD NOT FIND RESTAURANT')

    name = header.find_element_by_xpath('//h2/span').text
    # default type to IND if not chain in FSQ
    type = 'CHAIN' if _chain else 'IND'
    if name in fastfood:
        type = 'FAST'
    elif name in chains:
        type = 'CHAIN'

    lat = None
    lon = None
    try:
        ll_container = sideResult.find_element_by_class_name('lu-fs')
        ll_subcontainer = ll_container.find_element_by_xpath('..')
        lat_lon = ll_subcontainer.get_attribute('data-url')
        ll_index = lat_lon.index('@')
        lat_lon = lat_lon[ll_index+1:]
        lat_index = lat_lon.find(',')
        lat = lat_lon[:lat_index]
        lat_lon = lat_lon[lat_index+1:]
        lon_index = lat_lon.find(',')
        lon = lat_lon[:lon_index]
    except:
        try:
            if not _category:
                raise Exception
            print('COULD NOT FIND RESTAURANT, attempting with category')
            query = f'{_name} {_category} {_address} {_city} {_state}' if re.search(
                '\d', _address) else f'{_name} {_category} {_city} {_state}'
            query_formatted = normalize(query)
            search_url = google_url + query_formatted
            driver.get(search_url)
            page = WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.ID, 'rcnt')))
            sideResult = page.find_element_by_id('rhs')
            header = sideResult.find_element_by_class_name('SPZz6b')
            name = header.find_element_by_xpath('//h2/span').text
            type = 'IND'
            if name in fastfood:
                type = 'FAST'
            elif name in chains:
                type = 'CHAIN'
            ll_container = sideResult.find_element_by_class_name('lu-fs')
            ll_subcontainer = ll_container.find_element_by_xpath('..')
            lat_lon = ll_subcontainer.get_attribute('data-url')
            ll_index = lat_lon.index('@')
            lat_lon = lat_lon[ll_index+1:]
            lat_index = lat_lon.find(',')
            lat = lat_lon[:lat_index]
            lat_lon = lat_lon[lat_index+1:]
            lon_index = lat_lon.find(',')
            lon = lat_lon[:lon_index]
        except:
            element = driver.find_element_by_xpath('//*')
            element = element.get_attribute('innerHTML')
            print(element)
            raise Exception('COULD NOT FIND RESTAURANT')
        print('no coordinates')

    try:
        closed = sideResult.find_element_by_css_selector(
            "div[data-attrid='kc:/local:permanently closed']")
        # closed.find_element_by_xpath(
        #     "//span[.='Temporarily closed']")
        closed.find_element_by_xpath(
            "//span[.='Permanently closed']")
    except:
        print('not permanently closed')
    else:
        print('CLOSED')
        return

    address = {'address1': _address, 'city': _city,
               'state': _state, 'zip': _zip, 'country': _country}

    url = None
    try:
        url = sideResult.find_element_by_link_text(
            'Website').get_attribute('href')
        url = remove_url_utm(url)
    except:
        print('no website url')

    imgUrl = None
    try:
        imgUrl = sideResult.find_element_by_class_name(
            'thumb').find_element_by_tag_name('a')
        imgUrl = get_img_url(imgUrl.get_attribute('href'))
        if not imgUrl:
            raise Exception
    except:
        print('no image url')

    description = None
    try:
        description = sideResult.find_element_by_class_name('Yy0acb').text
    except:
        print('no business description')

    priceLvl = None
    try:
        priceLvl = sideResult.find_element_by_class_name('YhemCb').text
        if '$' not in priceLvl:
            priceLvl = None
            raise Exception
        priceLvl = priceLvl.count('$')
    except:
        print('no priceLvl')

    categories = {}
    try:
        cand = sideResult.find_elements_by_class_name('YhemCb')
        categories_cand = cand[1].text if priceLvl and len(
            cand) > 1 else cand[0].text
        categories_cand = categories_cand.split(',')
        for cat in categories_cand:
            key = category_map.get(format_category(cat), None)
            if key:
                categories[key] = categories_all[key]['title']
                if key == 'fastfood':
                    type = 'FAST'
        if not categories:
            key = category_map.get(format_category(_category), None)
            if key:
                categories[key] = categories_all[key]['title']
            else:
                # if no category found, use FSQ category if exists
                if _category:
                    categories[re.sub(r'[^\nA-Za-z0-9À-ÖØ-öø-ÿ/]+', '',
                                      _category.lower())] = _category
                else:
                    categories = None
                raise Exception
    except:
        print('no categories')

    address_raw = None
    try:
        address_container = sideResult.find_element_by_link_text(
            'Address').find_element_by_xpath('../..')
        address_raw = address_container.find_elements_by_tag_name('span')
        address_raw = address_raw[len(address_raw)-1].text
        address['addressRaw'] = address_raw
    except:
        if not (lat or lon):
            print('COULD NOT FIND RESTAURANT')
            return
        print('no address')

    phone = None
    display_phone = None
    try:
        phone_container_elem = sideResult.find_element_by_link_text(
            'Phone').find_element_by_xpath('../../..')
        phone_container = phone_container_elem.find_element_by_class_name(
            'LrzXr')
        display_phone = phone_container.find_element_by_tag_name('span').text
        phone = display_phone
        nums = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'}
        for x in phone:
            if x not in nums:
                phone = phone.replace(x, '')
        phone = '+1' + phone
    except:
        print('no phone number')

    menu = None
    try:
        menu_container = sideResult.find_element_by_css_selector(
            "div[data-attrid='kc:/local:menu']").find_element_by_tag_name('a')
        menu = remove_url_utm(menu_container.get_attribute('href'))
    except:
        print('no menu')

    deliveryUrl = None
    try:
        deliveryUrl = sideResult.find_element_by_xpath(
            "//span[.='Order online']").find_element_by_xpath('./..').get_attribute('href')
        deliveryUrl = remove_url_utm_delivery(deliveryUrl)
    except:
        try:
            deliveryUrl = sideResult.find_element_by_xpath(
                "//span[.='Order delivery']").find_element_by_xpath('./..').get_attribute('href')
            deliveryUrl = remove_url_utm_delivery(deliveryUrl)
        except:
            print('no delivery url')

    yelp_alias = None
    yelp_url = None
    try:
        yelp_url = driver.find_element_by_css_selector(
            "a[href*='www.yelp.com']").get_attribute('href')
        end = yelp_url.find('?')
        if end == -1:
            end = len(yelp_url)
        yelp_alias = yelp_url[yelp_url.index('biz/')+4:end]
    except:
        try:
            yelp_url = driver.find_element_by_css_selector(
                "a[href*='m.yelp.com']").get_attribute('href')
            yelp_alias = yelp_url[yelp_url.index('biz/')+4:]
        except:
            print('no yelp url/alias')

    # print("--------------------------")
    # print('name: ', name)
    # print('type: ', type)
    # print('latitude: ', lat)
    # print('longitude: ', lon)
    # print('geohash: ', _geohash)
    # print('url: ', url)
    # print('imgUrl: ', imgUrl)
    # print('description: ', description)
    # print('priceLvl: ', priceLvl)
    # print('categories: ', categories)
    # print('address: ', address)
    # print('phone: ', phone)
    # print('displayPhone: ', display_phone)
    # print('menu: ', menu)
    # print('delivery: ', deliveryUrl)
    # print('yelp alias: ', yelp_alias)
    # print("--------------------------")

    driver.quit()

    PK = f'PLACE#{_id}'
    SK_begins = '#INFO#'
    SK = f'{SK_begins}{_strippedName}'
    GSI1 = 'PLACE#'
    GSI2 = 'GEO#'
    LSI1 = f'#GEO#{_geohash}'

    # Check if business is already in the database
    try:
        response = table.query(
            KeyConditionExpression=Key('PK').eq(
                PK) & Key('SK').begins_with(SK_begins)
        )
        if response['Items']:
            print('BUSINESS EXISTS')
            return
    except Exception as e:
        print('Get business error: ', e)

    date = datetime.datetime.now().isoformat()

    item = {
        'PK': PK,
        'SK': SK,
        'GSI1': GSI1,
        'GSI2': GSI2,
        'LSI1': LSI1,
        'placeId': _id,
        'geo': _geohash,
        'name': name,
        'city': address.get('city', None),
        'placeType': type,
        '__typename': 'FeastItem',
        'placeInfo': {
            'name': name,
            'coordinates': {
                'latitude': lat,
                'longitude': lon
            },
            'placeUrl': url,
            'imgUrl': imgUrl,
            'description': description,
            'priceLvl': priceLvl,
            'categories': categories,
            'address': address,
            'phone': phone,
            'displayPhone': display_phone,
            'menuUrl': menu,
            'orderUrl': deliveryUrl,
            'yelpAlias': yelp_alias
        },
        'createdAt': date,
        'updatedAt': date
    }

    print(item)

    # Store business
    try:
        response = table.put_item(
            Item=item
        )

        return {'code': 200}

    except Exception as e:
        print('Put item error: ', e)
        print(e.__traceback__)
        return {'code': 500, 'msg': str(e)}
