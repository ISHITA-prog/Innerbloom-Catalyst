import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    age: 24,
    location: "College Student",
    avatar: "SM",
    rating: 5,
    quote: "I finally found someone who didn't just say 'stay strong' but truly understood what I was going through. The anxiety matching feature connected me with someone who had similar triggers.",
    concern: "Anxiety & Depression"
  },
  {
    name: "Alex K.",
    age: 28,
    location: "Software Developer",
    avatar: "AK",
    rating: 5,
    quote: "The journaling activities we do together have been game-changing. It's like having a friend who gets it and wants to grow with you.",
    concern: "Work Stress & Burnout"
  },
  {
    name: "Jamie L.",
    age: 19,
    location: "University Student",
    avatar: "JL",
    rating: 5,
    quote: "Being able to stay anonymous while still forming real connections was exactly what I needed. The safety features made me feel secure to open up.",
    concern: "Social Anxiety"
  },
  {
    name: "Morgan T.",
    age: 32,
    location: "Parent",
    avatar: "MT",
    rating: 5,
    quote: "The 24/7 support saved me during my darkest moments. Having both peer support and access to professionals made all the difference.",
    concern: "Postpartum Depression"
  },
  {
    name: "River P.",
    age: 26,
    location: "Artist",
    avatar: "RP",
    rating: 5,
    quote: "The virtual activities like mindful walks and creative sessions helped me connect with others who share similar struggles and interests.",
    concern: "Creative Block & Depression"
  },
  {
    name: "Casey N.",
    age: 22,
    location: "Graduate Student",
    avatar: "CN",
    rating: 5,
    quote: "The emotional monitoring helped me understand my patterns better, and my peer buddy helped me work through them in real-time.",
    concern: "Panic Disorder"
  }
];

export const CommunityVoices = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-primary/10 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Community <span className="text-primary font-kalam">Voices</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real stories from people who found their support network through InnerBloom
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.age} • {testimonial.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                <blockquote className="text-foreground italic mb-4 flex-grow">
                  "{testimonial.quote}"
                </blockquote>

                <div className="mt-auto">
                  <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {testimonial.concern}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Join 1,000+ Members Who Found Their Support Network
            </h3>
            <p className="text-muted-foreground mb-6">
              Every connection starts with someone brave enough to reach out. Your story matters, and there's someone waiting to understand it.
            </p>
            <div className="flex items-center justify-center gap-8 text-muted-foreground">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50k+</div>
                <div className="text-sm">Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm">Feel Supported</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};