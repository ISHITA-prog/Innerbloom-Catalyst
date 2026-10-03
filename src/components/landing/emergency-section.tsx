import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Phone, MessageSquare, Heart } from "lucide-react";

export const EmergencySection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-primary/5 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-72 h-72 bg-destructive/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <Card className="glass border-primary/20 max-w-4xl mx-auto">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Emergency <span className="text-destructive font-kalam">Safety Net</span>
            </h2>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              In crisis? Help is always one click away. You're never alone, even in your darkest moments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                size="lg"
                variant="destructive"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-glow"
              >
                <AlertCircle className="mr-2 w-5 h-5" />
                🔴 Panic Button
              </Button>
              
              <div className="text-muted-foreground font-medium">
                Available 24x7
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Crisis Hotline</h3>
                <p className="text-sm text-muted-foreground">
                  Call <span className="font-bold text-primary">14416</span> or <span className="font-bold text-primary">18008914416</span> for immediate connection to crisis counselors
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Emergency Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Text-based crisis support available instantly
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Peer Support</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with trained peer counselors
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary/5 rounded-xl">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Remember:</strong> Seeking help is a sign of strength, not weakness. 
                Our community and professional network are here to support you through any crisis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};