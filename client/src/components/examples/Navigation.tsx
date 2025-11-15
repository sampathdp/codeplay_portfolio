import Navigation from '../Navigation';

export default function NavigationExample() {
  return (
    <div className="h-screen">
      <Navigation />
      <div className="pt-20 p-8">
        <p className="text-center text-muted-foreground">Scroll down to see the navigation background change</p>
      </div>
    </div>
  );
}
