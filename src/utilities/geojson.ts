function extractCoordinates(geometry: any): [number, number][] {
  if (!geometry) return [];
  const coords: [number, number][] = [];
  const type = geometry.type;

  switch (type) {
    case 'Point':
      coords.push(geometry.coordinates as [number, number]);
      break;
    case 'MultiPoint':
    case 'LineString':
      // geometry.coordinates is an array of points
      geometry.coordinates.forEach((point: any) => {
        coords.push(point as [number, number]);
      });
      break;
    case 'MultiLineString':
    case 'Polygon':
      // geometry.coordinates is an array of arrays of points
      geometry.coordinates.forEach((line: any) => {
        line.forEach((point: any) => {
          coords.push(point as [number, number]);
        });
      });
      break;
    case 'MultiPolygon':
      // geometry.coordinates is an array of arrays of arrays of points
      geometry.coordinates.forEach((polygon: any) => {
        polygon.forEach((line: any) => {
          line.forEach((point: any) => {
            coords.push(point as [number, number]);
          });
        });
      });
      break;
    case 'GeometryCollection':
      // For geometry collections, recursively extract from each geometry.
      geometry.geometries.forEach((geom: any) => {
        coords.push(...extractCoordinates(geom));
      });
      break;
    default:
      console.warn('Unsupported geometry type:', type);
  }
  return coords;
}

export function getGeoJSONCenter(geojson: any): [number, number] {
  // Recursively extract all coordinate pairs from a geometry.

  // Gather coordinates from the GeoJSON input.
  let allCoords: [number, number][] = [];

  if (geojson.type === 'FeatureCollection') {
    geojson.features.forEach((feature: any) => {
      if (feature.geometry) {
        allCoords.push(...extractCoordinates(feature.geometry));
      }
    });
  } else if (geojson.type === 'Feature') {
    if (geojson.geometry) {
      allCoords = extractCoordinates(geojson.geometry);
    }
  } else if (geojson.type && geojson.coordinates) {
    // Assume it is a raw Geometry object.
    allCoords = extractCoordinates(geojson);
  } else {
    console.warn('Invalid GeoJSON input');
  }

  if (allCoords.length === 0) {
    return [-2.6000285, 118.015776];
  }

  // Option 1: Compute the arithmetic mean of all coordinates.
  const sum = allCoords.reduce((acc, [lon, lat]) => ({ lon: acc.lon + lon, lat: acc.lat + lat }), {
    lon: 0,
    lat: 0,
  });
  return [sum.lat / allCoords.length, sum.lon / allCoords.length];

  // Option 2: Compute the center of the bounding box (uncomment to use this method).
  // const lons = allCoords.map(([lon]) => lon);
  // const lats = allCoords.map(([, lat]) => lat);
  // const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  // const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  // return [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
}
