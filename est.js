mapboxgl.accessToken = 'pk.eyJ1IjoibGFoaWIiLCJhIjoiY2wxNjVyYjIzMGN1MDNiczFrNG9zN3NtMiJ9.UfUfc7TuGn_azSRThxsh-g';
const bounds = [
	[1.52410, 48.15295], // Southwest coordinates
	[3.50049, 49.21965] // Northeast coordinates
];
const map = new mapboxgl.Map({
	container: 'map', // Specify the container ID
	style: 'mapbox://styles/mapbox/streets-v11', // Specify which map style to use
	center: [2.48610, 48.71326], // Specify the starting position [lng, lat]
	zoom: 7.5, // Specify the starting zoom
	minZoom: 7.5,
	maxBounds: bounds
});

const directions = new MapboxDirections({
	accessToken: mapboxgl.accessToken,
	unit: 'metric',
	profile: 'mapbox/driving',
	alternatives: false,
	geometries: 'geojson',
	controls: { instructions: false },
	flyTo: false
});
document.getElementById('dir').appendChild(directions.onAdd(map));

//map.addControl(directions, 'top-right');
map.scrollZoom.enable();

const clearances = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [-84.47426, 38.06673]
			},
			properties: {
				clearance: "13' 2"
			}
		},
		{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [-84.47208, 38.06694]
			},
			properties: {
				clearance: "13' 7"
			}
		},
		{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [-84.60485, 38.12184]
			},
			properties: {
				clearance: "13' 7"
			}
		},
		{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [-84.61905, 37.87504]
			},
			properties: {
				clearance: "12' 0"
			}
		},
		{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [-84.55946, 38.30213]
			},
			properties: {
				clearance: "13' 6"
			}
		},
		{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [-84.27235, 38.04954]
			},
			properties: {
				clearance: "13' 6"
			}
		},
		{
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [-84.27264, 37.82917]
			},
			properties: {
				clearance: "11' 6"
			}
		}
	]
};

const obstacle = turf.buffer(clearances, 0.25, { units: 'kilometers' });
let bbox = [0, 0, 0, 0];
let polygon = turf.bboxPolygon(bbox);

map.on('load', () => {
	map.addLayer({
		id: 'clearances',
		type: 'fill',
		source: {
			type: 'geojson',
			data: obstacle
		},
		layout: {},
		paint: {
			'fill-color': '#f03b20',
			'fill-opacity': 0.5,
			'fill-outline-color': '#f03b20'
		}
	});

	map.addSource('theRoute', {
		type: 'geojson',
		data: {
			type: 'Feature'
		}
	});

	map.addLayer({
		id: 'theRoute',
		type: 'line',
		source: 'theRoute',
		layout: {
			'line-join': 'round',
			'line-cap': 'round'
		},
		paint: {
			'line-color': '#cccccc',
			'line-opacity': 0.5,
			'line-width': 13,
			'line-blur': 0.5
		}
	});

	// Source and layer for the bounding box
	map.addSource('theBox', {
		type: 'geojson',
		data: {
			type: 'Feature'
		}
	});
	map.addLayer({
		id: 'theBox',
		type: 'fill',
		source: 'theBox',
		layout: {},
		paint: {
			'fill-color': '#FFC300',
			'fill-opacity': 0.5,
			'fill-outline-color': '#FFC300'
		}
	});
});

let counter = 0;
const maxAttempts = 50;
let emoji = '';
let collision = '';
let detail = '';
const reports = document.getElementById('reports');

function addCard(id, element, clear, detail) {
	const card = document.createElement('div');
	card.className = 'card';
	// Add the response to the individual report created above
	const heading = document.createElement('div');
	// Set the class type based on clear value
	heading.className =
		clear === true
			? 'card-header route-found'
			: 'card-header obstacle-found';
	heading.innerHTML =
		id === 0
			? `${emoji} The route ${collision}`
			: `${emoji} Route ${id} ${collision}`;

	const details = document.createElement('div');
	details.className = 'card-details';
	details.innerHTML = `This ${detail} obstacles.`;

	card.appendChild(heading);
	card.appendChild(details);
	element.insertBefore(card, element.firstChild);
}

function noRoutes(element) {
	const card = document.createElement('div');
	card.className = 'card';
	// Add the response to the individual report created above
	const heading = document.createElement('div');
	heading.className = 'card-header no-route';
	emoji = '🛑';
	heading.innerHTML = `${emoji} Ending search.`;

	// Add details to the individual report
	const details = document.createElement('div');
	details.className = 'card-details';
	details.innerHTML = `No clear route found in ${counter} tries.`;

	card.appendChild(heading);
	card.appendChild(details);
	element.insertBefore(card, element.firstChild);
}

