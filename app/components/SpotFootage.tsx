export default function SpotFootage() {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-start bg-black pt-8">
            {/* Film camera header */}
            <div className="flex flex-col items-center w-full mb-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-white mb-2"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v6m0-6h2.25A2.25 2.25 0 0120 11.25v1.5A2.25 2.25 0 0117.75 15H16.5m-7.5-6v6m0-6H6.75A2.25 2.25 0 004.5 11.25v1.5A2.25 2.25 0 006.75 15H8.25m8.25 0v2.25A2.25 2.25 0 0114.25 19.5h-4.5A2.25 2.25 0 017.5 17.25V15"
                    />
                </svg>
                <span className="text-white text-lg font-semibold">Videos</span>
            </div>

            {/* Horizontally scrollable videos */}
            <div className="w-full overflow-x-auto flex space-x-4 px-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <video
                        key={i}
                        controls
                        className="max-h-[30vh] rounded shadow min-w-[300px] bg-gray-900"
                    >
                        <source src={`/example-video${i}.mp4`} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ))}
            </div>

            {/* Photos section */}
            <div className="w-full flex flex-col items-center">
                <span className="text-white text-lg font-semibold mb-2">Photos</span>
                <div className="flex flex-wrap justify-center gap-4 px-4">
                    {[1, 2, 3].map((i) => (
                        <img
                            key={i}
                            src={`/example-photo${i}.jpg`}
                            alt={`Spot ${i}`}
                            className="max-h-[25vh] rounded shadow bg-gray-900"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}