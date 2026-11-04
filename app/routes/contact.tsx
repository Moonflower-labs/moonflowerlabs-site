import { useState } from "react";
import { href, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildMeta } from "@/lib/meta";

const labelStyle = "flex flex-col gap-2 text-sm font-medium";
const fieldStyle = "h-11 text-base md:text-base";

export function meta() {
  return buildMeta({
    path: href("/contact"),
    title: "Contact | Moonflower Labs",
    description: "Tell Moonflower Labs what you’re working on, even if it’s only an idea.",
  });
}

export default function Contact() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setHasError(false);
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        navigate(href("/thanks")); // Redirect to thank you page
      } else {
        console.error("Form submission error", response);
        setHasError(true);
      }
    } catch (error) {
      console.error("Error submitting the form", error);
      setHasError(true);
    } finally {
      setIsSubmitting(false); // Reset submitting state after the API call
    }
  };

  return (
    <div className="page-width grid gap-12 pt-10 pb-20 md:pt-16 md:pb-28 lg:grid-cols-2 lg:gap-16">
      <div>
        <h1 className="text-display text-balance">What are you working on?</h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground md:text-xl">
          Tell us about it, even if it’s only an idea. We’ll read it and get back to you.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl bg-card p-6 md:p-8">
        <input type="hidden" name="access_key" value={"3ae5d6c2-8fe6-4eb6-896a-c5c7764d7a18"} />
        {/* Honeypot Spam Protection  */}
        <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelStyle}>
            Name
            <Input type="text" name="name" autoComplete="name" className={fieldStyle} required />
          </label>
          <label className={labelStyle}>
            Email
            <Input type="email" name="email" autoComplete="email" className={fieldStyle} required />
          </label>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelStyle}>
            Phone (optional)
            <Input type="tel" name="phone" autoComplete="tel" className={fieldStyle} />
          </label>
          <label className={labelStyle}>
            Subject
            <Input type="text" name="subject" className={fieldStyle} required />
          </label>
        </div>
        <label className={labelStyle}>
          Message
          <Textarea name="message" className="min-h-36 text-base md:text-base" required />
        </label>
        {hasError && (
          <p role="alert" className="text-sm text-destructive">
            Your message wasn’t sent. Check your connection and try again.
          </p>
        )}
        <Button className="h-12 w-full px-6 text-base font-semibold sm:w-fit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </form>
    </div>
  );
}
