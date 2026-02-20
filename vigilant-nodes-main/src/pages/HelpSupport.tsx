import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle, Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const faqs = [
  { q: "What is money muling?", a: "Money muling involves using bank accounts to transfer illegally obtained money. Criminals recruit people (mules) to move funds through their accounts to obscure the money trail." },
  { q: "How does the detection engine work?", a: "Our engine analyzes transaction patterns using graph theory. It detects cycles, smurfing (fan-in/fan-out patterns), and layering chains to identify suspicious activity." },
  { q: "What CSV format is required?", a: "Your CSV must contain these columns: transaction_id, sender_id, receiver_id, amount, timestamp. Each row represents a single transaction." },
  { q: "Is my data stored anywhere?", a: "No. All analysis is performed locally in your browser. Your transaction data never leaves your device." },
  { q: "What do the suspicion scores mean?", a: "Scores range from 0-100. Cycle involvement adds +40, smurfing +30, layering +20, and multiple pattern involvement adds +10 bonus. Scores ≥70 are considered high risk." },
];

const HelpSupport = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitted(true);
    toast.success("Your query has been submitted successfully!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-mono text-foreground">Help & Support</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <CheckCircle2 className="w-12 h-12 text-success" />
                <p className="text-foreground font-medium">Message Sent!</p>
                <p className="text-sm text-muted-foreground text-center">
                  We'll get back to you within 24 hours.
                </p>
                <Button variant="outline" onClick={() => { setSubmitted(false); setName(""); setEmail(""); setSubject(""); setMessage(""); }}>
                  Send Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-mono">Name *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-secondary/30" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-mono">Email *</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="bg-secondary/30" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-mono">Subject</label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What is this about?" className="bg-secondary/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-mono">Message *</label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue or question..." rows={4} className="bg-secondary/30" />
                </div>
                <Button type="submit" className="w-full font-mono glow-primary">
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> Get In Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-xs text-muted-foreground">support@muledetect.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Phone</p>
                  <p className="text-xs text-muted-foreground">+91 1800-XXX-XXXX (Toll Free)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Address</p>
                  <p className="text-xs text-muted-foreground">Cyber Tower, Hitech City, Hyderabad 500081</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> FAQs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-border/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-secondary/30 transition-colors flex items-center justify-between"
                  >
                    <span>{faq.q}</span>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2" />
                  </button>
                  {expandedFaq === i && (
                    <div className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
