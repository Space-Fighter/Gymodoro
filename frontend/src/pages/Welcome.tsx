import Header from "../components/welcome/Header";
import { Narrative } from "../components/welcome/Narrative";

export default function Welcome() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <Narrative />
    </main>
  );
}