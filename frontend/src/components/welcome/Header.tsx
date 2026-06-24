import logo from "../../assets/gymodoro-logo.png"

export default function Header() {
  return (
    <header className="w-full bg-background py-0">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-start">
          <img
            src={logo}
            alt="Gymodoro Logo"
            className="w-60 h-auto object-contain"
          />
          <div className="flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              GYMODORO
            </h1>
            <p className="mt-3 text-2xl md:text-4xl text-muted-foreground">
              Work out while you study.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}