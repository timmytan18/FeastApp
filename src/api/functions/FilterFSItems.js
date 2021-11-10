
import { API, graphqlOperation } from 'aws-amplify';
// import { getBusinessExists } from '../graphql/queries';
import { FSCATEGORIES } from '../../constants/FSCategories';
import { coordinateDistance } from './CoordinateDistance';
import config from '../../config';

export default async function filterFSItems(results) {

    let items = [];
    results.forEach(item => {
        if (item.categories) {
            for (let i = 0; i < item.categories.length; i++) {
                if (item.categories[i].id in FSCATEGORIES) {
                    items.push(item)
                    break
                }
            }
        }
    })
    console.log(items)

    const matches = {};

    const wordsToRemove = 'restaurant|shop|store|place';
    let nameA;
    let nameB;
    let parenA;
    let parenB;
    let nameSim;
    let locA;
    let locB;
    let dist;
    let distSim;
    let addressSim;
    let sameCity;
    let sameZip;
    let score;
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            if (!items[i] || !items[j] || !items[i].name || !items[j].name) {
                continue;
            }
            sameCity = false;
            sameZip = false;
            nameA = items[i].name.replace(new RegExp('\\b(' + wordsToRemove + ')\\b', 'gi'), ' ').replace(/\s{2,}/g, ' ');
            nameB = items[j].name.replace(new RegExp('\\b(' + wordsToRemove + ')\\b', 'gi'), ' ').replace(/\s{2,}/g, ' ');
            parenA = nameA.indexOf('(');
            parenB = nameB.indexOf('(');
            if ((parenA == -1) ^ (parenB == -1)) {
                if (parenA == -1) {
                    const start = parenB;
                    const end = nameB.lastIndexOf(')');
                    const substr = nameB.slice(start + 1, end).replace('aka', '');
                    const modified = nameB.substring(0, start) + nameB.substring(end + 1);
                    nameSim = Math.max(compareTwoStrings(nameA, modified, false), compareTwoStrings(nameA, substr), false);
                } else {
                    const start = parenA;
                    const end = nameA.lastIndexOf(')');
                    const substr = nameA.slice(start + 1, end).replace('aka', '');
                    const modified = nameA.substring(0, start) + nameA.substring(end + 1);
                    nameSim = Math.max(compareTwoStrings(modified, nameB, false), compareTwoStrings(substr, nameB), false);
                }
            } else {
                nameSim = compareTwoStrings(nameA, nameB, false);
            }

            if (nameSim >= 0.7) {
                locA = items[i].location;
                locB = items[j].location;
                if (locA && locB) {
                    dist = coordinateDistance(locA.lat, locA.lng, locB.lat, locB.lng);
                    distSim = dist == 0 ? 2 : 0.1 / dist;
                    if (locA.formattedAddress.length == 3 && locB.formattedAddress.length == 3) {
                        addressSim = compareTwoStrings(locA.formattedAddress[0], locB.formattedAddress[0], true);
                    } else {
                        addressSim = 0;
                    }
                    if (locA.city && locB.city && locA.city == locB.city) {
                        sameCity = true;
                        if (locA.postalCode && locB.postalCode && locA.postalCode == locB.postalCode) {
                            sameZip = true;
                        } else if (distSim > 0.3) {
                            distSim = 0.3;
                        }
                    } else if (distSim > 0.2) {
                        distSim = 0.2;
                    }
                }

                score = 0.5*nameSim + 0.3*distSim + 0.3*addressSim + (sameCity ? 0.05 : 0) + (sameZip ? 0.15 : 0);
                
                // if (score > 0.75) {
                //     console.log(items[i].name, ',', items[j].name)
                //     console.log(i, ',', j)
                //     console.log({
                //         'name': 0.5*nameSim,
                //         'distance': 0.3*distSim,
                //         'address': 0.3*addressSim,
                //         'city': (sameCity ? 0.05 : 0),
                //         'zip': (sameZip ? 0.15 : 0)
                //     })
                //     console.log(locA.city, locB.city)
                //     console.log('addressA:', locA.formattedAddress[0])
                //     console.log('addressB:', locB.formattedAddress[0])
                //     console.log(locA.postalCode, locB.postalCode)
                //     console.log('SCORE:', score)
                //     console.log('')
                // }
                if (score > 0.8) {
                    if (matches[i]) {
                        matches[i].push(j);
                    } else {
                        matches[i] = [j];
                    }
                    if (matches[j]) {
                        matches[j].push(i);
                    } else {
                        matches[j] = [i];
                    }
                }
            }
        }
    }
    let groups = bfs(matches);
    console.log(groups)
    if (groups.length) {

        const key = config.GOOGLE_GEO_API_KEY;

        for (let i = 0; i < groups.length; i++) {
            // If any item in group is in db, remove
            let removed = false;
            for (let a of groups[i].keys()) {
                const exists = await checkItemInDynamo(`BIZ#${items[a].id}`, '#PROFILE');
                if (exists) {
                    removed = true;
                    groups[i].delete(a);
                }
            }
            // Remove duplicates by checking if Google Places API
            if (groups[i].size && !removed) {
                let places = {};
                for (let a of groups[i].keys()) {
                    const name = items[a].name;
                    const { lat, lng } = items[a].location;
                    let request = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${name}&inputtype=textquery&fields=name,geometry,formatted_address,place_id&locationbias=point:${lat},${lng}&key=${key}`;
                    let res = await fetch(request);
                    let data = await res.json();
                    data = data.candidates;
                    data.forEach(place => {
                        places[place.place_id] = place;
                    })
                }
                let res = -1;
                let best = 0;
                for (let a of groups[i].keys()) {
                    for (let b in places) {
                        const score = comparePlaces(items[a], places[b]);
                        if (score > best) {
                            best = score;
                            res = a;
                        }
                    }
                }
                groups[i].delete(res);
                console.log('Chosen: ', items[res])
            }

            if (groups[i].size) {
                for (let a of groups[i].keys()) {
                    console.log('Deleted: ', items[a])
                    items[a] = null;
                }
            }
        }
    }
    
    items = items.filter(n => n);    
    return items;
}

function compareTwoStrings(first, second, isAddress) {
    if (!first || !second) return 0;
	first = first.replace(/\s+/g, '')
	second = second.replace(/\s+/g, '')

	if (!first.length && !second.length) return 1;              // if both are empty strings
	if (!first.length || !second.length) return 0;              // if only one is empty string
	if (first === second) return 1;       						// identical
	if (first.length === 1 && second.length === 1) return 0;    // both are 1-letter strings
	if (first.length < 2 || second.length < 2) return 0;		// if either is a 1-letter string

	let firstBigrams = new Map();
	for (let i = 0; i < first.length - 1; i++) {
		const bigram = first.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram) + 1
			: 1;

		firstBigrams.set(bigram, count);
	}

	let intersectionSize = 0;
	for (let i = 0; i < second.length - 1; i++) {
		const bigram = second.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram)
			: 0;

		if (count > 0) {
			firstBigrams.set(bigram, count - 1);
			intersectionSize++;
		}
	}

	const score = (2.0 * intersectionSize) / (first.length + second.length - 2);
    
    if (score >= 0.7 && !isAddress) {
        return score;
    }
	const firstLower = first.toLowerCase()
	const secondLower = second.toLowerCase()
	if (firstLower.includes(secondLower) || secondLower.includes(firstLower)) {
	    return isAddress ? 2 : 0.7;
	}
	return score;
}

function bfs(matches) {
    let groups = [];
    let visited = new Set([]);
    for (let k in matches) {
        let res = new Set([]);
        let queue = [];
        for (let v of matches[k]) {
            if (!(visited.has(`${k},${v}`))) {
                queue.push([parseInt(k), v])
            }
        }
        while (queue.length) {;
            let curr = queue.shift();
            let a = curr[0];
            let b = curr[1];
            let curr_str = `${a},${b}`;
            if (!(visited.has(curr_str))) {
                res.add(a);
                res.add(b);
                visited.add(curr_str);
                visited.add(`${b},${a}`)
                for (let c of matches[b]) {
                    queue.push([b, c]);
                }
            }
        }
        if (res.size) {
            groups.push(res)
        }
    }
    return groups;
}

async function checkItemInDynamo(PK, SK) {
    // try {
    //     let biz = await API.graphql(graphqlOperation(
    //         getBusinessExists, { PK: PK, SK: { beginsWith: SK }, limit: 200 }
    //     ));
    //     return biz.data.listFeastItems.items.length;
    // } catch (e) {
    //     console.log('Fetch Dynamo business data error', e)
    // }
    return false;
}

function comparePlaces(item, place) {
    const nameSim = compareTwoStrings(item.name, place.name, false);
    const itemLat = item.location.lat;
    const itemLng = item.location.lng;
    const placeLat = place.geometry.location.lat;
    const placeLng = place.geometry.location.lng;
    const dist = coordinateDistance(itemLat, itemLng, placeLat, placeLng);
    const distSim = dist == 0 ? 2 : 0.1 / dist;
    const itemAddress = item.location.address;
    const placeAddress = place.formatted_address;
    const addressSim = compareTwoStrings(itemAddress, placeAddress, true);

    const score = 0.5*nameSim + 0.3*Math.min(1, distSim) + 0.3*addressSim;
    // console.log(item)
    // console.log(place)
    // console.log(score)
    return score;
}