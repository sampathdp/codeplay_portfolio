import { Brain, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import aiVisualization from '@assets/generated_images/AI_analytics_visualization_be61eb13.png';

export default function AISection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Brain className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">AI Innovation</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Empowering Businesses with AI Insights & Prediction Bots
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our AI systems forecast trends, analyze performance, and automate decisions. 
              From sales predictions to smart analytics, we give you the power to stay ahead.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Predictive Analytics</h3>
                  <p className="text-muted-foreground text-sm">
                    Forecast sales trends and market opportunities with machine learning models
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Automated Decision Making</h3>
                  <p className="text-muted-foreground text-sm">
                    Intelligent bots that analyze data and provide actionable recommendations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-md bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Performance Insights</h3>
                  <p className="text-muted-foreground text-sm">
                    Real-time dashboards that transform complex data into clear insights
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-xl" />
            <img
              src={aiVisualization}
              alt="AI Analytics Visualization"
              className="relative rounded-lg shadow-2xl"
              data-testid="img-ai-visualization"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
