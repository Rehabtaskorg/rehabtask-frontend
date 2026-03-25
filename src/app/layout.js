import RecaptchaProvider from "@/components/providers/RecaptchaProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";

export const metadata = {
  title: {
    template: "%s | RehabTask",
    default: "RehabTask",
  },
  description: "Connect with licensed rehabilitation therapists for personalized care."
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <QueryProvider>
            <RecaptchaProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </RecaptchaProvider>
          </QueryProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
