import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function Narrative() {
  const storyPoints = [
    {
      title: "🍅 1. The Pomodoro Technique",
      description: (
        <>
          <p className="mb-2">
            The pomodoro technique is a popular productivity method and increases productivity and focus by about 20% to 25% if used correctly.
          </p>

          <ul className="list-none space-y-2 text-sm text-muted-foreground">
            <li>🎯 <strong>Pick a single task</strong> to focus on.</li>
            <li>🍅 <strong>Work blocks:</strong> 25 mins of zero distraction.</li>
            <li>🛑 <strong>Cooldown:</strong> Stop instantly when the timer rings.</li>
          </ul>
        </>
      ),
      imageUrl: "https://images.squarespace-cdn.com/content/v1/656f4e4dababbd7c042c4946/c3a0d793-4375-4742-ac63-b0f92e498343/pomodoro+technique-3x2.jpg",
      imageAlt: "Tomato kitchen timer",
    },
    {
      title: "📱 2. The Break Problem",
      description: (
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider block mb-1 text-destructive">
              During the 5-minute break:
            </span>
            <ul className="list-none space-y-1">
              <li>• People ofthen have no planned activity was scheduled.</li>
              <li>• People often picked up their phones.</li>
              <li>• Social media or videos extended beyond 5 minutes.</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-border/50">
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider block mb-1 text-destructive">
              Result:
            </span>
            <ul className="list-none space-y-1">
              <li>• Breaks became long distractions instead of refreshing pauses.</li>
              <li>• People remained sedentary and inactive throughout the day.</li>
              <li>• Productivity and well-being both suffered.</li>
            </ul>
          </div>
        </div>
      ),
      imageUrl: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=600&q=80",
      imageAlt: "Smartphone screen glowing",
    },
    {
      title: "💪 3. The Gymodoro Active Reset",
      description: (
        <ul className="list-none space-y-2 text-sm text-muted-foreground">
          <li>🏃‍♂️ <strong>Healthy Breaks:</strong> Replaces screen time with movement.</li>
          <li>⚡ <strong>Energy Boost:</strong> Desk exercises, stretches, or quick sets.</li>
          <li>🧠 <strong>Longer Focus:</strong> Keeps your body fresh and mind sharp.</li>
        </ul>
      ),
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
      imageAlt: "Gym cross-training weights",
    },
  ];

  return (
    <section className="pt-0 pb-12 px-4 md:px-8 w-full bg-background">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {storyPoints.map((point, index) => (
          <Card key={index} className="flex flex-col border-2 overflow-hidden shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            {/* Image Container */}
            <div className="w-full h-44 bg-muted relative border-b-2">
              <img 
                src={point.imageUrl} 
                alt={point.imageAlt} 
                className="w-full h-full object-cover opacity-90 dark:opacity-80"
              />
            </div>
            
            {/* Content Container */}
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-xl font-bold tracking-tight">
                {point.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 flex-1">
              {point.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}