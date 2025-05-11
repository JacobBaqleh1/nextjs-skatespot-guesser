import { useState } from "react";

export default function Popup({ children }: { children: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative ">
            {/* popup window */}
            <div className={`bg-red-200 h-screen absolute top-0 left-0 w-full transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"
                }`}>
                {children}
            </div>
            <button
                className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-200"
                onClick={() => setIsVisible(!isVisible)}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 9l10.5-4.5m0 0L15 15m4.5-10.5V15m0 0L9 19.5M15 15l-6 4.5M9 9v10.5m0 0L3 15V4.5l6 4.5z"
                    />
                </svg>
            </button>
        </div>
    )
}