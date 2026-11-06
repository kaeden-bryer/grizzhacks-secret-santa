import { Scene } from "@/components/santa";
import s from "@/components/santa/santa.module.css";

export default function Home() {
  return (
    <Scene>
      <main className={s.stage}>
        <div className={s.column}>
          <h3 className="text-3xl font-bold text-foreground">
            Psst... navigate to /[your-first-name]!
          </h3>
        </div>
      </main>
    </Scene>
  );
}
