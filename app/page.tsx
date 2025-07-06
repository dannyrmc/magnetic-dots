import InteractiveDots from "@/app/components/interactive-dots";

export default function Home() {
  return (
    <div className="flex h-svh w-full justify-center items-center">
      <main className="flex w-full justify-center items-center">
        <div className="relative mb-4 w-[500px] h-[224px]">
          <InteractiveDots />
        </div>
      </main>
    </div>
  );
}
