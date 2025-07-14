import { SkateSpot, SkateSpotVideo } from "@/app/utils/firestore";
import { useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

export default function SpotFootage({ spot }: { spot: SkateSpot }) {
  if (!spot) return <div className="text-white">Spot not found.</div>;

  const [enlargedImg, setEnlargedImg] = useState<null | string>(null);

  // media is now an array of objects: { thumbnailUrl, videoUrl, name }
  const videos: SkateSpotVideo[] = (spot.media || []).filter(
    (item) => item.videoUrl,
  );

  // Use the new 'photos' field for images
  const images = (spot.photos || []).filter((url) => url.includes("/image/"));

  return (
    <div className="w-full h-screen flex flex-col items-center justify-start bg-gradient-to-b from-black via-gray-900 to-black pt-8 px-2">
      {/* Videos */}
      {videos.length > 0 && (
        <div className="w-full mb-10">
          <div className="flex items-center mb-2">
            <svg
              className="w-6 h-6 text-lime-400 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
              />
            </svg>
            <span className="text-white text-lg font-semibold">Videos</span>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2">
            {videos.map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <video
                  controls
                  poster={item.thumbnailUrl}
                  className="rounded shadow min-w-[320px] max-w-[90vw] max-h-[30vh] bg-gray-900 border border-gray-700"
                >
                  <source src={item.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {item.name && (
                  <span className="text-xs text-gray-400 mt-1">
                    🎥 {item.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos */}
      {/* Enlarged Image Modal */}
      {enlargedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setEnlargedImg(null)}
        >
          <Zoom>
            <img
              src={enlargedImg}
              alt="Enlarged photo"
              className="max-w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl border-4 border-blue-400 bg-white"
            />
          </Zoom>
        </div>
      )}
      {images.length > 0 && (
        <div className="w-full mb-10">
          <div className="flex items-center mb-2">
            <svg
              className="w-6 h-6 text-yellow-300 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4-4a3 3 0 014 0l4 4M4 8h16M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2"
              />
            </svg>
            <span className="text-white text-lg font-semibold">Photos</span>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-2">
            {images.map((imageUrl, i) => (
              <img
                key={i}
                src={imageUrl}
                alt={`Skate spot photo ${i + 1}`}
                className="rounded shadow min-w-[220px] max-w-[90vw] max-h-[25vh] object-cover border border-gray-700"
                onClick={() => setEnlargedImg(imageUrl)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show message if no media */}
      {videos.length === 0 && images.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-white text-center mt-12">
          <svg
            className="w-16 h-16 text-gray-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 21m5.25-4l.75 4m-7.5-8.25A7.5 7.5 0 1119.5 12a7.5 7.5 0 01-15 0z"
            />
          </svg>
          <p className="text-lg font-semibold">
            No media available for this spot
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Check back later for videos or photos!
          </p>
        </div>
      )}
    </div>
  );
}
