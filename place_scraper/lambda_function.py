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
    import json
    from decimal import Decimal

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


def remove_url_utm(curr_url):
    i = curr_url.find('?')
    if i > -1:
        return curr_url[:i]
    return curr_url


def remove_url_params(curr_url):
    i = curr_url.find('&')
    if i > -1:
        return curr_url[:i]
    return curr_url


image_types = ['.jpg', '.jpeg', '.png', '.gif', '.bmp',
               '.tiff', '.svg', '.webp', '.ico', '.avif', '.apng', '.heic']


def get_image_url(curr_url):
    i = curr_url.find('mediaurl=')
    if i > -1:
        curr_url = remove_url_params(curr_url[i+9:])
        for image_type in image_types:
            j = curr_url.find(image_type)
            if j > -1:
                curr_url = curr_url[:j+len(image_type)]
                break
        i = curr_url.rfind('http')
        curr_url = curr_url[i:].replace("%3a", ":")
        return curr_url.replace("%2f", "/")
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

    query = f'{_name} {_address} {_city} {_state}' if re.search(
        '\d', _address) else f'{_name} {_city} {_state}'
    query_formatted = normalize(query)
    bing_url = 'https://www.bing.com/search?q='
    search_url = bing_url + query_formatted
    print(search_url)

    # Required info for normal layout
    centerResult = None
    centerInfo = None
    centerInfoMain = None
    sideResult = None
    locationContainer = None
    name = ''
    lat = None
    lon = None

    # Required info for side layout
    sideResultMain = None
    locationContainer = None
    name = ''
    lat = None
    lon = None

    # For normal layout:
    # centerResult contains order links in addition to centerInfo
    # centerInfo contains main directory info and action buttons (directions, menu, website - only menu is relevant)
    # centerInfoMain contains main directory info without actions buttons
    # sideResult contains restaurant specific info (images, categories, price level)
    # For side layout:
    # sideResult contains sideResultMain, images, and order links
    # sideResultMain contains main directory info with actions buttons and restaurant specific info
    requiredInfoFound = []

    def getRequiredInfo(url):
        nonlocal centerResult, centerInfo, centerInfoMain, sideResult, sideResultMain, locationContainer, name, lat, lon
        driver.get(url)
        requiredInfoFound.append('page loaded, looking for outer container')
        # page containers
        page = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, 'b_content')))
        requiredInfoFound.append(
            'outer container (b_content) found, looking for side container')
        sideResult = page.find_element_by_id(
            'b_context').find_element_by_class_name('b_entityTP')
        requiredInfoFound.append(
            'side container (b_entityTP) found, looking for permanently_Closed')
        try:
            permanently_closed = sideResult.find_element_by_id(
                'permanently_Closed')
        except:
            pass
        else:
            raise Exception('PERMANENTLY_CLOSED')
        requiredInfoFound.append(
            'not permanently_Closed, looking for center container')
        try:
            centerResult = page.find_element_by_id(
                'b_results').find_element_by_class_name('lgb_ans')
            centerInfo = centerResult.find_element_by_class_name('b_hPanel')
            centerInfoMain = centerInfo.find_element_by_id('lgb_info')

            # name
            name = centerInfoMain.find_element_by_xpath('h2/a').text

            # coordinates
            locationContainer = centerInfoMain.find_element_by_class_name(
                'bm_details_overlay')
            locationDetails = json.loads(locationContainer.get_attribute(
                'data-detailsoverlay'))
            lat = locationDetails['centerLatitude']
            lon = locationDetails['centerLongitude']
            requiredInfoFound.append('center container found, isNormalLayout')
            return True
        except:
            requiredInfoFound.append(
                'no center container found, looking for side layout')
            sideResultMain = sideResult.find_element_by_class_name('compInfo')

            # name
            name = sideResultMain.find_element_by_class_name(
                'eh_text_outer').find_element_by_xpath('h2').text
            name = remove_url_params(name).strip()

            # coordinates
            locationContainer = sideResultMain.find_element_by_class_name(
                'bm_details_overlay')
            locationDetails = json.loads(locationContainer.get_attribute(
                'data-detailsoverlay'))
            lat = locationDetails['centerLatitude']
            lon = locationDetails['centerLongitude']
            return False

    # Get required info to be a valid restaurant
    # If failed due to permanently closed, return
    # If failed due to not found, attempt again with category in query
    isNormalLayout = True
    try:
        isNormalLayout = getRequiredInfo(search_url)
    except Exception as e:
        if str(e) == 'PERMANENTLY_CLOSED':
            print('PERMANENTLY CLOSED')
            return
        requiredInfoFound.append(
            'no center container found or side layout found')
        element = driver.find_element_by_xpath('//*')
        element = element.get_attribute('innerHTML')
        print(element)
        print(search_url)
        print(requiredInfoFound)
        raise Exception('COULD NOT FIND RESTAURANT')

    # default placeType to IND if not chain in FSQ
    placeType = 'IND'
    if name in chains:
        placeType = 'CHAIN'
    elif name in fastfood:
        placeType = 'FAST'

    address = None
    try:
        address = locationContainer.find_element_by_xpath('a').text
    except:
        print('no website url')

    placeUrl = None
    try:
        if isNormalLayout:
            placeUrlContainer = centerInfo.find_element_by_link_text('Website')
            placeUrl = remove_url_utm(placeUrlContainer.get_attribute('href'))
        else:
            placeUrlContainer = sideResultMain.find_element_by_css_selector(
                "a[aria-label='Website']").get_attribute('href')
            placeUrl = remove_url_utm(placeUrlContainer)
    except:
        print('no website url')

    menu = None
    try:
        container = centerInfo if isNormalLayout else sideResultMain
        menu_container = container.find_element_by_link_text('Menu')
        menu = remove_url_utm(menu_container.get_attribute('href'))
        if menu == 'https://www.godaddy.com/online-marketing/locu':
            menu = None
    except:
        print('no menu')

    phone = None
    display_phone = None
    try:
        container = centerInfoMain if isNormalLayout else sideResultMain
        display_phone_candidates = container.find_elements_by_css_selector(
            "a[h]")
        for candidate in display_phone_candidates:
            cand_phone = candidate.get_attribute('href')
            if cand_phone.startswith('tel:'):
                phone = '+1' + cand_phone[4:]
                display_phone = candidate.text
                break
    except:
        print('no phone number')

    order_links = {}
    try:
        container = centerResult if isNormalLayout else sideResult
        order_links_containers = container.find_element_by_class_name(
            'b_order_online').find_element_by_class_name('b_slidebar').find_elements_by_class_name('slide')
        for link in order_links_containers:
            order_url = link.find_element_by_tag_name(
                'a').get_attribute('href')
            order_name = link.find_element_by_class_name(
                'b_order_online_label').find_element_by_tag_name('span').text
            order_links[order_name] = remove_url_utm(order_url)
    except:
        print('no order links')

    imgUrl = None
    try:
        imgUrl = sideResult.find_element_by_class_name(
            'irp').find_element_by_tag_name('a')
        imgUrl = get_image_url(imgUrl.get_attribute('href'))
    except:
        print('no image url')

    priceLvl = None
    categories = None
    try:
        categoriesPriceContainer = sideResult.find_element_by_class_name(
            'b_factrow')
        categoriesText = categoriesPriceContainer.text
        print(categoriesText)
        # remove tripadvisor/facebook/other social from string if present
        socialPresent = False
        try:
            socialPresent = categoriesPriceContainer.find_element_by_tag_name(
                'a').text
        except:
            pass
        if socialPresent:
            i = categoriesText.find('·')
            if i > -1:
                categoriesText = categoriesText[i+2:]
            else:  # if only tripadvisor is present and neither category nor price level are
                raise Exception
        # if neither category nor price level are present
        if not categoriesText:
            raise Exception
        # find separator of categories and price level
        i = categoriesText.find('·')
        priceText = categoriesText
        if i > -1:  # if both categories and price level are present
            categoriesText = categoriesText[:i-1].strip()
            priceText = priceText[i+2:]
        else:
            i = priceText.find('$')
            if i > -1:  # if only price level is present
                priceText = priceText[i:]
                categoriesText = None
                print('no categories')
            else:  # if only categories are present
                categoriesText = categoriesText.strip()
                priceText = None
                print('no price level')
        print(categoriesText, priceText)
        if categoriesText:
            categories = categoriesText.split(', ')
            if 'Fast Food' in categories:
                placeType = 'FAST'
        if priceText:
            priceLvl = priceText.count('$')
    except Exception:
        print('no categories and/or price level')

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
    # print('name:', name)
    # print('placeType:', placeType)
    # print('latitude:', lat)
    # print('longitude:', lon)
    # print('geohash:', _geohash)
    # print('url:', placeUrl)
    # print('imgUrl:', imgUrl)
    # print('priceLvl:', priceLvl)
    # print('categories:', categories)
    # print('address:', address)
    # print('phone:', phone)
    # print('displayPhone:', display_phone)
    # print('menu:', menu)
    # print('order:', order_links)
    # print('yelpAlias:', yelp_alias)
    # print("--------------------------")

    driver.quit()

    PK = f'PLACE#{_id}'
    SK_begins = '#INFO#'
    SK = f'{SK_begins}{_geohash}'
    GSI1 = 'PLACE#'
    GSI2 = 'PLACE#'
    LSI1 = f'#NAME#{_strippedName}'

    # Check if business is already in the database
    try:
        response = table.query(
            KeyConditionExpression=Key('PK').eq(
                PK) & Key('SK').begins_with(SK_begins)
        )
        if response['Items']:
            print('BUSINESS EXISTS')
            return {'code': 200}
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
        'city': _city,
        'placeType': placeType,
        '__typename': 'FeastItem',
        'placeInfo': {
            'name': name,
            'coordinates': {
                'latitude': json.loads(json.dumps(lat), parse_float=Decimal),
                'longitude': json.loads(json.dumps(lon), parse_float=Decimal)
            },
            'placeUrl': placeUrl,
            'imgUrl': imgUrl,
            'priceLvl': priceLvl,
            'categories': categories,
            'address': address,
            'phone': phone,
            'displayPhone': display_phone,
            'menuUrl': menu,
            'orderUrls': order_links,
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
