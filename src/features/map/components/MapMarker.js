import React, { useMemo } from "react";
import { Marker, Popup, useMap } from "react-leaflet"; 
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PlaceIcon from "@mui/icons-material/Place"; 
import { renderToString } from "react-dom/server";
import MapPopupContent from "./MapPopup"; 

const createLeafletIcon = (property, isSelected) => {
  let iconColor;
  let iconSize = isSelected ? 38 : 30; 

  if (isSelected) {
    iconColor = "#E91E63"; 
  } else {
    iconColor = "#1976D2"; 
    
  }

  const iconHtml = renderToString(
    <PlaceIcon
      style={{
        fontSize: `${iconSize}px`,
        color: iconColor,
      }}
    />
  );

  return L.divIcon({
    html: iconHtml,
    className: "custom-leaflet-div-icon",
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize],
    popupAnchor: [0, -iconSize + iconSize / 4],
  });
};


const MapMarker = ({ property, isSelected, onClick }) => {
  const map = useMap(); // Get map instance for flyTo

  
  const position = property?.position;

  
  const icon = useMemo(() => {
    return createLeafletIcon(property, isSelected);
  }, [property, isSelected]);

  if (
    !position ||
    typeof position.lat !== "number" ||
    typeof position.lng !== "number"
  ) {
    console.warn(
      `MapMarker: Skipping marker for property ID ${property?._id} due to invalid or missing position. Position:`,
      position,
      "Property:",
      property
    );
    return null;
  }

  const handleMarkerClick = () => {
    if (onClick) {
      onClick(property); 
    }
    
    map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 15), {
      animate: true,
      duration: 0.8,
    });
  };

  return (
    <Marker
      position={[position.lat, position.lng]} 
      icon={icon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
      zIndexOffset={isSelected ? 1000 : 0} 
    >
      {/* The MapPopup component will be rendered by PropertyInfoPanel or similar, not directly here for this design
          If you want a direct leaflet popup on click without the panel, you can add it here.
          For now, clicking selects it, and PropertyInfoPanel shows details.
      */}
      {/* Example of how you might use MapPopupContent if you want a direct Leaflet Popup */}
      {/* <Popup>
        <MapPopupContent property={property} onViewDetails={() => handleMarkerClick()} />
      </Popup> */}
    </Marker>
  );
};

export default MapMarker;
