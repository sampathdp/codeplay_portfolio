import ScrollToTop from '../ScrollToTop';

export default function ScrollToTopExample() {
  return (
    <div className="h-[200vh] p-8">
      <p className="text-center text-muted-foreground">Scroll down to see the button appear</p>
      <ScrollToTop />
    </div>
  );
}
