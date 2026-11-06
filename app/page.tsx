export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold text-foreground">
        GrizzHacks Secret Santa
      </h1>
      <p className="mt-4 max-w-md text-zinc-500 dark:text-zinc-400">
        You should have received a link with your name in it. Open that link to
        see who you&apos;re buying a gift for!
      </p>
    </div>
  );
}
