import Link from "next/link";


export default function Home() {
  return (
    <div className="h-screen justify-center items-center flex"
    >
      <Link href='/dashboard/game' className="text-lime-500 text-4xl border-2 border-lime-500 p-10">
        PLAY
      </Link>
    </div>
  );
}
