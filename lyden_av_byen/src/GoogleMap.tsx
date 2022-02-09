import React, {useRef, useEffect, useState} from 'react';
import {Wrapper, Status} from '@googlemaps/react-wrapper';

const mapsApiKey = 'AIzaSyDYEKzPQ9A2UPgewV3UCsZlxnqLBWe6BPE';

const Map: React.FC<{}> = () => {

    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map>();
    const [center, setCenter] = useState<google.maps.LatLngLiteral>();
    const [zoom, setZoom] = useState<number>(0);
    const mapOptions = {
        zoom: 8,
        center: { lat: -34.397, lng: 150.644 },
      };

    useEffect(() => {
    if (ref.current && !map) {
        setMap(new window.google.maps.Map(ref.current, mapOptions));
    }
    }, [ref, map, zoom, center]);

    return <div ref={ref} id="map" style={{ width: '100%', height: '100%', overflow: "visible" }}/>
};

const MapWrapper = () => {
    const render = (status: Status) => {
        return <div>{status}</div>
    }
    return (<div style={{ width: '100%', height: '100vh', overflow: "visible" }}>
        <Wrapper apiKey={mapsApiKey} render={render}>
            <Map/>
        </Wrapper>
    </div>);
};

export default MapWrapper;
