import { useState } from "react";
import { formatShortDate } from "../../utils/formatDate";
import {
  artworkCardStyles,
  artworkGridStyles,
  artworkImageStyles,
  emptyTextStyles,
} from "../../utils/styles";

function ArtworkCard({ artwork }) {
  const [failedToLoad, setFailedToLoad] = useState(false);

  return (
    <div className={artworkCardStyles}>
      {failedToLoad ? (
        <div className="w-full h-32 flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
          Failed to load image
        </div>
      ) : (
        <img
          src={artwork.imageUrl}
          alt={`Artwork ${artwork.fileName || artwork.id}`}
          className={artworkImageStyles}
          loading="lazy"
          decoding="async"
          onError={() => setFailedToLoad(true)}
        />
      )}
      <p className="text-xs text-gray-600 mt-1">
        {formatShortDate(artwork.createdAt)}
      </p>
    </div>
  );
}

export default function ArtworkGrid({ artworks, emptyMessage }) {
  if (artworks.length === 0) {
    return <p className={emptyTextStyles}>{emptyMessage}</p>;
  }

  return (
    <div className={artworkGridStyles}>
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
