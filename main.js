
import { Map, Popup, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setWorkerUrl(workerUrl);

const map = new Map({
  container: 'map',
  style: {
    version: 8,
    sources: {},
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': 'rgba(0,0,0,0)'
        }
      }
    ]
  },
  center: [0, 20],
  zoom: 1.2,
  minZoom: 0.8,
  maxZoom: 18,
  attributionControl: false
});

map.on('load', async () => {
  try {
    const response = await fetch('/land.geojson');

    if (!response.ok) {
      throw new Error('No s’ha pogut carregar land.geojson');
    }

    const land = await response.json();

    map.addSource('land', {
      type: 'geojson',
      data: land
    });

    map.addLayer({
      id: 'land-fill',
      type: 'fill',
      source: 'land',
      paint: {
        'fill-color': '#F6B26B',
        'fill-opacity': 1
      }
    });

    map.addLayer({
      id: 'land-outline',
      type: 'line',
      source: 'land',
      paint: {
        'line-color': '#E97400',
        'line-width': 0.8
      }
    });

    // Carregar les dades dels Països Catalans
    const ppccResponse = await fetch('/paisos-catalans.geojson');

    if (!ppccResponse.ok) {
      throw new Error('No s’ha pogut carregar paisos-catalans.geojson');
    }

    const ppccGeoJSON = await ppccResponse.json();

    // Conservar només els polígons, no els punts auxiliars
    ppccGeoJSON.features = ppccGeoJSON.features.filter(
      feature =>
        feature.geometry &&
        (
          feature.geometry.type === 'Polygon' ||
          feature.geometry.type === 'MultiPolygon'
        )
    );

    map.addSource('paisos-catalans', {
      type: 'geojson',
      data: ppccGeoJSON
    });

    map.addLayer({
      id: 'paisos-catalans-fill',
      type: 'fill',
      source: 'paisos-catalans',
      paint: {
        'fill-color': '#D95D39',
        'fill-opacity': 1
      }
    });



    // Etiqueta i canvi de color quan el ratolí passa per sobre
    const ppccPopup = new Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12
    });

    map.on('mouseenter', 'paisos-catalans-fill', (e) => {
      map.getCanvas().style.cursor = 'pointer';

      map.setPaintProperty(
        'paisos-catalans-fill',
        'fill-color',
        '#F28C68'
      );

      ppccPopup
        .setLngLat(e.lngLat)
        .setHTML(
          '<div style="font-family: sans-serif; font-size: 14px; font-weight: 600; color: #8F321F;">Països Catalans</div>'
        )
        .addTo(map);
    });

    map.on('mousemove', 'paisos-catalans-fill', (e) => {
      ppccPopup.setLngLat(e.lngLat);
    });

    map.on('mouseleave', 'paisos-catalans-fill', () => {
      map.getCanvas().style.cursor = '';

      map.setPaintProperty(
        'paisos-catalans-fill',
        'fill-color',
        '#D95D39'
      );

      ppccPopup.remove();
    });


    map.addLayer({
      id: 'paisos-catalans-outline',
      type: 'line',
      source: 'paisos-catalans',
      paint: {
        'line-color': '#A83D25',
        'line-width': 1
      }
    });

  } catch (error) {
    console.error('Error carregant el mapa:', error);
  }
});