directions.on('clear', () => {
	map.setLayoutProperty('theRoute', 'visibility', 'none');
	map.setLayoutProperty('theBox', 'visibility', 'none');

	counter = 0;
	reports.innerHTML = '';
});

directions.on('route', (event) => {
	// Hide the route and box by setting the opacity to zero
	map.setLayoutProperty('theRoute', 'visibility', 'none');
	map.setLayoutProperty('theBox', 'visibility', 'none');

	if (counter >= maxAttempts) {
		noRoutes(reports);
	} else {
		// Make each route visible
		for (const route of event.route) {
			// Make each route visible
			map.setLayoutProperty('theRoute', 'visibility', 'visible');
			map.setLayoutProperty('theBox', 'visibility', 'visible');

			// Get GeoJSON LineString feature of route
			const routeLine = polyline.toGeoJSON(route.geometry);

			// Create a bounding box around this route
			// The app will find a random point in the new bbox
			bbox = turf.bbox(routeLine);
			polygon = turf.bboxPolygon(bbox);

			// Update the data for the route
			// This will update the route line on the map
			map.getSource('theRoute').setData(routeLine);

			// Update the box
			map.getSource('theBox').setData(polygon);

			const clear = turf.booleanDisjoint(obstacle, routeLine);

			if (clear === true) {
				var distance = route.distance * 0.001;
				var duration = route.duration / 60;
				var x = distance;
				function flouse(x) {
					if (x > 0 & x < 18) {
						return 35;
					} else if (x >= 18 & x < 19) {
						return 37;//
					} else if (x >= 19 & x < 20) {
						return 38;//
					} else if (x >= 20 & x < 21) {
						return 42;//
					} else if (x >= 21 & x < 22) {
						return 43;//
					} else if (x >= 22 & x < 23) {
						return 45;//
					} else if (x >= 23 & x < 24) {
						return 47;
					} else if (x >= 24 & x < 25) {
						return 50;
					} else if (x >= 25 & x < 26) {
						return 51;
					} else if (x >= 26 & x < 27) {
						return 53;//
					} else if (x >= 27 & x < 28) {
						return 54;//
					} else if (x >= 28 & x < 29) {
						return 56;
					} else if (x >= 29 & x < 30) {
						return 57;
					} else if (x >= 30) {
						return 0;
					}

				}

				var money = flouse(x);

				document.getElementById('dis').innerHTML = distance.toFixed(2) + ' Km';
				document.getElementById('tmp').innerHTML = duration.toFixed(2) + ' Min';

				if (money == 0) {
					document.getElementById('m').innerHTML = "Tarif donner sur place!";
					document.getElementById('tf').value = "Tarif donner sur place!";
				} else {
					document.getElementById('m').innerHTML = money + ' €';
					document.getElementById('tf').value = money + ' €';
				}
				
				document.getElementById('d').value = distance.toFixed(2) + ' Km';
				document.getElementById('t').value = duration.toFixed(2) + ' Min';
				collision = 'does not intersect any obstacles!';
				detail = `takes ${(route.duration / 60).toFixed(0)} minutes and ${(route.distance * 0.001).toFixed(0)} Km and avoids`;
				emoji = '✔️';
				map.setPaintProperty('theRoute', 'line-color', '#74c476');
				// Hide the box
				map.setLayoutProperty('theBox', 'visibility', 'none');
				// Reset the counter
				counter = 0;
			} else {
				// Collision occurred, so increment the counter
				counter = counter + 1;
				// As the attempts increase, expand the search area
				// by a factor of the attempt count
				polygon = turf.transformScale(polygon, counter * 0.01);
				bbox = turf.bbox(polygon);
				collision = 'is bad.';
				detail = `takes ${(route.duration / 60).toFixed(
					0
				)} minutes and hits`;
				emoji = '⚠️';
				map.setPaintProperty('theRoute', 'line-color', '#de2d26');

				// Add a randomly selected waypoint to get a new route from the Directions API
				const randomWaypoint = turf.randomPoint(1, { bbox: bbox });
				directions.setWaypoint(
					0,
					randomWaypoint['features'][0].geometry.coordinates
				);
			}
			// Add a new report section to the sidebar
			addCard(counter, reports, clear, detail);
		}
	}
});
;


const btn = document.querySelector(".submit-btn");

btn.addEventListener("click", () => {
	alert("Reservation réussi Notre chauffeur va vous contacter")
})