import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import LocationMapMarker from './util/LocationMapMarker';
import AnimatedModal from './util/AnimatedModal';
import {
  colors, gradients, shadows, sizes, wp, hp,
} from '../../constants/theme';

const MapModal = ({
  visible, setVisible, userLat, userLng, userPic, place: { placeName, placeLat, placeLng },
}) => {
  const markers = [
    { name: 'CURRENT_USER', lat: userLat, lng: userLng },
    { name: placeName, lat: placeLat, lng: placeLng },
  ];

  const mapRef = useRef(null);
  const region = {
    latitude: userLat,
    longitude: userLng,
    latitudeDelta: 0.0461, // ~3.5 miles in height
    longitudeDelta: 0.02105,
  };

  const fitToMarkers = () => {
    mapRef.current.fitToSuppliedMarkers(markers.map(({ lat, lng }) => `${lat}${lng}`));
  };

  return (
    <AnimatedModal
      visible={visible}
      onBackdropPress={() => setVisible(false)}
      animationType="vertical"
      duration={1000}
      style={styles.modal}
    >
      <MapView
        style={[styles.map, shadows.base]}
        initialRegion={region}
        rotateEnabled={false}
        pitchEnabled={false}
        userInterfaceStyle="light"
        ref={mapRef}
        onMapReady={fitToMarkers}
      >
        {markers.map(({
          name, lat, lng,
        }) => {
          if (name === 'CURRENT_USER') {
            return (
              <Marker
                key={`${lat}${lng}`}
                identifier={`${lat}${lng}`}
                coordinate={{ latitude: lat, longitude: lng }}
              >
                <LocationMapMarker isUser userPic={userPic} name="Me" />
              </Marker>
            );
          }
          return (
            <Marker
              key={`${lat}${lng}`}
              identifier={`${lat}${lng}`}
              coordinate={{ latitude: lat, longitude: lng }}
            >
              <LocationMapMarker isUser={false} name={name} />
            </Marker>
          );
        })}
      </MapView>
    </AnimatedModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  map: {
    width: '90%',
    height: '60%',
    marginBottom: wp(18),
    borderRadius: sizes.radius * 2,
  },
});

export default MapModal;
