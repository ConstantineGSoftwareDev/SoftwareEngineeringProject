
type GoogleMapsDirectionsProps = {
    location: string;
  };
  
  export default function GoogleMapsDirections({
    location,
  }: GoogleMapsDirectionsProps) {
    if (!location.trim()) {
      return null;
    }
  
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
  
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Get Directions
      </a>
    );
  }
  